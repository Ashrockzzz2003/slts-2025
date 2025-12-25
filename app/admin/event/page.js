'use client';

import {
  Description,
  Dialog,
  DialogPanel,
  DialogTitle,
} from '@headlessui/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import secureLocalStorage from 'react-secure-storage';
import {
  getEventData,
  getJudgeEventData,
  updateCrieria,
} from '@/app/_util/data';
import { auth } from '@/app/_util/initApp';

export default function ManageEvents() {
  const router = useRouter();
  const [user, setUser] = useState({});
  const [data, setData] = useState(null);
  const [filteredData, setFilteredData] = useState(null);

  const [groups, setGroups] = useState([]);
  const [filterGroup, setFilterGroup] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [cIsOpen, setCIsOpen] = useState(false);
  const [eventNameBuffer, setEventNameBuffer] = useState('');
  const [criteriaBuffer, setCriteriaBuffer] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [copiedJudge, setCopiedJudge] = useState(null);

  useEffect(() => {
    if (!secureLocalStorage.getItem('user')) {
      router.push('/');
    }

    const user = JSON.parse(secureLocalStorage.getItem('user'));
    setUser(user);
    getEventData().then((_data) => {
      if (_data == null || _data.length != 2) {
        router.push('/');
      }

      setData(_data[0]);
      setFilteredData(_data[0]);
      setGroups(_data[1]);

      isLoading && setIsLoading(false);
    });
  }, [router, isLoading]);

  useEffect(() => {
    if (data) {
      setFilteredData(
        data.filter((row) => {
          return (
            (filterGroup == '' || row.group.includes(filterGroup)) &&
            (searchQuery == '' ||
              row.name.toLowerCase().includes(searchQuery.toLowerCase()))
          );
        }),
      );
    }
  }, [data, filterGroup, searchQuery]);

  const downloadFinalResults = async () => {
    if (!data || data.length === 0) return;

    const rows = [];

    // ---------- CSV escape ----------
    const esc = (v) => {
      if (v == null) return '';
      const s = String(v);
      return s.includes(',') || s.includes('\n') || s.includes('"')
        ? `"${s.replace(/"/g, '""')}"`
        : s;
    };

    // ---------- HEADER ----------
    rows.push([
      'Event Type',
      'Event Name',
      'Rank',
      'District',
      'Student / Group Members',
      'Student IDs',
      'Total Score',
    ]);

    // ---------- LOOP EVENTS ----------
    for (const event of data) {
      const isGroup = event.name.includes('GROUP');

      const result = await getJudgeEventData(event.name);
      if (!result || result.length !== 2) continue;

      const participants = result[0];
      const meta = result[1];

      const criteriaList = Object.keys(meta.evalCriteria);
      const judgeIds = meta.judgeIdList;

      // ===============================
      // INDIVIDUAL EVENTS
      // ===============================
      if (!isGroup) {
        participants.forEach((p) => {
          p.judgeWiseTotal = {};
          judgeIds.forEach((jid) => (p.judgeWiseTotal[jid] = 0));

          criteriaList.forEach((c) => {
            judgeIds.forEach((jid) => {
              const score = parseFloat(p.score?.[event.name]?.[jid]?.[c] ?? 0);
              p.judgeWiseTotal[jid] += score;
            });
          });

          p.overallTotal = Object.values(p.judgeWiseTotal).reduce(
            (a, b) => a + b,
            0,
          );
        });

        participants
          .sort((a, b) => b.overallTotal - a.overallTotal)
          .slice(0, 3)
          .forEach((p, i) => {
            rows.push([
              'Individual',
              event.name,
              i + 1,
              p.district ?? '-',
              p.studentFullName ?? '-',
              p.studentId ?? '-',
              p.overallTotal.toFixed(2),
            ]);
          });
      }

      // ===============================
      // GROUP EVENTS
      // ===============================
      else {
        const grouped = {};

        participants.forEach((p) => {
          const key = p.district || 'Unknown';

          if (!grouped[key]) {
            grouped[key] = {
              district: key,
              members: [],
              judgeWiseTotal: {},
            };
            judgeIds.forEach((jid) => (grouped[key].judgeWiseTotal[jid] = 0));
          }

          grouped[key].members.push({
            id: p.studentId ?? '-',
            name: p.studentFullName ?? '-',
            district: p.district ?? 'Unknown',
          });

          criteriaList.forEach((c) => {
            judgeIds.forEach((jid) => {
              const score = parseFloat(p.score?.[event.name]?.[jid]?.[c] ?? 0);
              grouped[key].judgeWiseTotal[jid] += score;
            });
          });
        });

        Object.values(grouped).forEach((g) => {
          g.overallTotal = Object.values(g.judgeWiseTotal).reduce(
            (a, b) => a + b,
            0,
          );
        });

        Object.values(grouped)
          .sort((a, b) => {
            if (b.overallTotal !== a.overallTotal) {
              return b.overallTotal - a.overallTotal; // score DESC
            }
            return (a.district ?? '').localeCompare(b.district ?? ''); // district ASC
          })
          .slice(0, 3)
          .forEach((g, i) => {
            const membersSorted = g.members
              .sort((a, b) => a.district.localeCompare(b.district))
              .map((m) => `${m.id} - ${m.name}`)
              .join(' | ');

            rows.push([
              'Group',
              event.name,
              i + 1,
              g.district,
              membersSorted,
              '',
              g.overallTotal.toFixed(2),
            ]);
          });
      }
    }

    // ---------- DOWNLOAD ----------
    const csv = '\uFEFF' + rows.map((r) => r.map(esc).join(',')).join('\r\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'Final_Results.csv';
    a.click();

    URL.revokeObjectURL(url);
  };

  return !isLoading && user && filteredData ? (
    <>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome, {user.name}
              </h1>
              <p className="text-gray-500">{user.email}</p>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <button
                className="flex-1 md:flex-none bg-yellow-100 text-yellow-800 hover:bg-yellow-200 font-semibold px-4 py-2 rounded-xl transition-colors"
                onClick={() => router.push('/admin')}
              >
                Dashboard
              </button>
              <button
                className="flex-1 md:flex-none bg-red-100 text-red-800 hover:bg-red-200 font-semibold px-4 py-2 rounded-xl transition-colors"
                onClick={() => {
                  auth.signOut();
                  secureLocalStorage.clear();
                  router.push('/');
                }}
              >
                Logout
              </button>
            </div>
          </div>

          {/* Filters Section */}
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label
                  htmlFor="search"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Search Events
                </label>
                <input
                  id="search"
                  className="w-full border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 p-2 border"
                  placeholder="Search by event name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="w-full md:w-64">
                <label
                  htmlFor="group"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Filter by Group
                </label>
                <select
                  id="group"
                  className="w-full border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 p-2 border"
                  value={filterGroup}
                  onChange={(e) => setFilterGroup(e.target.value)}
                >
                  <option value="">All Groups</option>
                  {groups.map((group, index) => (
                    <option
                      key={index}
                      value={group}
                    >
                      {group}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Download Results */}
          <div className="flex justify-end mb-6">
            <button
              onClick={downloadFinalResults}
              className="bg-blue-600 text-white px-5 py-2 rounded-xl font-semibold hover:bg-blue-700 transition"
            >
              Download Final Results
            </button>
          </div>

          {/* Content Section */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Event Details
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Judges
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Criteria Summary
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredData.length > 0 ? (
                    filteredData.map((event, index) => (
                      <tr
                        key={index}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-2">
                            <span className="text-sm font-bold text-gray-900">
                              {event.name}
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {event.group.map((group, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                                >
                                  {group}
                                </span>
                              ))}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-2">
                            {event.judgeEmailList.map((judge, idx) => {
                              const password = judge
                                .toString()
                                .replace('@slts.cbe', '@2311pass26');
                              return (
                                <div
                                  key={idx}
                                  className="flex flex-col sm:flex-row items-start sm:items-center gap-2 text-xs"
                                >
                                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-lg font-medium">
                                    {judge}
                                  </span>
                                  <div className="flex items-center gap-1">
                                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-lg font-mono">
                                      {password}
                                    </span>
                                    <button
                                      className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700"
                                      title="Copy credentials"
                                      onClick={() => {
                                        const message = `Email: ${judge}\nPassword: ${password}`;
                                        navigator.clipboard.writeText(message);
                                        setCopiedJudge(judge);
                                        setTimeout(
                                          () => setCopiedJudge(null),
                                          2000,
                                        );
                                      }}
                                    >
                                      {copiedJudge === judge ? (
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          className="h-4 w-4 text-green-600"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                          stroke="currentColor"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M5 13l4 4L19 7"
                                          />
                                        </svg>
                                      ) : (
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          className="h-4 w-4"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                          stroke="currentColor"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                          />
                                        </svg>
                                      )}
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-2">
                            {Object.entries(event.evalCriteria).length > 0 ? (
                              <div className="text-sm">
                                <div className="space-y-1">
                                  {Object.entries(event.evalCriteria).map(
                                    ([criteria, marks], cIdx) => (
                                      <div
                                        key={cIdx}
                                        className="flex justify-between items-center text-gray-600 border-b border-gray-100 last:border-0 pb-1 last:pb-0"
                                      >
                                        <span className="font-medium pr-4">
                                          {criteria}
                                        </span>
                                        <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap">
                                          {marks} pts
                                        </span>
                                      </div>
                                    ),
                                  )}
                                </div>
                                <div className="mt-3 pt-2 border-t border-gray-200 flex justify-between items-center font-bold text-gray-900">
                                  <span>Total</span>
                                  <span>
                                    {Object.values(event.evalCriteria).reduce(
                                      (a, b) => a + b,
                                      0,
                                    )}{' '}
                                    pts
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400 italic">
                                No criteria set
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-2">
                            <button
                              className="bg-cyan-100 text-cyan-900 hover:bg-cyan-200 font-semibold px-3 py-1.5 rounded-lg text-xs transition-colors w-full sm:w-auto text-center"
                              onClick={() => {
                                setEventNameBuffer(event.name);
                                setCriteriaBuffer(
                                  Object.entries(event.evalCriteria),
                                );
                                setCIsOpen(true);
                              }}
                            >
                              Update Criteria
                            </button>
                            <a
                              className="bg-lime-100 text-lime-900 hover:bg-lime-200 font-semibold px-3 py-1.5 rounded-lg text-xs transition-colors w-full sm:w-auto text-center block"
                              href={`/admin/event/${event.name.includes('GROUP') ? 'group' : 'individual'}?event=${encodeURIComponent(event.name)}`}
                            >
                              Leaderboard
                            </a>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-8 text-center text-gray-500"
                      >
                        No events found matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <Dialog
        open={cIsOpen}
        onClose={() => setCIsOpen(false)}
        className="relative z-50"
      >
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm"
          aria-hidden="true"
        />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="mx-auto max-w-2xl w-full rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-200 flex flex-row justify-between items-center bg-gray-50">
              <DialogTitle className="text-lg font-bold text-gray-900">
                Update Judging Criteria
              </DialogTitle>
              <button
                onClick={() => setCIsOpen(false)}
                className="text-gray-400 hover:text-gray-500 hover:bg-gray-100 p-2 rounded-full transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Event Name
                </h3>
                <p className="text-lg font-bold text-gray-900">
                  {eventNameBuffer}
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                  <div className="col-span-7">Criteria Name</div>
                  <div className="col-span-3">Marks</div>
                  <div className="col-span-2 text-center">Action</div>
                </div>

                {criteriaBuffer.map((_, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-12 gap-4 items-center"
                  >
                    <div className="col-span-7">
                      <input
                        type="text"
                        className="w-full border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2 border text-sm"
                        placeholder="Criteria description"
                        value={criteriaBuffer[index][0]}
                        onChange={(e) => {
                          const _criteriaBuffer = [...criteriaBuffer];
                          _criteriaBuffer[index][0] = e.target.value;
                          setCriteriaBuffer(_criteriaBuffer);
                        }}
                      />
                    </div>
                    <div className="col-span-3">
                      <input
                        type="number"
                        className="w-full border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2 border text-sm"
                        placeholder="0"
                        value={criteriaBuffer[index][1] ?? 0}
                        onChange={(e) => {
                          const _criteriaBuffer = [...criteriaBuffer];
                          _criteriaBuffer[index][1] = e.target.value.toString();
                          setCriteriaBuffer(_criteriaBuffer);
                        }}
                      />
                    </div>
                    <div className="col-span-2 flex justify-center">
                      <button
                        className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-full transition-colors"
                        title="Remove criteria"
                        onClick={() => {
                          const _criteriaBuffer = [...criteriaBuffer];
                          _criteriaBuffer.splice(index, 1);
                          setCriteriaBuffer(_criteriaBuffer);
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-between items-center pt-4 border-t border-gray-100">
                <div className="text-sm font-medium text-gray-700">
                  Total Marks:{' '}
                  <span className="text-lg font-bold text-gray-900 ml-2">
                    {criteriaBuffer
                      .map((c) => c[1])
                      .reduce((a, b) => a + parseInt(b || 0), 0)}
                  </span>
                </div>
                <button
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium text-sm hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors"
                  onClick={() => {
                    setCriteriaBuffer([...criteriaBuffer, ['', 0]]);
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Add Criteria
                </button>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
              <button
                className="px-4 py-2 rounded-lg text-gray-700 font-medium hover:bg-gray-200 transition-colors"
                onClick={() => setCIsOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors shadow-sm"
                onClick={() => {
                  setIsLoading(true);
                  const _criteria = {};
                  criteriaBuffer.forEach((c) => {
                    if (c[0].trim()) {
                      _criteria[c[0]] = c[1];
                    }
                  });

                  updateCrieria(eventNameBuffer, _criteria).then((res) => {
                    if (res) {
                      setCIsOpen(false);
                      router.refresh();
                    }
                  });
                }}
              >
                Save Changes
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  ) : (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-gray-500 font-medium">Loading event data...</p>
      </div>
    </div>
  );
}
