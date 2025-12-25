'use client';

import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import secureLocalStorage from 'react-secure-storage';
import {
  getJudgeEventData,
  getStudentData,
  markScore,
  removeSubstitute,
  substituteEvent,
} from '@/app/_util/data';
import { auth } from '@/app/_util/initApp';

export default function JudgePage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [eventMetadata, setEventMetadata] = useState(null);
  const [participants, setParticipants] = useState(null);
  const [filteredParticipants, setFilteredParticipants] = useState(null);

  const [scoreBuffer, setScoreBuffer] = useState([]);
  const [commentBuffer, setCommentBuffer] = useState('');
  const [scoreMode, setScoreMode] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');

  const [isSaving, setIsSaving] = useState(false);

  const [isOpen, setIsOpen] = useState(false);
  const [isNewSelected, setIsNewSelected] = useState(false); // State to track if "New" is clicked
  const [reason, setReason] = useState('');
  const [toRemoveStudentId, setToRemoveStudentId] = useState('');
  const [studentId, setStudentId] = useState('');
  const [studentName, setStudentName] = useState('');
  const [groupNumber, setGroupNumber] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');

  const handleInputChange = (e, field) => {
    switch (field) {
      case 'studentId':
        setStudentId(e.target.value.toString().toUpperCase());
        break;
      case 'groupNumber':
        setGroupNumber(e.target.value);
        break;
      case 'dob':
        setDob(e.target.value);
        break;
      case 'gender':
        setGender(e.target.value);
        break;
      case 'name':
        setStudentName(e.target.value);
        break;
      default:
        break;
    }
  };

  const handleSubmitSubstitution = () => {
    if (
      studentId.toString().trim().toLowerCase() ===
      toRemoveStudentId.toString().trim().toLowerCase()
    ) {
      alert('Student ID cannot be the same as the student to be removed.');
      return;
    }

    if (isNewSelected) {
      if (
        studentName.trim() === '' ||
        dob.trim() === '' ||
        groupNumber.trim() === '' ||
        gender.trim() === ''
      ) {
        alert('Please fill in all fields.');
        return;
      }
    }

    if (reason.trim() === '') {
      alert('Please provide a reason.');
      return;
    }

    if (!isNewSelected && studentId.trim() === '') {
      alert('Please provide a student ID.');
      return;
    }

    setIsLoading(true);
    if (isNewSelected) {
      substituteEvent(
        eventMetadata.name,
        toRemoveStudentId,
        studentId,
        studentName,
        groupNumber,
        gender,
        dob,
        reason,
        user.id,
      )
        .then((res) => {
          if (res.toString().length > 0) {
            alert(res.toString());
          } else {
            alert('Substitution successful.');
            window.location.reload();
          }
        })
        .catch((_) => {
          alert('An error occurred. Please try again.');
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      // Check if student exists
      getStudentData(studentId)
        .then((data) => {
          if (data) {
            substituteEvent(
              eventMetadata.name,
              toRemoveStudentId,
              studentId,
              studentName,
              groupNumber,
              gender,
              dob,
              reason,
              user.id,
            )
              .then((res) => {
                if (res.toString().length > 0) {
                  alert(res.toString());
                } else {
                  alert('Substitution successful.');
                  window.location.reload();
                }
              })
              .catch((_) => {
                alert('An error occurred. Please try again.');
              })
              .finally(() => {
                setIsLoading(false);
              });
          } else {
            alert('Student does not exist. Please check the ID again.');
          }
        })
        .catch((_) => {
          alert('An error occurred. Please try again.');
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  };

  useEffect(() => {
    if (participants) {
      setFilteredParticipants(
        participants.filter((participant) => {
          return (
            searchQuery == '' ||
            participant.studentId
              .toLowerCase()
              .includes(searchQuery.toLowerCase())
          );
        }),
      );
    }
  }, [searchQuery, participants]);

  useEffect(() => {
    if (!secureLocalStorage.getItem('user')) {
      router.push('/');
    }

    const user = JSON.parse(secureLocalStorage.getItem('user'));
    if (user.role !== 'judge' || !user.event) {
      router.push('/');
    } else {
      setUser(user);
      getJudgeEventData(user.event).then((_data) => {
        if (_data == null || _data.length != 2) {
          router.push('/');
        }

        const _scoreMode = {};
        _data[0].forEach((participant) => {
          _scoreMode[participant.studentId] = false;
        });
        setScoreMode(_scoreMode);
        setEventMetadata(_data[1]);

        const _participants = _data[0];
        // Sort paricipants based on registeredEvents.length.
        // If a participant is in a group event, they should be evaluated first.
        _participants.sort((a, b) => {
          if (
            a.registeredEvents.some((x) => x.includes('GROUP')) &&
            !b.registeredEvents.some((x) => x.includes('GROUP'))
          ) {
            return -1;
          }

          if (
            !a.registeredEvents.some((x) => x.includes('GROUP')) &&
            b.registeredEvents.some((x) => x.includes('GROUP'))
          ) {
            return 1;
          }

          if (a.registeredEvents.length > b.registeredEvents.length) {
            return -1;
          }

          if (a.registeredEvents.length < b.registeredEvents.length) {
            return 1;
          }

          return 0;
        });

        setParticipants(_participants);
        setFilteredParticipants(_participants);
      });
    }
  }, [router]);

  return user && eventMetadata && participants && filteredParticipants ? (
    <>
      <div className="flex flex-col justify-center w-fit min-w-[95%] ml-auto mr-auto">
        <div className="rounded-2xl p-4 m-2 bg-white border overflow-x-auto justify-between flex flex-row">
          <div>
            <h1 className="text-2xl font-bold">Welcome, {user.name}</h1>
            <p className="text-gray-700 mt-2">{user.email}</p>
            <p className="text-gray-700">
              Judge for <span className="font-bold">{user.event}</span>
            </p>
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

        {/* Design mobile-friendly */}

        <div className="flex flex-col justify-center w-fit min-w-[95%] ml-auto mr-auto">
          <div className="rounded-2xl p-4 bg-white border overflow-x-auto">
            <div className="flex flex-row justify-between">
              <h1 className="text-2xl font-bold">{eventMetadata.name}</h1>
              <button
                className="bg-[#f7ffce] text-[#2c350b] font-bold px-4 py-1 rounded-xl"
                onClick={() => {
                  //    secureLocalStorage.setItem("event", JSON.stringify(eventMetadata));
                  router.push(
                    `/judge/${
                      eventMetadata.name.includes('GROUP')
                        ? 'group/leaderboard'
                        : 'individual/leaderboard'
                    }?event=${encodeURIComponent(eventMetadata.name)}`,
                  );
                }}
              >
                View Leaderboard
              </button>
            </div>
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

        {/* Participants as cards */}
        <div className="flex flex-col justify-center w-fit min-w-[95%] ml-auto mr-auto">
          <div className="rounded-2xl p-4 my-4 bg-white border overflow-x-auto">
            <div className="flex flex-row justify-between">
              <h1 className="text-2xl font-bold">Participants</h1>
            </div>

            {/* Search bar */}
            <div className="flex flex-row justify-between items-center mt-4">
              <input
                type="text"
                placeholder="Enter Participant ID"
                className="border p-2 rounded-lg w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 mt-4">
              {filteredParticipants.map((participant, index) => (
                <div
                  key={index}
                  className="rounded-2xl p-2 bg-gray-100 border"
                >
                  <div className="flex flex-row justify-between">
                    {participant.substitute &&
                    participant.substitute[eventMetadata.name] ? (
                      <div>
                        <p className="text-xs font-semibold text-[#32350b] rounded-2xl w-fit">
                          Substituted Student - Original{' '}
                          <span className="font-bold">
                            {participant.studentId}
                          </span>
                        </p>
                        <h2 className="text-xl font-bold">
                          {
                            participant.substitute[eventMetadata.name]
                              .newStudentName
                          }
                        </h2>
                        <p className="text-xs">
                          {participant.substitute[eventMetadata.name]
                            .newStudentGender ?? '-'}{' '}
                          -{' '}
                          {participant.substitute[eventMetadata.name]
                            .newStudentDOB ?? '-'}
                        </p>
                        <p className="text-xs mt-2 font-bold bg-[#bad1ff] text-[#090e2d] p-1 px-2 rounded-2xl w-fit">
                          {participant.substitute[eventMetadata.name]
                            .newStudentGroup ?? '-'}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-xl font-bold">
                            {participant.studentId}
                          </h2>

                          <span
                            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                              participant.ATTENDEE_STATUS === 'Attended'
                                ? 'bg-green-100 text-green-700 border border-green-300'
                                : 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                            }`}
                          >
                            {participant.ATTENDEE_STATUS === 'Attended'
                              ? 'Present'
                              : 'Yet to Check In'}
                          </span>
                        </div>
                        <p className="text-sm">
                          Participating in{' '}
                          <span className="font-bold">
                            {participant.registeredEvents.length}
                          </span>{' '}
                          event
                          {participant.registeredEvents.length > 1 ? 's' : ''}.
                        </p>

                        {/* Other registered events (excluding current) */}
                        {participant.registeredEvents.filter(
                          (ev) => ev !== eventMetadata.name,
                        ).length > 0 && (
                          <div className="text-sm mb-3 text-gray-600">
                            <span className="mr-1">Also participating in</span>
                            <span className="inline-flex flex-wrap gap-1">
                              {participant.registeredEvents
                                .filter((ev) => ev !== eventMetadata.name)
                                .map((ev, i) => (
                                  <span
                                    key={i}
                                    className="px-2 py-0.5 rounded-full bg-violet-50 font-semibold text-violet-700 border-2 border-violet-300 text-xs"
                                  >
                                    {ev}
                                  </span>
                                ))}
                            </span>
                          </div>
                        )}

                        {participant.registeredEvents.some((x) =>
                          x.includes('GROUP'),
                        ) && (
                          <p className="text-xs">
                            Also in a group event. Please evaluate first.
                          </p>
                        )}
                        <p className="text-xs text-gray-700">
                          {participant.gender ?? '-'} -{' '}
                          {participant.dateOfBirth ?? '-'}
                        </p>
                        <p className="text-xs mt-2 font-bold bg-[#bad1ff] text-[#090e2d] p-1 px-2 rounded-2xl w-fit">
                          {participant.studentGroup ?? '-'}
                        </p>
                      </div>
                    )}

                    <div>
                      {participant.score &&
                      participant.score[eventMetadata.name] &&
                      participant.score[eventMetadata.name][user.id] ? (
                        <div className="mt-2 flex flex-col">
                          {participant.substitute &&
                          participant.substitute[eventMetadata.name] ? (
                            <button
                              className="bg-[#ffcccc] text-[#660000] font-semibold px-4 py-1 rounded-xl mt-2"
                              onClick={() => {
                                setIsLoading(true);
                                removeSubstitute(
                                  eventMetadata.name,
                                  participant.studentId,
                                )
                                  .then((res) => {
                                    if (res.toString().length > 0) {
                                      alert(res.toString());
                                    } else {
                                      alert('Substitution removed.');
                                      window.location.reload();
                                    }
                                  })
                                  .catch((_) => {
                                    alert(
                                      'An error occurred. Please try again.',
                                    );
                                  })
                                  .finally(() => {
                                    setIsLoading(false);
                                  });
                              }}
                            >
                              Remove Substitute
                            </button>
                          ) : (
                            <button
                              className="bg-[#cceeff] text-[#003366] font-semibold px-4 py-1 rounded-xl mt-2"
                              onClick={() => {
                                setIsOpen(true);
                                setToRemoveStudentId(participant.studentId);
                              }}
                            >
                              Substitute
                            </button>
                          )}
                          <button
                            className="bg-[#ffcece] text-[#350b0b] font-semibold px-4 py-1 rounded-xl mt-2"
                            onClick={() => {
                              const _scoreMode = {};
                              participants.forEach((p) => {
                                _scoreMode[p.studentId] = false;
                              });
                              _scoreMode[participant.studentId] = true;

                              setScoreBuffer(
                                Object.entries(
                                  participant.score[eventMetadata.name][
                                    user.id
                                  ],
                                ).map(([key, val]) => [key, val]),
                              );

                              setScoreMode(_scoreMode);
                              setCommentBuffer(
                                participant.comment[eventMetadata.name][
                                  user.id
                                ] ?? '',
                              );
                            }}
                          >
                            Edit Score
                          </button>
                        </div>
                      ) : scoreMode[participant.studentId] == false ? (
                        <div className="flex flex-col justify-between">
                          {participant.substitute &&
                          participant.substitute[eventMetadata.name] ? (
                            <button
                              className="bg-[#ffcccc] text-[#660000] font-semibold px-4 py-1 rounded-xl mt-2"
                              onClick={() => {
                                setIsLoading(true);
                                removeSubstitute(
                                  eventMetadata.name,
                                  participant.studentId,
                                )
                                  .then((res) => {
                                    if (res.toString().length > 0) {
                                      alert(res.toString());
                                    } else {
                                      alert('Substitution removed.');
                                      window.location.reload();
                                    }
                                  })
                                  .catch((_) => {
                                    alert(
                                      'An error occurred. Please try again.',
                                    );
                                  })
                                  .finally(() => {
                                    setIsLoading(false);
                                  });
                              }}
                            >
                              Remove Substitute
                            </button>
                          ) : (
                            <button
                              className="bg-[#cceeff] text-[#003366] font-semibold px-4 py-1 rounded-xl mt-2"
                              onClick={() => {
                                setIsOpen(true);
                                setToRemoveStudentId(participant.studentId);
                              }}
                            >
                              Substitute
                            </button>
                          )}
                          <button
                            className="bg-[#ffd8a1] text-[#35250b] font-semibold px-4 py-1 rounded-xl mt-2"
                            onClick={() => {
                              const _scoreMode = {};
                              participants.forEach((p) => {
                                _scoreMode[p.studentId] = false;
                              });
                              _scoreMode[participant.studentId] = true;
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
                        </div>
                      ) : (
                        <p className="bg-[#a1fffd] text-[#0b3533] font-semibold px-4 py-1 rounded-xl mt-2">
                          Evaluating
                        </p>
                      )}
                    </div>
                  </div>

                  {scoreMode[participant.studentId] &&
                  eventMetadata.evalCriteria ? (
                    <>
                      <hr className="my-4" />
                      <div className="flex flex-col gap-2 justify-center items-stretch align-middle">
                        {scoreBuffer.map(([key, val], index) => (
                          <div
                            key={index}
                            className="flex flex-row justify-between items-center"
                          >
                            <label className="text-sm">{key}</label>
                            <div className="flex flex-row items-center justify-end gap-1 w-full">
                              <input
                                type="number"
                                step="0.01"
                                className="border p-2 rounded-lg text-md w-18 border-slate-300"
                                max={eventMetadata.evalCriteria[key]}
                                min={0}
                                value={val}
                                onChange={(e) => {
                                  let value = e.target.value;

                                  // Block more than 2 decimal places
                                  if (value.includes('.')) {
                                    const [intPart, decimalPart] =
                                      value.split('.');
                                    value =
                                      intPart + '.' + decimalPart.slice(0, 2);
                                  }

                                  // Apply constraints
                                  if (value !== '') {
                                    const num = parseFloat(value);
                                    if (num < 0) {
                                      value = '0';
                                    } else if (
                                      num > eventMetadata.evalCriteria[key]
                                    ) {
                                      value = String(
                                        eventMetadata.evalCriteria[key],
                                      );
                                    }
                                  }

                                  const newBuffer = [...scoreBuffer];
                                  newBuffer[index][1] = value;
                                  setScoreBuffer(newBuffer);
                                }}
                              />
                              <span className="text-md w-8 text-right">
                                {' '}
                                / {eventMetadata.evalCriteria[key]}
                              </span>
                            </div>
                          </div>
                        ))}

                        <hr className="border-dashed mt-2" />
                        <div className="flex flex-row justify-between align-middle">
                          <label className="text-sm">Total</label>
                          <div className="flex flex-row items-center justify-end gap-1 w-full">
                            <p className="text-md font-semibold w-18 text-right">
                              {scoreBuffer
                                .reduce(
                                  (a, b) =>
                                    a + parseFloat(b[1] === '' ? 0 : b[1]),
                                  0,
                                )
                                .toFixed(2)}
                            </p>
                            <span className="text-md w-8 text-right">
                              {' '}
                              /{' '}
                              {Object.values(eventMetadata.evalCriteria).reduce(
                                (a, b) => a + b,
                                0,
                              )}
                            </span>
                          </div>
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

                        <div className="flex flex-row justify-between gap-1">
                          <button
                            className="bg-[#ffe0e0] text-[#350b0b] font-semibold px-4 py-1 rounded-xl mt-2 w-full disabled:opacity-50"
                            disabled={isSaving}
                            onClick={() => {
                              setScoreBuffer([]);

                              const _scoreMode = {};
                              participants.forEach((p) => {
                                _scoreMode[p.studentId] = false;
                              });
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

                              // Check if the marks are within the range.
                              for (let i = 0; i < scoreBuffer.length; i++) {
                                // Check if marks are present.
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

                              markScore(
                                participant.studentId,
                                eventMetadata.name,
                                user.id,
                                Object.fromEntries(scoreBuffer),
                                commentBuffer,
                              )
                                .then((res) => {
                                  if (res) {
                                    const _scoreMode = {};
                                    participants.forEach((p) => {
                                      _scoreMode[p.studentId] = false;
                                    });
                                    setScoreMode(_scoreMode);

                                    const _participants = [...participants];
                                    const i = _participants.findIndex(
                                      (p) =>
                                        p.studentId == participant.studentId,
                                    );
                                    _participants[i].score =
                                      _participants[i].score ?? {};
                                    _participants[i].score[eventMetadata.name] =
                                      _participants[i].score[
                                        eventMetadata.name
                                      ] ?? {};
                                    _participants[i].score[eventMetadata.name][
                                      user.id
                                    ] = {};
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

                                    setParticipants(_participants);
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
                    </>
                  ) : participant.score &&
                    participant.score[eventMetadata.name] &&
                    participant.score[eventMetadata.name][user.id] ? (
                    <div className="flex flex-col gap-2 mt-4">
                      <hr />
                      <h2 className="text-lg font-bold">Score</h2>
                      {Object.entries(
                        participant.score[eventMetadata.name][user.id],
                      ).map(([key, val], index) => (
                        <div
                          key={index}
                          className="flex flex-row justify-between items-center"
                        >
                          <label className="text-sm">{key}</label>
                          <div className="flex flex-row items-center justify-end gap-1 w-full">
                            <p className="text-md font-semibold w-18 text-right">
                              {val}
                            </p>
                            <span className="text-md w-8 text-right">
                              {' '}
                              / {eventMetadata.evalCriteria[key]}
                            </span>
                          </div>
                        </div>
                      ))}
                      <hr className="border-dashed" />
                      <div className="flex flex-row justify-between items-center">
                        <label className="text-sm">Total</label>
                        <div className="flex flex-row items-center justify-end gap-1 w-full">
                          <p className="text-md font-semibold w-18 text-right">
                            {Object.values(
                              participant.score[eventMetadata.name][user.id],
                            )
                              .reduce((a, b) => a + parseFloat(b), 0)
                              .toFixed(2)}
                          </p>
                          <span className="text-md w-8 text-right">
                            {' '}
                            /{' '}
                            {Object.values(eventMetadata.evalCriteria).reduce(
                              (a, b) => a + b,
                              0,
                            )}
                          </span>
                        </div>
                      </div>
                      <hr className="border-dashed" />
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-bold">Comments</label>
                        <p className="text-md">
                          {participant.comment[eventMetadata.name][user.id] ??
                            '-'}
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

      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="fixed z-50 shadow-2xl"
      >
        <div className="fixed inset-0 flex w-screen items-center justify-center p-2 overflow-y-auto backdrop-blur-sm">
          <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-4 text-left align-middle">
            <div className="flex flex-row justify-between my-2">
              <DialogTitle className="text-sm font-medium text-gray-900 w-[70%]">
                Reason why student is not participating in the event
              </DialogTitle>
              <button
                onClick={() => setIsOpen(false)}
                className="bg-gray-200 p-1 rounded-full"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="black"
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
            <textarea
              placeholder="Type here...."
              className="border p-2 rounded-2xl w-full"
              onChange={(e) => setReason(e.target.value)}
            ></textarea>

            <div className="mt-4">
              <p className="font-semibold">Add Substitute</p>
              <div className="flex flex-row justify-between">
                <button
                  className={`font-bold px-4 py-1 rounded-xl mr-2 my-2 w-full disabled:opacity-50 ${isNewSelected ? 'bg-black text-white' : 'border border-black'}`}
                  onClick={() => setIsNewSelected(true)}
                >
                  New
                </button>
                <button
                  className={`font-bold px-4 py-1 rounded-xl mr-2 my-2 w-full disabled:opacity-50 ${!isNewSelected ? 'bg-black text-white' : 'border border-black'}`}
                  onClick={() => setIsNewSelected(false)}
                >
                  Has SLTS ID
                </button>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-xs mx-2 mt-2">
                Please enter the student details below
              </p>
              {isNewSelected ? (
                <div>
                  <input
                    type="text"
                    placeholder="Student Name"
                    value={studentName}
                    onChange={(e) => handleInputChange(e, 'name')}
                    className="border p-2 rounded-2xl w-full mt-2"
                  />
                  <input
                    type="text"
                    placeholder="Date of Birth"
                    value={dob}
                    onChange={(e) => handleInputChange(e, 'dob')}
                    className="border p-2 rounded-2xl w-full mt-2"
                  />
                  <select
                    className="border p-2 rounded-2xl w-full mt-2"
                    value={groupNumber}
                    onChange={(e) => handleInputChange(e, 'groupNumber')}
                  >
                    <option value="">Select Group Number</option>
                    <option value="Group 1">Group 1</option>
                    <option value="Group 2">Group 2</option>
                    <option value="Group 3">Group 3</option>
                    <option value="General Category">General Category</option>
                  </select>

                  <select
                    className="border p-2 rounded-2xl w-full mt-2"
                    value={gender}
                    onChange={(e) => handleInputChange(e, 'gender')}
                  >
                    <option value="">Select Gender</option>
                    <option value={'Male'}>Male</option>
                    <option value={'Female'}>Female</option>
                  </select>
                </div>
              ) : (
                <input
                  type="text"
                  placeholder="Student ID"
                  value={studentId}
                  onChange={(e) => handleInputChange(e, 'studentId')}
                  className="border p-2 rounded-2xl w-full mt-2"
                />
              )}
            </div>

            <div className="flex flex-row justify-between mt-2">
              <button
                className="bg-[#ffcece] text-[#350b0b] font-bold px-4 py-1 rounded-xl mr-2 my-2 w-full disabled:opacity-50"
                disabled={isLoading}
                onClick={() => {
                  setIsOpen(false);
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitSubstitution}
                disabled={isLoading}
                className="bg-[#dcceff] text-[#270b35] font-bold px-4 py-1 rounded-xl mr-2 my-2 w-full disabled:opacity-50"
              >
                {isLoading ? 'Submitting ...' : 'Submit'}
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  ) : (
    <div className="flex h-screen items-center justify-center">
      <p className="text-xl font-semibold">Loading...</p>
    </div>
  );
}
