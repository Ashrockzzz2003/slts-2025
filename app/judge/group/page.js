'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import secureLocalStorage from 'react-secure-storage';
import { getJudgeGroupEventData, markGroupScore } from '@/app/_util/data';
import { auth } from '@/app/_util/initApp';

export default function JudgeGroupPage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [eventMetadata, setEventMetadata] = useState(null);
  const [participants, setParticipants] = useState(null);
  // const [filteredParticipants, setFilteredParticipants] = useState(null);

  const [scoreBuffer, setScoreBuffer] = useState([]);
  const [scoreMode, setScoreMode] = useState({});
  const [commentBuffer, setCommentBuffer] = useState('');

  const [isSaving, setIsSaving] = useState(false);

  // const [searchQuery, setSearchQuery] = useState("");

  // TODO: Add search functionality.

  useEffect(() => {
    if (!secureLocalStorage.getItem('user')) {
      router.push('/');
    }

    const user = JSON.parse(secureLocalStorage.getItem('user'));
    if (user?.role !== 'judge' || !user.event) {
      router.push('/');
    } else {
      setUser(user);
      getJudgeGroupEventData(user.event).then((_data) => {
        if (_data == null || _data.length != 2) {
          router.push('/');
        }

        const _participants = _data[0];

        // Transform the data to an array of objects,
        // where each object represents a district and the number of participants with multiple registered events.
        const districtData = Object.entries(_participants).map(
          ([district, participants]) => ({
            district: district,
            numParticipantsWithMultipleEvents: participants.filter(
              (participant) => participant.registeredEvents.length > 1,
            ).length,
          }),
        );

        // Sort the districts based on the number of participants with multiple events in descending order.
        districtData.sort(
          (a, b) =>
            b.numParticipantsWithMultipleEvents -
            a.numParticipantsWithMultipleEvents,
        );

        // Create a new object to store the participants, where the districts are sorted based on the number of participants with multiple events.
        const sortedParticipants = {};
        districtData.forEach((districtData) => {
          _participants[districtData.district].sort((a, b) => {
            if (a.registeredEvents.length > b.registeredEvents.length) {
              return -1;
            }

            if (a.registeredEvents.length < b.registeredEvents.length) {
              return 1;
            }

            return 0;
          });
          sortedParticipants[districtData.district] =
            _participants[districtData.district];
        });

        setParticipants(sortedParticipants);
        setEventMetadata(_data[1]);
      });
    }
  }, [router]);

  return user && eventMetadata && participants ? (
    <>
      <div className="flex flex-col justify-center w-fit min-w-[95%] ml-auto mr-auto">
        <div className="rounded-2xl p-4 m-2 bg-white border overflow-x-auto justify-between flex flex-row">
          <div>
            <h1 className="text-2xl font-bold">Welcome, {user.name}</h1>
            <p className="text-gray-700 mt-2">{user.email}</p>
            <p className="font-bold">{user.event}</p>
          </div>
          <div>
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
            <div className="flex flex-row justify-between">
              <h1 className="text-2xl font-bold">{eventMetadata.name}</h1>
              <button
                className="bg-[#f7ffce] text-[#2c350b] font-bold px-4 py-1 rounded-xl"
                onClick={() => {
                  // secureLocalStorage.setItem("event", JSON.stringify(eventMetadata));
                  router.push(
                    `/judge/${eventMetadata.name.includes('GROUP') ? 'group/leaderboard' : 'individual/leaderboard'}?event=${encodeURIComponent(eventMetadata.name)}`,
                  );
                }}
              >
                View Leaderboard
              </button>
            </div>
            <p className="text-md">{Object.keys(participants).length} Teams</p>
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
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Each Group as one card */}
        <div className="flex flex-col justify-center w-fit min-w-[95%] ml-auto mr-auto">
          <div className="rounded-3xl p-4 my-4 bg-white border overflow-x-auto">
            <div className="flex flex-row justify-between">
              <h1 className="text-2xl font-bold">Participants</h1>
            </div>
            <div className="grid grid-cols-1 gap-4 mt-4">
              {Object.entries(participants).map(([_, val], index) => (
                <div
                  key={index}
                  className="rounded-2xl px-4 py-1 bg-gray-100 border"
                >
                  <div className="flex flex-row justify-between pb-4">
                    <div className="flex flex-col justify-between">
                      {val.map((participant, index) => (
                        <div
                          className="mt-4"
                          key={index}
                        >
                          <div className="flex flex-row justify-between">
                            <div>
                              <h2 className="text-xl font-bold">
                                {participant.studentId}
                              </h2>
                              <p className="text-sm">
                                Participating in{' '}
                                <span className="font-bold">
                                  {participant.registeredEvents.length}
                                </span>{' '}
                                event
                                {participant.registeredEvents.length > 1
                                  ? 's'
                                  : ''}
                                .
                              </p>
                              <p className="text-xs">
                                {participant.gender ?? '-'} -{' '}
                                {participant.dateOfBirth ?? '-'}
                              </p>
                              <p className="text-xs rounded-2xl w-fit">
                                {participant.studentGroup ?? '-'}
                              </p>
                            </div>
                          </div>
                          {/* <hr /> */}
                        </div>
                      ))}
                    </div>
                    <div className="mt-4">
                      {val[0].score &&
                      val[0].score[eventMetadata.name] &&
                      val[0].score[eventMetadata.name][user.id] ? (
                        <div className="mt-2 flex flex-col">
                          <button
                            className="bg-[#ffcece] text-[#350b0b] font-semibold px-4 py-1 rounded-xl mt-2"
                            onClick={() => {
                              const _scoreMode = {};

                              for (const region in participants) {
                                participants[region].forEach((p) => {
                                  _scoreMode[p.studentId] = false;
                                });
                              }

                              val.forEach((p) => {
                                _scoreMode[p.studentId] = true;
                              });

                              setScoreBuffer(
                                Object.entries(
                                  val[0].score[eventMetadata.name][user.id],
                                ).map(([key, val]) => [key, val]),
                              );

                              setScoreMode(_scoreMode);
                              setCommentBuffer(
                                val[0].comment[eventMetadata.name][user.id] ??
                                  '',
                              );
                            }}
                          >
                            Edit Score
                          </button>
                        </div>
                      ) : scoreMode[val[0].studentId] == false ||
                        scoreMode[val[0].studentId] == undefined ? (
                        <button
                          className="bg-[#ffd8a1] text-[#35250b] font-semibold px-4 py-1 rounded-xl mt-2"
                          onClick={() => {
                            const _scoreMode = {};
                            for (const region in participants) {
                              participants[region].forEach((p) => {
                                _scoreMode[p.studentId] = false;
                              });
                            }

                            val.forEach((p) => {
                              _scoreMode[p.studentId] = true;
                            });
                            setScoreBuffer(
                              Object.entries(eventMetadata.evalCriteria).map(
                                ([key, _]) => [key, 0],
                              ),
                            );
                            setScoreMode(_scoreMode);
                            setCommentBuffer('');
                          }}
                        >
                          Evaluate
                        </button>
                      ) : (
                        <p className="bg-[#a1fffd] text-[#0b3533] font-semibold px-4 py-1 rounded-xl mt-2">
                          Evaluating
                        </p>
                      )}
                    </div>
                  </div>
                  {scoreMode[val[0].studentId] && eventMetadata.evalCriteria ? (
                    <div>
                      <hr className="my-4" />
                      <div className="flex flex-col gap-2 justify-center items-stretch align-middle">
                        {scoreBuffer.map(([key, val], index) => (
                          <div
                            key={index}
                            className="flex flex-row justify-between items-center"
                          >
                            <label className="text-sm">{key}</label>
                            <input
                              type="number"
                              className="border p-2 rounded-lg text-md"
                              max={eventMetadata.evalCriteria[key]}
                              min={0}
                              value={val}
                              onChange={(e) => {
                                if (e.target.value < 0) {
                                  e.target.value = 0;
                                } else if (
                                  e.target.value >
                                  eventMetadata.evalCriteria[key]
                                ) {
                                  e.target.value =
                                    eventMetadata.evalCriteria[key];
                                }
                                const newBuffer = [...scoreBuffer];
                                newBuffer[index][1] = e.target.value;
                                setScoreBuffer(newBuffer);
                              }}
                            />
                          </div>
                        ))}

                        <hr className="border-dashed mt-2" />
                        <div className="flex flex-row justify-between align-middle">
                          <label className="text-sm">Total</label>
                          <p className="text-md font-semibold">
                            {scoreBuffer.reduce(
                              (a, b) =>
                                (a == '' ? 0 : a) +
                                parseInt(b[1] == '' ? 0 : b[1]),
                              0,
                            )}
                          </p>
                        </div>

                        <hr className="border-dashed" />
                        <div className="flex flex-col gap-2">
                          <label className="text-sm">Comments (Optional)</label>
                          <textarea
                            className="border p-2 rounded-lg"
                            value={commentBuffer}
                            onChange={(e) => setCommentBuffer(e.target.value)}
                          />
                        </div>

                        <div className="flex flex-row justify-between gap-1 my-2">
                          <button
                            className="bg-[#ffe0e0] text-[#350b0b] font-semibold px-4 py-1 rounded-xl mt-2 w-full disabled:opacity-50"
                            disabled={isSaving}
                            onClick={() => {
                              setScoreBuffer([]);

                              const _scoreMode = {};
                              for (const region in participants) {
                                participants[region].forEach((p) => {
                                  _scoreMode[p.studentId] = false;
                                });
                              }
                              setScoreMode(_scoreMode);
                            }}
                          >
                            Cancel
                          </button>
                          <button
                            className="bg-[#c2fca2] text-[#0b350d] font-semibold px-4 py-1 rounded-xl mt-2 w-full disabled:opacity-50"
                            disabled={isSaving}
                            onClick={() => {
                              setIsSaving(true);

                              // Check if marks are within the range.
                              for (let i = 0; i < scoreBuffer.length; i++) {
                                // Check if the marks are present and within the range.
                                if (scoreBuffer[i][1] == '') {
                                  alert(
                                    `Please provide marks for ${scoreBuffer[i][0]}.`,
                                  );
                                  setIsSaving(false);
                                  return;
                                }

                                if (isNaN(scoreBuffer[i][1])) {
                                  alert(
                                    `Marks for ${scoreBuffer[i][0]} should be a number.`,
                                  );
                                  setIsSaving(false);
                                  return;
                                }

                                if (
                                  scoreBuffer[i][1] < 0 ||
                                  scoreBuffer[i][1] >
                                    eventMetadata.evalCriteria[
                                      scoreBuffer[i][0]
                                    ]
                                ) {
                                  alert(
                                    `Marks for ${scoreBuffer[i][0]} should be between 0 and ${eventMetadata.evalCriteria[scoreBuffer[i][0]]}.`,
                                  );
                                  setIsSaving(false);
                                  return;
                                }
                              }

                              markGroupScore(
                                val.map((p) => p.studentId),
                                eventMetadata.name,
                                user.id,
                                Object.fromEntries(scoreBuffer),
                                commentBuffer,
                              )
                                .then((res) => {
                                  if (res) {
                                    const _scoreMode = {};

                                    for (const region in participants) {
                                      participants[region].forEach((p) => {
                                        _scoreMode[p.studentId] = false;
                                      });
                                    }
                                    setScoreMode(_scoreMode);

                                    const _participants = [];

                                    for (const region in participants) {
                                      _participants.push(
                                        ...participants[region],
                                      );
                                    }

                                    const indices = _participants.map(
                                      (p, _) => p.district === val[0].district,
                                    );

                                    for (
                                      let i = 0;
                                      i < _participants.length;
                                      i++
                                    ) {
                                      if (indices[i]) {
                                        _participants[i].score =
                                          _participants[i].score ?? {};
                                        _participants[i].score[
                                          eventMetadata.name
                                        ] =
                                          _participants[i].score[
                                            eventMetadata.name
                                          ] ?? {};
                                        _participants[i].score[
                                          eventMetadata.name
                                        ][user.id] = {};

                                        scoreBuffer.forEach(([key, val]) => {
                                          _participants[i].score[
                                            eventMetadata.name
                                          ][user.id][key] = val;
                                        });

                                        _participants[i].comment =
                                          _participants[i].comment ?? {};

                                        _participants[i].comment[
                                          eventMetadata.name
                                        ] =
                                          _participants[i].comment[
                                            eventMetadata.name
                                          ] ?? {};
                                        _participants[i].comment[
                                          eventMetadata.name
                                        ][user.id] = commentBuffer;
                                      }
                                    }

                                    const updatedParticipants = {};
                                    for (const region in participants) {
                                      updatedParticipants[region] =
                                        _participants.filter(
                                          (p) => p.district === region,
                                        );
                                    }

                                    setParticipants(updatedParticipants);
                                  }

                                  setIsSaving(false);
                                })
                                .catch((_) => {
                                  alert('An error occurred. Please try again.');
                                  setIsSaving(false);
                                });
                            }}
                          >
                            {isSaving ? 'Saving...' : 'Save'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : val[0].score &&
                    val[0].score[eventMetadata.name] &&
                    val[0].score[eventMetadata.name][user.id] ? (
                    <div className="flex flex-col gap-2 mt-4">
                      <hr />
                      <h2 className="text-lg font-bold">Score</h2>
                      {Object.entries(
                        val[0].score[eventMetadata.name][user.id],
                      ).map(([key, val], index) => (
                        <div
                          key={index}
                          className="flex flex-row justify-between items-center"
                        >
                          <label className="text-sm">{key}</label>
                          <p className="text-md font-semibold">{val}</p>
                        </div>
                      ))}
                      <hr className="border-dashed" />
                      <div className="flex flex-row justify-between items-center">
                        <label className="text-sm">Total</label>
                        <p className="text-md font-semibold">
                          {Object.values(
                            val[0].score[eventMetadata.name][user.id],
                          ).reduce((a, b) => a + parseInt(b), 0)}
                        </p>
                      </div>
                      <hr className="border-dashed" />
                      <div className="flex flex-col gap-2 mb-2">
                        <label className="text-sm font-bold">Comments</label>
                        <p className="text-md">
                          {val[0].comment[eventMetadata.name][user.id] ?? '-'}
                        </p>
                      </div>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
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
