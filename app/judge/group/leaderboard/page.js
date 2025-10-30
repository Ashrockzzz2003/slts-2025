'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import secureLocalStorage from 'react-secure-storage';
import { getJudgeEventData } from '@/app/_util/data';
import { auth } from '@/app/_util/initApp';

export default function GroupEventLeaderboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState(null);
  const [eventName, setEventName] = useState(null);
  const [eventMetadata, setEventMetadata] = useState(null);
  const [groups, setGroups] = useState(null);

  useEffect(() => {
    if (!secureLocalStorage.getItem('user')) {
      router.push('/');
    }

    const user = JSON.parse(secureLocalStorage.getItem('user'));
    const _eventName = decodeURIComponent(searchParams.get('event') ?? '');
    setEventName(_eventName);

    if (!_eventName) router.push('/');

    if (user.role !== 'judge' || !_eventName) {
      router.push('/');
    } else {
      setUser(user);
      getJudgeEventData(_eventName).then((_data) => {
        if (_data == null || _data.length !== 2) {
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
            name: participant.studentFullName || 'Unknown',
            id: participant.studentId || 'Unknown ID',
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

              group.judgeWiseTotal[judgeId] += parseInt(
                group.score[_eventName][judgeId][criteria],
                10,
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
      });
    }
  }, [router, eventName, searchParams]);

  return eventName && user && eventMetadata && groups ? (
    <div className="flex flex-col justify-center w-screen min-w-[95%] ml-auto mr-auto">
      <div className="rounded-2xl p-4 m-2 bg-white border overflow-x-auto justify-between flex flex-col md:flex-row">
        <div>
          <h1 className="text-2xl font-bold">Welcome, {user.name}</h1>
          <p className="text-gray-700 mt-2">{user.email}</p>
        </div>
        <div className="flex flex-row">
          <button
            type="button"
            className="bg-[#fffece] text-[#2c350b] font-bold px-4 py-1 rounded-xl mr-2"
            onClick={() => router.push('/judge/group')}
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
          <h1 className="text-xl font-bold">{eventMetadata.name}</h1>
          <p className="text-md">{groups.length} Groups</p>
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
                {/* <th className="border px-4 py-2">District</th> */}
                <th className="border px-4 py-1">Students</th>
                {/* {eventMetadata.evalCriteria && Object.keys(eventMetadata.evalCriteria).map((criteria, index) => (
                                        <th key={index} className="border px-4 py-2">{criteria}</th>
                                    ))} */}
                <th className="border px-4 py-1">Judge Wise Total</th>
                <th className="border px-4 py-1">Total</th>
                <th className="border px-4 py-1">Comments</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((group, _) => (
                <tr key={group}>
                  {/* <td className="px-4 py-2 border font-bold">{group.district ?? "Unknown"}</td> */}
                  <td className="px-4 py-2 border">
                    <p className="text-sm">{group.district ?? '-'}</p>
                    {group.members.map((member, _) => (
                      <p
                        key={member}
                        className="text-xs mt-2"
                      >
                        <span className="font-bold bg-gray-100 p-1 rounded-2xl pr-2">
                          {member.id}
                        </span>
                      </p>
                    ))}
                  </td>
                  {/* {eventMetadata.evalCriteria && Object.keys(eventMetadata.evalCriteria).map((criteria, i1) => (
                                            <td key={i1} className="px-4 py-2 border">
                                                {eventMetadata.judgeIdList.map((judgeId, i2) => (
                                                    <p key={i2} className="text-xs">{group.score[(eventName)][judgeId][criteria]}</p>
                                                ))}
                                            </td>
                                        ))} */}
                  <td className="px-4 py-2 border font-bold">
                    {Object.values(group.judgeWiseTotal).map((total, _) => (
                      <p
                        key={total}
                        className="text-xs"
                      >
                        {total}
                      </p>
                    ))}
                  </td>
                  <td className="px-4 py-2 border font-bold">
                    {group.overallTotal}
                  </td>
                  <td className="px-4 py-2 border">
                    {eventMetadata.judgeIdList.map((judgeId, _) => (
                      <p
                        key={judgeId}
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
  ) : (
    <div className="flex h-screen items-center justify-center">
      <p className="text-xl font-semibold">Loading...</p>
    </div>
  );
}
