'use client';

import { doc, getDoc, getFirestore } from 'firebase/firestore';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import secureLocalStorage from 'react-secure-storage';
import { getJudgeEventData } from '@/app/_util/data';
import { auth } from '@/app/_util/initApp';

export default function EventLeaderboardIndiPage() {
  const router = useRouter();
  const [eventName, setEventName] = useState('');
  const [user, setUser] = useState(null);
  const [eventMetadata, setEventMetadata] = useState(null);
  const [participants, setParticipants] = useState(null);
  const [filteredParticipants, setFilteredParticipants] = useState(null);

  const [orderedJudges, setOrderedJudges] = useState([]);

  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState('');

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

          // Process data to calculate judge wise total and overall total
          // and handle missing data.
          _data[0].forEach((participant) => {
            participant.judgeWiseTotal = {};
            Object.keys(_data[1].evalCriteria).forEach((criteria) => {
              _data[1].judgeIdList.forEach((judgeId) => {
                if (!participant.score) {
                  participant.score = {};
                }
                if (!participant.score[_eventName]) {
                  participant.score[_eventName] = {};
                }
                if (!participant.score[_eventName][judgeId]) {
                  participant.score[_eventName][judgeId] = {};
                }
                if (!participant.score[_eventName][judgeId][criteria]) {
                  participant.score[_eventName][judgeId][criteria] = 0;
                }

                if (!participant.judgeWiseTotal[judgeId]) {
                  participant.judgeWiseTotal[judgeId] = 0;
                }

                participant.judgeWiseTotal[judgeId] += parseFloat(
                  participant.score[_eventName][judgeId][criteria],
                );
              });
              participant.overallTotal = Object.values(
                participant.judgeWiseTotal,
              ).reduce((a, b) => a + b, 0);
            });
          });

          // Handle comments.
          _data[0].forEach((participant) => {
            _data[1].judgeIdList.forEach((judgeId) => {
              if (!participant.comment) {
                participant.comment = {};
              }

              if (!participant.comment[_eventName]) {
                participant.comment[_eventName] = {};
              }

              if (!participant.comment[_eventName][judgeId]) {
                participant.comment[_eventName][judgeId] = '';
              }
            });
          });

          // Sort _data[0] based on overallTotal
          _data[0].sort((a, b) => b.overallTotal - a.overallTotal);

          setEventMetadata(_data[1]);

          const db = getFirestore();
          const mappingSnap = await getDoc(
            doc(db, 'eventJudgeMapping', _eventName),
          );

          let judges = [];

          if (mappingSnap.exists()) {
            const mapping = mappingSnap.data();
            const expected = mapping.expectedJudgeCount || 0;
            const judgeOrder = mapping.judgeOrder || [];

            judgeOrder.sort((a, b) => a.order - b.order);

            for (let i = 1; i <= expected; i++) {
              const found = judgeOrder.find((j) => j.order === i);
              judges.push(found?.name ?? 'Unknown');
            }
          } else {
            // fallback safety
            judges = _data[1].judgeIdList.map(() => 'Unknown');
          }

          setOrderedJudges(judges);

          setParticipants(_data[0]);
          setFilteredParticipants(_data[0]);
        })
        .catch((err) => {
          console.error(err);
          alert('Invalid Link');
          router.push('/admin/event');
        });
    }
  }, [router, searchParams]);

  const exportForCert = () => {
    if (!filteredParticipants || !eventMetadata) return;

    // Filter top 5 participants based on overallTotal (descending)
    // Assuming filteredParticipants are already sorted by overallTotal,
    // otherwise we would need to sort first:
    // const sorted = [...filteredParticipants].sort((a, b) => (b.overallTotal || 0) - (a.overallTotal || 0));
    const topParticipants = filteredParticipants.slice(0, 5);

    if (topParticipants.length === 0) return;

    const flatList = topParticipants.map((p, index) => {
      // Determine effective student name and related details if substituted
      const isSubstituted = p.substitute && p.substitute[eventMetadata.name];
      const studentName = isSubstituted
        ? p.substitute[eventMetadata.name].newStudentName
        : p.studentFullName;

      const studentGender = isSubstituted
        ? p.substitute[eventMetadata.name].newStudentGender
        : p.gender;

      const studentDOB = isSubstituted
        ? p.substitute[eventMetadata.name].newStudentDOB
        : p.dateOfBirth;

      const studentGroup = isSubstituted
        ? p.substitute[eventMetadata.name].newStudentGroup
        : p.studentGroup;

      return {
        eventName: eventName,
        Rank: index + 1,
        ...p,
        // Override with substituted values where applicable for the certificate
        studentFullName: studentName,
        gender: studentGender,
        dateOfBirth: studentDOB,
        studentGroup: studentGroup,
        // Format the total score
        OverallTotal: parseFloat(p.overallTotal ?? 0).toFixed(2),
      };
    });

    const allKeys = new Set();
    flatList.forEach((item) => {
      Object.keys(item).forEach((key) => {
        const val = item[key];
        // Skip complex objects/arrays except for specific ones if needed.
        // We generally want scalar values.
        if (
          val !== null &&
          typeof val === 'object' &&
          !Array.isArray(val) &&
          key !== 'Rank' // Rank is scalar but good to be explicit
        ) {
          return;
        }
        allKeys.add(key);
      });
    });

    const headers = Array.from(allKeys).sort();
    // Prioritize common certificate fields
    const prioritized = [
      'eventName',
      'Rank',
      'studentFullName',
      'studentId',
      'district',
      'samithiName',
      'OverallTotal',
      'studentGroup',
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

  const exportToCSV = () => {
    if (!filteredParticipants || !eventMetadata || orderedJudges.length === 0)
      return;

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
    // Create judge names for headers - MUST match the number of judges
    const numJudges = eventMetadata.judgeIdList.length;
    const cleanJudgeNames = [];

    for (let i = 0; i < numJudges; i++) {
      const judgeName = orderedJudges[i];
      // Always return a name, even for Unknown
      if (
        !judgeName ||
        judgeName === 'Unknown' ||
        judgeName.trim().length < 3
      ) {
        cleanJudgeNames.push(`Judge ${i + 1}`);
      } else {
        // Use full name
        cleanJudgeNames.push(judgeName.trim());
      }
    }

    const criteriaList = Object.keys(eventMetadata.evalCriteria);

    const headers = [
      'Student Name',
      'Student ID',
      'District',
      'Samithi',
      'Attendance',

      // Criteria scores per judge - one column per criteria per judge
      ...criteriaList.flatMap((criteria) =>
        cleanJudgeNames.map((judgeName) => {
          return `${criteria} (${judgeName})`;
        }),
      ),

      // Judge totals - MUST have one for each judge
      ...cleanJudgeNames.map((j) => `Total (${j})`),

      'Overall Total',

      // Comments - MUST have one for each judge
      ...cleanJudgeNames.map((j) => `Comment (${j})`),
    ];

    // ---------- ROWS ----------
    const rows = filteredParticipants.map((row) => {
      const studentName =
        row.substitute && row.substitute[eventMetadata.name]
          ? row.substitute[eventMetadata.name].newStudentName
          : (row.studentFullName ?? '-');

      // CRITICAL: Build scores in exact order - criteria first, then judges within each criteria
      const scores = [];
      criteriaList.forEach((criteria) => {
        eventMetadata.judgeIdList.forEach((judgeId) => {
          const score = row.score?.[eventName]?.[judgeId]?.[criteria] ?? 0;
          scores.push(score);
        });
      });

      // Get judge totals - must be in same order as judgeIdList
      const judgeTotals = [];
      eventMetadata.judgeIdList.forEach((judgeId) => {
        const total = row.judgeWiseTotal?.[judgeId] ?? 0;
        judgeTotals.push(parseFloat(total).toFixed(2));
      });

      // Get comments - must be in same order as judgeIdList
      const comments = [];
      eventMetadata.judgeIdList.forEach((judgeId) => {
        const comment = row.comment?.[eventName]?.[judgeId] || '-';
        // Clean up comment: remove extra whitespace and newlines
        comments.push(String(comment).replace(/\s+/g, ' ').trim());
      });

      return [
        studentName,
        row.studentId ?? '-',
        row.district ?? '-',
        row.samithiName ?? '-',

        row.ATTENDEE_STATUS === 'Attended' ? 'Present' : 'Yet to Check In',

        ...scores,
        ...judgeTotals,
        parseFloat(row.overallTotal ?? 0).toFixed(2),
        ...comments,
      ];
    });

    // Build CSV with proper escaping
    const csv = [
      headers.map(escapeCSV).join(','),
      ...rows.map((r) => r.map(escapeCSV).join(',')),
    ].join('\r\n'); // Use \r\n for better Excel compatibility

    // Add BOM for proper UTF-8 encoding in Excel
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${eventName}_leaderboard.csv`;
    link.click();

    URL.revokeObjectURL(url);
  };

  return eventName &&
    user &&
    eventMetadata &&
    participants &&
    filteredParticipants ? (
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
            <p className="text-md">{participants.length} Participants</p>
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
                  <th className="border px-4 py-2">Student</th>
                  <th className="border px-4 py-2">Balvikas</th>
                  {eventMetadata.evalCriteria &&
                    Object.keys(eventMetadata.evalCriteria).map(
                      (criteria, index) => (
                        <th
                          key={index}
                          className="border px-4 py-2 text-center"
                        >
                          {criteria.split(' ').map((word, i) => (
                            <span
                              key={i}
                              className="block"
                            >
                              {word}
                            </span>
                          ))}
                        </th>
                      ),
                    )}
                  <th className="border px-4 py-2">Judge Wise Total</th>
                  <th className="border px-4 py-2">Avg Total</th>
                  <th className="border px-4 py-2">Comments</th>
                </tr>
              </thead>
              <tbody>
                {filteredParticipants.map((row, index) => (
                  <tr key={index}>
                    <td
                      className={
                        'px-4 py-2 border max-w-40' +
                        (row.substitute && row.substitute[eventMetadata.name]
                          ? ' bg-[#ffcece]'
                          : '')
                      }
                    >
                      {row.substitute && row.substitute[eventMetadata.name] ? (
                        <div>
                          <p className="text-xs font-semibold text-[#32350b] rounded-2xl w-fit">
                            Substituted Student - Original{' '}
                            <span className="font-bold">{row.studentId}</span>
                          </p>
                          <p className="font-bold">
                            {row.substitute[eventMetadata.name].newStudentName}
                          </p>
                          <p className="text-xs">
                            {row.substitute[eventMetadata.name]
                              .newStudentGender ?? '-'}{' '}
                            -{' '}
                            {row.substitute[eventMetadata.name].newStudentDOB ??
                              '-'}
                          </p>
                          <p className="text-xs mt-2 font-bold bg-[#bad1ff] text-[#090e2d] p-1 px-2 rounded-2xl w-fit">
                            {row.substitute[eventMetadata.name]
                              .newStudentGroup ?? '-'}
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="font-bold">
                            {row.studentFullName ?? '-'}
                          </p>

                          <span
                            className={`inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                              row.ATTENDEE_STATUS === 'Attended'
                                ? 'bg-green-100 text-green-700 border border-green-300'
                                : 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                            }`}
                          >
                            {row.ATTENDEE_STATUS === 'Attended'
                              ? 'Present'
                              : 'Yet to Check In'}
                          </span>

                          <p className="text-xs mt-1">
                            {row.gender ?? '-'} - {row.dateOfBirth ?? '-'}
                          </p>

                          <div className="flex flex-wrap gap-1 mt-1">
                            <p className="text-xs font-bold bg-[#c4ffc2] text-[#07210d] p-1 px-2 rounded-2xl w-fit">
                              {row.studentId ?? '-'}
                            </p>
                            <p className="text-xs font-bold bg-[#bad1ff] text-[#090e2d] p-1 px-2 rounded-2xl w-fit">
                              {row.studentGroup ?? '-'}
                            </p>
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2 border max-w-50">
                      <p className="font-bold">{row.district ?? '-'}</p>
                      <p className="text-xs">{row.samithiName ?? '-'}</p>
                      {row.studentGroup === 'Group 3' && (
                        <p className="text-xs">
                          Passed group 2: {row.hasPassedGroup2Exam ?? '-'}
                        </p>
                      )}
                      <div className="flex flex-wrap mt-2 gap-1">
                        {row.registeredEvents.map((event, index) => (
                          <p
                            key={index}
                            className="text-xs bg-green-200 text-green-800 font-bold rounded-xl p-1 px-2 w-fit"
                          >
                            {event ?? '-'}
                          </p>
                        ))}
                      </div>
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
                                {row.score[eventName][judgeId][criteria]}
                              </p>
                            ))}
                          </td>
                        ),
                      )}
                    <td className="px-4 py-2 border font-bold">
                      {Object.values(row.judgeWiseTotal).map((total, index) => (
                        <p
                          key={index}
                          className="text-xs"
                        >
                          {parseFloat(total).toFixed(2)}
                        </p>
                      ))}
                    </td>
                    <td className="px-4 py-2 border font-bold">
                      {parseFloat(row.overallTotal).toFixed(2)}
                    </td>
                    <td className="px-4 py-2 border">
                      <div className="flex flex-col">
                        {eventMetadata.judgeIdList.map((judgeId, i) => (
                          <div
                            key={i}
                            className="flex flex-col"
                          >
                            <p className="text-xs">
                              {row.comment[eventName][judgeId] == ''
                                ? '-'
                                : row.comment[eventName][judgeId]}
                            </p>
                          </div>
                        ))}
                      </div>
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
