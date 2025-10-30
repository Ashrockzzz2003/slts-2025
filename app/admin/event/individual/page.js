'use client';

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
  const searchParams = useSearchParams();

  // const [searchQuery, setSearchQuery] = useState('');

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
        .then((_data) => {
          if (_data == null || _data.length !== 2) {
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

                participant.judgeWiseTotal[judgeId] += parseInt(
                  participant.score[_eventName][judgeId][criteria],
                  10,
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

  return eventName &&
    user &&
    eventMetadata &&
    participants &&
    filteredParticipants ? (
    <div className="flex flex-col justify-center w-fit min-w-[95%] ml-auto mr-auto">
      <div className="rounded-2xl p-4 m-2 bg-white border overflow-x-auto justify-between flex flex-row">
        <div>
          <h1 className="text-2xl font-bold">Welcome, {user.name}</h1>
          <p className="text-gray-700 mt-2">{user.email}</p>
        </div>
        <div className="flex flex-row">
          <button
            type="button"
            className="bg-[#fffece] text-[#2c350b] font-bold px-4 py-1 rounded-xl mr-2"
            onClick={() => router.push('/admin/event')}
          >
            Events
          </button>
          <button
            type="button"
            className="bg-[#fffece] text-[#2c350b] font-bold px-4 py-1 rounded-xl mr-2"
            onClick={() => router.push('/admin')}
          >
            Dashboard
          </button>
          <button
            type="button"
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
            {eventMetadata.group.map((group, _) => (
              <p
                key={group}
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
                ([key, value], _) => (
                  <tr key={`${key}-${value}`}>
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
          <h1 className="text-2xl font-bold">Leaderboard</h1>
          <table className="table-auto w-full mt-4">
            <thead>
              <tr>
                <th className="border px-4 py-2">Student</th>
                <th className="border px-4 py-2">Balvikas</th>
                {eventMetadata.evalCriteria &&
                  Object.keys(eventMetadata.evalCriteria).map((criteria, _) => (
                    <th
                      key={criteria}
                      className="border px-4 py-2"
                    >
                      {criteria}
                    </th>
                  ))}
                <th className="border px-4 py-2">Judge Wise Total</th>
                <th className="border px-4 py-2">Avg Total</th>
                <th className="border px-4 py-2">Comments</th>
              </tr>
            </thead>
            <tbody>
              {filteredParticipants.map((row, _) => (
                <tr key={row}>
                  <td
                    className={
                      'px-4 py-2 border max-w-[160px]' +
                      (row.substitute?.[eventMetadata.name]
                        ? ' bg-[#ffcece]'
                        : '')
                    }
                  >
                    {row.substitute?.[eventMetadata.name] ? (
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
                          {row.substitute[eventMetadata.name].newStudentGroup ??
                            '-'}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="font-bold">
                          {row.studentFullName ?? '-'}
                        </p>
                        <p className="text-xs">
                          {row.gender ?? '-'} - {row.dateOfBirth ?? '-'}
                        </p>
                        <div className="flex flex-wrap gap-1">
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
                  <td className="px-4 py-2 border max-w-[200px]">
                    <p className="font-bold">{row.district ?? '-'}</p>
                    <p className="text-xs">{row.samithiName ?? '-'}</p>
                    {row.studentGroup === 'Group 3' && (
                      <p className="text-xs">
                        Passed group 2: {row.hasPassedGroup2Exam ?? '-'}
                      </p>
                    )}
                    <div className="flex flex-wrap mt-2 gap-1">
                      {row.registeredEvents.map((event, _) => (
                        <p
                          key={event}
                          className="text-xs bg-green-200 text-green-800 font-bold rounded-xl p-1 px-2 w-fit"
                        >
                          {event ?? '-'}
                        </p>
                      ))}
                    </div>
                  </td>
                  {eventMetadata.evalCriteria &&
                    Object.keys(eventMetadata.evalCriteria).map(
                      (criteria, _) => (
                        <td
                          key={criteria}
                          className="px-4 py-2 border"
                        >
                          {eventMetadata.judgeIdList.map((judgeId, _) => (
                            <p
                              key={judgeId}
                              className="text-xs"
                            >
                              {row.score[eventName][judgeId][criteria]}
                            </p>
                          ))}
                        </td>
                      ),
                    )}
                  <td className="px-4 py-2 border font-bold">
                    {Object.values(row.judgeWiseTotal).map((total, _) => (
                      <p
                        key={total}
                        className="text-xs"
                      >
                        {total}
                      </p>
                    ))}
                  </td>
                  <td className="px-4 py-2 border font-bold">
                    {row.overallTotal}
                  </td>
                  <td className="px-4 py-2 border">
                    <div className="flex flex-col">
                      {eventMetadata.judgeIdList.map((judgeId, _) => (
                        <div
                          key={judgeId}
                          className="flex flex-col"
                        >
                          <p className="text-xs">
                            {row.comment[eventName][judgeId] === ''
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
  ) : (
    <div className="flex h-screen items-center justify-center">
      <p className="text-xl font-semibold">Loading...</p>
    </div>
  );
}
