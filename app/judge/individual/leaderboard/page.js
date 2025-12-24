'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import secureLocalStorage from 'react-secure-storage';
import { getJudgeEventData } from '@/app/_util/data';
import { auth } from '@/app/_util/initApp';

export default function EventLeaderboardIndiPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [user, setUser] = useState(null);
  const [eventName, setEventName] = useState(null);
  const [eventMetadata, setEventMetadata] = useState(null);
  const [participants, setParticipants] = useState(null);
  const [filteredParticipants, setFilteredParticipants] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!secureLocalStorage.getItem('user')) {
      router.push('/');
    }

    const user = JSON.parse(secureLocalStorage.getItem('user'));
    const _eventName = decodeURIComponent(searchParams.get('event') ?? '');
    setEventName(_eventName);

    if (user.role !== 'judge' || !_eventName) {
      router.push('/');
    } else {
      setUser(user);
      getJudgeEventData(_eventName).then((_data) => {
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
        setParticipants(_data[0]);
        setFilteredParticipants(_data[0]);
      });
    }
  }, [router, eventName, searchParams]);

  return eventName &&
    user &&
    eventMetadata &&
    participants &&
    filteredParticipants ? (
    <>
      <div className="flex flex-col justify-center w-screen min-w-[95%] ml-auto mr-auto">
        <div className="rounded-2xl p-4 m-2 bg-white border overflow-x-auto justify-between flex flex-col md:flex-row">
          <div>
            <h1 className="text-2xl font-bold">Welcome, {user.name}</h1>
            <p className="text-gray-700 mt-2">{user.email}</p>
          </div>
          <div className="flex flex-row mt-2 md:mt-0">
            <button
              className="bg-[#fffece] text-[#2c350b] font-bold px-4 py-1 rounded-xl mr-2"
              onClick={() => router.push('/judge/individual')}
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
            <h1 className="text-xl font-bold">{eventMetadata.name}</h1>
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
            <h1 className="text-2xl font-bold">Leaderboard</h1>
            <table className="table-auto w-full mt-4">
              <thead>
                <tr>
                  <th className="border px-4 py-2">Student</th>
                  {/* {eventMetadata.evalCriteria && Object.keys(eventMetadata.evalCriteria).map((criteria, index) => (
                                        <th key={index} className="border px-4 py-2">{criteria}</th>
                                    ))} */}
                  <th className="border px-4 py-2">Judge Wise Total</th>
                  <th className="border px-4 py-2">Total</th>
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
                          <div className="flex flex-wrap gap-1">
                            <p className="text-xs font-bold bg-[#c4ffc2] text-[#07210d] p-1 px-2 rounded-2xl w-fit">
                              {row.studentId ?? '-'}
                            </p>
                            <p className="text-xs font-bold bg-[#bad1ff] text-[#090e2d] p-1 px-2 rounded-2xl w-fit">
                              {row.studentGroup ?? '-'}
                            </p>
                          </div>
                          <p className="px-2 text-xs pt-2">
                            {row.gender ?? '-'} - {row.dateOfBirth ?? '-'}
                          </p>
                        </div>
                      )}
                    </td>
                    {/* {eventMetadata.evalCriteria && Object.keys(eventMetadata.evalCriteria).map((criteria, i1) => (
                                            <td key={i1} className="px-4 py-2 border">
                                                {eventMetadata.judgeIdList.map((judgeId, i2) => (
                                                    <p key={i2} className="text-xs">{row.score[(eventName)][judgeId][criteria]}</p>
                                                ))}
                                            </td>
                                        ))} */}
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
