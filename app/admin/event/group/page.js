'use client';

import { doc, getDoc, getFirestore } from 'firebase/firestore';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import secureLocalStorage from 'react-secure-storage';
import { getJudgeEventData } from '@/app/_util/data';
import { auth } from '@/app/_util/initApp';

export default function GroupEventLeaderboardPage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [eventName, setEventName] = useState(null);
  const [eventMetadata, setEventMetadata] = useState(null);
  const [groups, setGroups] = useState(null);
  const [orderedJudges, setOrderedJudges] = useState([]);

  const searchParams = useSearchParams();

  useEffect(() => {
    if (!secureLocalStorage.getItem('user')) {
      router.push('/');
    }

    const user = JSON.parse(secureLocalStorage.getItem('user'));
    const _eventName = decodeURIComponent(searchParams.get('event') ?? '');
    setEventName(_eventName);

    if (user.role !== 'admin' || !_eventName) {
      router.push('/');
    } else {
      setUser(user);
      getJudgeEventData(_eventName)
        .then(async (_data) => {
          if (_data == null || _data.length != 2) {
            router.push('/');
          }

          // Group participants by district (Balvikas)
          const groupedData = _data[0].reduce((acc, participant) => {
            const key = participant.district || 'Unknown';
            if (!acc[key]) {
              acc[key] = {
                ...participant,
                members: [],
              };
            }
            acc[key].members.push({
              ...participant,
              name: participant.studentFullName || 'Unknown',
              id: participant.studentId || 'Unknown ID',
              ATTENDEE_STATUS: participant.ATTENDEE_STATUS,
            });
            return acc;
          }, {});

          const groups = Object.values(groupedData).map((group) => {
            const { members, ...rest } = group;
            return { members, ...rest };
          });

          // Calculate scores (same for all members)
          groups.forEach((group) => {
            group.judgeWiseTotal = {};
            Object.keys(_data[1].evalCriteria).forEach((criteria) => {
              _data[1].judgeIdList.forEach((judgeId) => {
                if (!group.score) {
                  group.score = {};
                }
                if (!group.score[_eventName]) {
                  group.score[_eventName] = {};
                }
                if (!group.score[_eventName][judgeId]) {
                  group.score[_eventName][judgeId] = {};
                }
                if (!group.score[_eventName][judgeId][criteria]) {
                  group.score[_eventName][judgeId][criteria] = 0;
                }

                if (!group.judgeWiseTotal[judgeId]) {
                  group.judgeWiseTotal[judgeId] = 0;
                }

                group.judgeWiseTotal[judgeId] += parseFloat(
                  group.score[_eventName][judgeId][criteria],
                );
              });
              group.overallTotal = Object.values(group.judgeWiseTotal).reduce(
                (a, b) => a + b,
                0,
              );
            });
          });

          groups.forEach((group) => {
            _data[1].judgeIdList.forEach((judgeId) => {
              if (!group.comment) {
                group.comment = {};
              }

              if (!group.comment[eventName]) {
                group.comment[eventName] = {};
              }

              if (!group.comment[eventName][judgeId]) {
                group.comment[eventName][judgeId] = '-';
              }
            });
          });

          // Sort groups by overallTotal
          groups.sort((a, b) => b.overallTotal - a.overallTotal);

          setEventMetadata(_data[1]);
          setGroups(groups);
        })
        .catch((err) => {
          console.error(err);
          alert('Invalid Link');
          router.push('/admin/event');
        });
    }
  }, [router, eventName, searchParams]);

  // Add this useEffect to fetch judge names from eventJudgeMapping
  useEffect(() => {
    if (!eventMetadata || !groups || !eventName) return;

    const fetchJudgeNames = async () => {
      const db = getFirestore();

      try {
        // Get the event document from eventJudgeMapping collection
        const eventJudgeMappingDoc = await getDoc(
          doc(db, 'eventJudgeMapping', eventName),
        );

        if (eventJudgeMappingDoc.exists()) {
          const data = eventJudgeMappingDoc.data();
          const judgeOrder = data.judgeOrder || [];

          // Extract judge names from judgeOrder array
          // judgeOrder structure: [{ name: "Judge Name", order: 1 }, ...]
          const sortedJudges = [...judgeOrder].sort(
            (a, b) => a.order - b.order,
          );
          const judgeNames = sortedJudges.map(
            (judge) => judge.name || 'Unknown',
          );

          setOrderedJudges(judgeNames);
        } else {
          // Fallback: create generic judge names
          const fallbackNames = eventMetadata.judgeIdList.map(
            (_, i) => `Judge ${i + 1}`,
          );
          setOrderedJudges(fallbackNames);
        }
      } catch (err) {
        console.error('Error fetching judge names:', err);
        // Fallback: create generic judge names
        const fallbackNames = eventMetadata.judgeIdList.map(
          (_, i) => `Judge ${i + 1}`,
        );
        setOrderedJudges(fallbackNames);
      }
    };

    fetchJudgeNames();
  }, [eventMetadata, groups, eventName]);

  const exportForCert = () => {
    if (!groups || !eventMetadata) return;

    const topGroups = groups.slice(0, 5);
    const flatList = [];

    topGroups.forEach((group, index) => {
      const rank = index + 1;
      group.members.forEach((member) => {
        const row = {
          eventName: eventName,
          Rank: rank,
          ...member,
          // Rename keys to match Individual export
          studentFullName: member.name,
          studentId: member.id,
          district: group.district || 'Unknown',
          OverallTotal: parseFloat(group.overallTotal ?? 0).toFixed(2),
        };
        flatList.push(row);
      });
    });

    if (flatList.length === 0) return;

    const allKeys = new Set();
    flatList.forEach((item) => {
      Object.keys(item).forEach((key) => {
        const val = item[key];
        if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
          return;
        }
        allKeys.add(key);
      });
    });

    const headers = Array.from(allKeys).sort();
    const prioritized = [
      'eventName',
      'Rank',
      'studentFullName',
      'studentId',
      'district',
      'studentGroup',
      'OverallTotal',
    ];
    const sortedHeaders = [
      ...prioritized.filter((h) => headers.includes(h)),
      ...headers.filter((h) => !prioritized.includes(h)),
    ];

    const escapeCSV = (value) => {
      if (value == null) return '';
      if (Array.isArray(value)) return `"${value.join('; ')}"`;
      const str = String(value);
      if (str.includes(',') || str.includes('\n') || str.includes('"')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const csv = [
      sortedHeaders.map(escapeCSV).join(','),
      ...flatList.map((row) =>
        sortedHeaders.map((header) => escapeCSV(row[header])).join(','),
      ),
    ].join('\r\n');

    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${eventName}_top5_cert_export.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Add this function for CSV export
  const exportToCSV = () => {
    if (!groups || !eventMetadata || orderedJudges.length === 0) return;

    // Helper function to properly escape CSV values
    const escapeCSV = (value) => {
      if (value == null) return '';
      const str = String(value);
      // If contains comma, newline, or quotes, wrap in quotes and escape internal quotes
      if (str.includes(',') || str.includes('\n') || str.includes('"')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    // ---------- HEADERS ----------
    const numJudges = eventMetadata.judgeIdList.length;
    const cleanJudgeNames = [];

    for (let i = 0; i < numJudges; i++) {
      const judgeName = orderedJudges[i];
      if (
        !judgeName ||
        judgeName === 'Unknown' ||
        judgeName.trim().length < 3
      ) {
        cleanJudgeNames.push(`Judge ${i + 1}`);
      } else {
        cleanJudgeNames.push(judgeName.trim());
      }
    }

    const criteriaList = Object.keys(eventMetadata.evalCriteria);

    const headers = [
      'District',
      'Student IDs',
      'Student Names',
      'Attendance',

      // Criteria scores per judge
      ...criteriaList.flatMap((criteria) =>
        cleanJudgeNames.map((judgeName) => {
          return `${criteria} (${judgeName})`;
        }),
      ),

      // Judge totals
      ...cleanJudgeNames.map((j) => `Total (${j})`),

      'Overall Total',

      // Comments
      ...cleanJudgeNames.map((j) => `Comment (${j})`),
    ];

    // ---------- ROWS ----------
    const rows = groups.map((group) => {
      // Combine student IDs and names
      const studentIds = group.members.map((m) => m.id).join('; ');
      const studentNames = group.members.map((m) => m.name).join('; ');
      const attendance = group.members
        .map((m) =>
          m.ATTENDEE_STATUS === 'Attended' ? 'Present' : 'Yet to Check In',
        )
        .join('; ');

      // Build scores in exact order - criteria first, then judges within each criteria
      const scores = [];
      criteriaList.forEach((criteria) => {
        eventMetadata.judgeIdList.forEach((judgeId) => {
          const score = group.score?.[eventName]?.[judgeId]?.[criteria] ?? 0;
          scores.push(score);
        });
      });

      // Get judge totals - must be in same order as judgeIdList
      const judgeTotals = [];
      eventMetadata.judgeIdList.forEach((judgeId) => {
        const total = group.judgeWiseTotal?.[judgeId] ?? 0;
        judgeTotals.push(parseFloat(total).toFixed(2));
      });

      // Get comments - must be in same order as judgeIdList
      const comments = [];
      eventMetadata.judgeIdList.forEach((judgeId) => {
        const comment = group.comment?.[eventName]?.[judgeId] || '-';
        // Clean up comment: remove extra whitespace and newlines
        comments.push(String(comment).replace(/\s+/g, ' ').trim());
      });

      return [
        group.district ?? 'Unknown',
        studentIds,
        studentNames,
        attendance,

        ...scores,
        ...judgeTotals,
        parseFloat(group.overallTotal ?? 0).toFixed(2),
        ...comments,
      ];
    });

    // Build CSV with proper escaping
    const csv = [
      headers.map(escapeCSV).join(','),
      ...rows.map((r) => r.map(escapeCSV).join(',')),
    ].join('\r\n');

    // Add BOM for proper UTF-8 encoding in Excel
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${eventName}_group_leaderboard.csv`;
    link.click();

    URL.revokeObjectURL(url);
  };

  return eventName && user && eventMetadata && groups ? (
    <>
      <div className="flex flex-col justify-center w-fit min-w-[95%] ml-auto mr-auto">
        <div className="rounded-2xl p-4 m-2 bg-white border overflow-x-auto justify-between flex flex-row">
          <div>
            <h1 className="text-2xl font-bold">Welcome, {user.name}</h1>
            <p className="text-gray-700 mt-2">{user.email}</p>
          </div>
          <div className="flex flex-row">
            <button
              className="bg-[#fffece] text-[#2c350b] font-bold px-4 py-1 rounded-xl mr-2"
              onClick={() => router.push('/admin/event')}
            >
              Events
            </button>
            <button
              className="bg-[#fffece] text-[#2c350b] font-bold px-4 py-1 rounded-xl mr-2"
              onClick={() => router.push('/admin')}
            >
              Dashboard
            </button>
            <button
              className="bg-[#ffcece] text-[#350b0b] font-bold px-4 py-1 rounded-xl"
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

        <div className="flex flex-col justify-center w-fit min-w-[95%] ml-auto mr-auto">
          <div className="rounded-2xl p-4 bg-white border overflow-x-auto">
            <h1 className="text-2xl font-bold">{eventMetadata.name}</h1>
            <p className="text-md">{groups.length} Groups</p>
            <div className="flex flex-row flex-wrap gap-1 mt-1">
              {eventMetadata.group.map((group, index) => (
                <p
                  key={index}
                  className="bg-gray-200 text-gray-800 font-semibold px-2 py-1 rounded-xl w-fit"
                >
                  {group}
                </p>
              ))}
            </div>

            {/* Evaluation Criteria */}
            <h2 className="text-xl font-bold mt-6">Evaluation Criteria</h2>
            <table className="table-auto w-full">
              <thead>
                <tr>
                  <th className="border px-4 py-2">Criteria</th>
                  <th className="border px-4 py-2">Max Marks</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(eventMetadata.evalCriteria).map(
                  ([key, value], index) => (
                    <tr key={index}>
                      <td className="border px-4 py-2">{key}</td>
                      <td className="border px-4 py-2">{value}</td>
                    </tr>
                  ),
                )}
                <tr>
                  <td className="border px-4 py-2 font-semibold">Total</td>
                  <td className="border px-4 py-2 font-semibold">
                    {Object.values(eventMetadata.evalCriteria).reduce(
                      (a, b) => a + b,
                      0,
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-col justify-center w-fit min-w-[95%] ml-auto mr-auto">
          <div className="rounded-2xl p-4 my-4 bg-white border overflow-x-auto">
            <div className="w-full flex justify-between">
              <h1 className="text-2xl font-bold">Leaderboard</h1>
              <div className="flex gap-2">
                <button
                  onClick={exportForCert}
                  className="px-4 py-1 text-md bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  Export for Cert
                </button>
                <button
                  onClick={exportToCSV}
                  className="px-4 py-1 text-md bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Export
                </button>
              </div>
            </div>
            <table className="table-auto w-full mt-4">
              <thead>
                <tr>
                  <th className="border px-4 py-2">District</th>
                  <th className="border px-4 py-2">Students</th>
                  {eventMetadata.evalCriteria &&
                    Object.keys(eventMetadata.evalCriteria).map(
                      (criteria, index) => (
                        <th
                          key={index}
                          className="border px-4 py-2"
                        >
                          {criteria}
                        </th>
                      ),
                    )}
                  <th className="border px-4 py-2">Judge Wise Total</th>
                  <th className="border px-4 py-2">Overall Total</th>
                  <th className="border px-4 py-2">Comments</th>
                </tr>
              </thead>
              <tbody>
                {groups.map((group, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 border font-bold">
                      {group.district ?? 'Unknown'}
                    </td>
                    <td className="px-4 py-2 border">
                      {group.members.map((member, i) => (
                        <div
                          key={i}
                          className="mt-2"
                        >
                          {/* First line: ID + Name */}
                          <div className="flex items-center gap-2 text-xs">
                            <span className="font-bold bg-gray-100 px-2 py-0.5 rounded-2xl">
                              {member.id}
                            </span>
                            <span>{member.name}</span>
                          </div>

                          {/* Second line: Attendance */}
                          <span
                            className={`inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              member.ATTENDEE_STATUS === 'Attended'
                                ? 'bg-green-100 text-green-700 border border-green-300'
                                : 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                            }`}
                          >
                            {member.ATTENDEE_STATUS === 'Attended'
                              ? 'Present'
                              : 'Yet to Check In'}
                          </span>
                        </div>
                      ))}
                    </td>
                    {eventMetadata.evalCriteria &&
                      Object.keys(eventMetadata.evalCriteria).map(
                        (criteria, i1) => (
                          <td
                            key={i1}
                            className="px-4 py-2 border"
                          >
                            {eventMetadata.judgeIdList.map((judgeId, i2) => (
                              <p
                                key={i2}
                                className="text-xs"
                              >
                                {group.score[eventName][judgeId][criteria]}
                              </p>
                            ))}
                          </td>
                        ),
                      )}
                    <td className="px-4 py-2 border font-bold">
                      {Object.values(group.judgeWiseTotal).map((total, i) => (
                        <p
                          key={i}
                          className="text-xs"
                        >
                          {parseFloat(total).toFixed(2)}
                        </p>
                      ))}
                    </td>
                    <td className="px-4 py-2 border font-bold">
                      {parseFloat(group.overallTotal).toFixed(2)}
                    </td>
                    <td className="px-4 py-2 border">
                      {eventMetadata.judgeIdList.map((judgeId, i2) => (
                        <p
                          key={i2}
                          className="text-xs"
                        >
                          {group.comment[eventName][judgeId]}
                        </p>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  ) : (
    <div className="flex h-screen items-center justify-center">
      <p className="text-xl font-semibold">Loading...</p>
    </div>
  );
}
