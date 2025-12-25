'use client';

import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import secureLocalStorage from 'react-secure-storage';
import {
  getDistrictData,
  markEntry,
  removeComment,
  submitComment,
  unmarkEntry,
} from '@/app/_util/data';

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [data, setData] = useState(null);
  const [filteredData, setFilteredData] = useState(null);

  // filters.
  const [districts, setDistricts] = useState([
    'Chennai East Coast',
    'Chennai North',
    'Chennai North West',
    'Chennai South',
    'Chennai South East',
    'Chennai West',
    'Coimbatore',
    'Cuddalore',
    'Dharmapuri / Krishnagiri',
    'Dindigul',
    'Erode',
    'Kanchipuram North',
    'Kanchipuram South',
    'Kanyakumari',
    'Karur',
    'Madurai',
    'Mayiladuthurai',
    'Nagapattinam',
    'Nilgiris',
    'Puducherry',
    'Salem',
    'Sivaganga&Ramnad',
    'Thanjavur',
    'Theni',
    'Tirunelveli',
    'Tirupur',
    'Tiruvallur East',
    'Tiruvannamalai',
    'Trichy',
    'Tuticorin',
    'Vellore',
    'Villupuram',
    'Virudhunagar',
  ]);
  const [filterDistrict, setFilterDistrict] = useState('');

  const [events, setEvents] = useState([]);
  const [filterEvent, setFilterEvent] = useState('');

  const [groups, setGroups] = useState([]);
  const [filterGroup, setFilterGroup] = useState('');

  const [searchQuery, setSearchQuery] = useState('');

  // Correction Dialog
  const [isCorrectionDialogOpen, setIsCorrectionDialogOpen] = useState(false);
  const [correctionMessage, setCorrectionMessage] = useState('');
  const [commentStudentId, setCommentStudentId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [markLoading, setMarkLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    const user = {
      name: 'Registration Desk',
      email: 'regdesk@slts.cbe',
    };
    setUser(user);
  }, [router]);

  useEffect(() => {
    if (filterDistrict !== '') {
      getDistrictData(filterDistrict).then((_data) => {
        // Handle Logout.
        if (_data == null || _data.length != 8) {
          router.push('/');
        }

        setData(_data[0]);
        setFilteredData(_data[0]);

        setEvents(_data[2]);
        setGroups(_data[3]);
      });
    }
  }, [filterDistrict, router]);

  useEffect(() => {
    if (data) {
      setFilteredData(
        data.filter((row) => {
          return (
            // (filterDistrict === "" || row.district === filterDistrict) &&
            (filterEvent === '' ||
              row.registeredEvents.includes(filterEvent)) &&
            (filterGroup === '' || row.studentGroup === filterGroup) &&
            (searchQuery === '' ||
              row.studentFullName
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
              row.studentId.toLowerCase().includes(searchQuery.toLowerCase()))
          );
        }),
      );
    }
  }, [data, filterEvent, filterGroup, searchQuery]);

  return user && filterDistrict !== '' && data && filteredData ? (
    <>
      <div
        className={
          'flex flex-col justify-center w-screen md:w-fit ml-auto mr-auto'
        }
      >
        <div className="rounded-2xl p-4 m-4 bg-white border overflow-x-auto justify-between flex flex-col md:flex-row gap-4 md:gap-0">
          <div>
            <h1 className="text-2xl font-bold">Welcome, {user.name}</h1>
            <p className="text-gray-700">{user.email}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border w-auto m-4">
          <div className="flex flex-col grow w-full md:w-auto">
            <label
              htmlFor="district"
              className="mb-2"
            >
              <b>District</b>
            </label>
            <select
              id="district"
              className="border p-2 rounded-2xl"
              value={filterDistrict}
              onChange={(e) => setFilterDistrict(e.target.value)}
            >
              <option value="">Select district</option>
              {districts.map((district, index) => (
                <option
                  key={index}
                  value={district}
                >
                  {district}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-row flex-wrap gap-4 m-4 justify-center overflow-x-auto">
          <div className="bg-white p-4 rounded-2xl border w-full">
            <div className="flex flex-col gap-4">
              <div>
                <input
                  id="search"
                  className="border pt-2 pb-2 pl-4 rounded-2xl w-full"
                  placeholder="Search by name or student ID"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="flex flex-col grow w-full">
                  <label
                    htmlFor="event"
                    className="mb-2"
                  >
                    <b>Event</b>
                  </label>
                  <select
                    id="event"
                    className="border p-2 rounded-2xl"
                    value={filterEvent}
                    onChange={(e) => setFilterEvent(e.target.value)}
                  >
                    <option value="">All</option>
                    {events.map((event, index) => (
                      <option
                        key={index}
                        value={event}
                      >
                        {event}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col grow w-full">
                  <label
                    htmlFor="group"
                    className="mb-2"
                  >
                    <b>Group</b>
                  </label>
                  <select
                    id="group"
                    className="border p-2 rounded-2xl"
                    value={filterGroup}
                    onChange={(e) => setFilterGroup(e.target.value)}
                  >
                    <option value="">All</option>
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
          </div>
        </div>

        {/* Mobile View */}
        <div className="bg-white p-2 rounded-3xl border flex flex-col justify-between m-4 md:hidden gap-4">
          {filteredData.map((row, index) => (
            <div
              key={index}
              className={`${row.overallRegistrationStatus === 'Accepted' ? 'bg-gray-100' : 'bg-red-200'} text-bold flex flex-col gap-2 rounded-2xl`}
            >
              <div className="flex flex-col gap-2 px-4 py-2">
                {row.entryMarked === true && (
                  <p className="text-xs font-bold bg-[#c4ffc2] text-[#07210d] p-1 px-2 rounded-2xl w-full text-center">
                    Entry Marked
                  </p>
                )}
                {row.entryMarked === true ? (
                  <button
                    className="bg-[#ffcece] text-[#350b0b] font-bold px-4 py-1 rounded-xl w-full"
                    disabled={markLoading}
                    onClick={() => {
                      setMarkLoading(true);
                      unmarkEntry(row.studentId)
                        .then((res) => {
                          if (res === true) {
                            data.forEach((r) => {
                              if (r.studentId === row.studentId) {
                                row.entryMarked = false;
                              }
                            });
                            setData(data);
                          } else {
                            alert(
                              'Failed to mark entry. Please try again later.',
                            );
                          }
                        })
                        .catch((err) => {
                          console.log(err);
                          alert(
                            'Failed to mark entry. Please try again later.',
                          );
                        })
                        .finally(() => {
                          setMarkLoading(false);
                        });
                    }}
                  >
                    {markLoading ? 'Unmarking ...' : 'Unmark Entry'}
                  </button>
                ) : (
                  <button
                    className="bg-[#cef0ff] text-[#0b1335] font-bold px-4 py-1 rounded-xl w-full"
                    disabled={markLoading}
                    onClick={() => {
                      setMarkLoading(true);
                      markEntry(row.studentId)
                        .then((res) => {
                          if (res === true) {
                            data.forEach((r) => {
                              if (r.studentId === row.studentId) {
                                row.entryMarked = true;
                              }
                            });
                            setData(data);
                          } else {
                            alert(
                              'Failed to mark entry. Please try again later.',
                            );
                          }
                        })
                        .catch((err) => {
                          console.log(err);
                          alert(
                            'Failed to mark entry. Please try again later.',
                          );
                        })
                        .finally(() => {
                          setMarkLoading(false);
                        });
                    }}
                  >
                    {markLoading ? 'Marking ...' : 'Mark Entry'}
                  </button>
                )}
                <hr className="border-t" />
                {row.entryComment ? (
                  <div className="bg-gray-50 border p-2 rounded-2xl">
                    <p className="text-xs font-bold">Comment</p>
                    <p className="text-xs text-gray-800">{row.entryComment}</p>
                    <button
                      className="bg-[#fffac5] text-[#35330b] font-bold px-4 py-1 rounded-xl w-full mt-2"
                      onClick={() => {
                        setCommentStudentId(row.studentId);
                        setCorrectionMessage(row.entryComment ?? '');
                        setIsCorrectionDialogOpen(true);
                      }}
                    >
                      Edit Comment
                    </button>
                    <button
                      className="bg-[#ffc5c5] text-[#350b0b] font-bold px-4 py-1 rounded-xl w-full mt-2"
                      onClick={() => {
                        setEditLoading(true);
                        removeComment(row.studentId)
                          .then((res) => {
                            if (res === true) {
                              data.forEach((r) => {
                                if (r.studentId === row.studentId) {
                                  row.entryComment = '';
                                }
                              });
                              setData(data);
                            } else {
                              alert(
                                'Failed to remove comment. Please try again later.',
                              );
                            }
                          })
                          .catch((err) => {
                            console.log(err);
                            alert(
                              'Failed to remove comment. Please try again later.',
                            );
                          })
                          .finally(() => {
                            setEditLoading(false);
                          });
                      }}
                    >
                      {editLoading ? 'Removing ...' : 'Remove Comment'}
                    </button>
                  </div>
                ) : (
                  <button
                    className="bg-[#dcceff] text-[#270b35] font-bold px-4 py-1 rounded-xl w-full"
                    onClick={() => {
                      setCommentStudentId(row.studentId);
                      setCorrectionMessage(row.entryComment ?? '');
                      setIsCorrectionDialogOpen(true);
                    }}
                  >
                    Add Comment
                  </button>
                )}
              </div>
              <div className="px-4 pt-2">
                <p className="mt-1 text-xs font-semibold text-gray-600">
                  Student Details
                </p>
                <p className="font-bold">{row.studentFullName ?? '-'}</p>
                <p className="text-xs">
                  {row.gender ?? '-'} - {row.dateOfBirth ?? '-'}
                </p>
                <p className="text-xs">
                  {row.district ?? '-'}, {row.samithiName ?? '-'}
                </p>
                <p className="text-xs mt-2">
                  DOJ BV: {row.dateOfJoiningBalvikas ?? '-'}{' '}
                  {row.yearOfJoiningBalvikas ?? '-'}
                </p>
                {row.studentGroup === 'Group 3' && (
                  <p className="text-xs">
                    Passed group 2: {row.hasPassedGroup2Exam ?? '-'}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-1 px-3">
                <p className="text-xs font-bold bg-[#c4ffc2] text-[#07210d] p-1 px-2 rounded-2xl w-fit">
                  {row.studentId ?? '-'}
                </p>
                <p className="text-xs font-bold bg-[#bad1ff] text-[#090e2d] p-1 px-2 rounded-2xl w-fit">
                  {row.studentGroup ?? '-'}
                </p>
                {row.registeredEvents.map((event, index) => (
                  <p
                    key={index}
                    className="text-xs bg-green-200 text-green-800 font-bold rounded-xl p-1 px-2 w-fit"
                  >
                    {event ?? '-'}
                  </p>
                ))}
              </div>
              <hr className="border-t mx-4 mt-3" />
              <div className="mt-2">
                <p className="text-xs font-semibold text-gray-600 px-4">
                  Arrival & Departure Logistics
                </p>
                <div className="flex flex-col gap-1 px-3">
                  <div className="border bg-gray-200 rounded-2xl p-2 w-full mt-1">
                    <p className="text-xs font-semibold">{'Arrival'}</p>
                    <p className="text-xs font-bold">
                      {row.arrivalDate ?? '-'} - {row.arrivalTime ?? '-'}
                    </p>
                    <p className="text-xs">
                      {row.needsPickup === 'Yes'
                        ? 'Needs pickup.'
                        : 'Pickup not needed.'}
                    </p>
                    {row.needsPickup === 'Yes' && (
                      <div className="bg-blue-100 p-2 rounded-xl mt-2 border border-blue-300">
                        <p className="text-xs text-blue-950 font-semibold">
                          Mode: {row.modeOfTravel ?? '-'}
                        </p>
                        <p className="text-xs text-blue-950 font-semibold">
                          Pickup Point: {row.pickupPoint ?? '-'}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="border bg-gray-200 rounded-2xl p-2 w-full">
                    <p className="text-xs font-semibold">{'Departure'}</p>
                    <p className="text-xs font-bold">
                      {row.departureDate ?? '-'} - {row.departureTime ?? '-'}
                    </p>
                    <p className="text-xs">
                      {row.needsDrop === 'Yes'
                        ? 'Needs drop.'
                        : 'Drop not needed.'}
                    </p>
                    {row.needsDrop === 'Yes' && (
                      <div className="bg-blue-100 p-2 rounded-xl mt-2 border border-blue-300">
                        <p className="text-xs text-blue-950 font-semibold">
                          Mode: {row.modeOfTravelForDrop ?? '-'}
                        </p>
                        <p className="text-xs text-blue-950 font-semibold">
                          Drop Point: {row.dropOffPoint ?? '-'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <hr className="border-t mx-4 my-" />
              <div className="py-2">
                <p className="px-4 text-xs font-semibold text-gray-600">
                  Accompany Details
                </p>
                <p className="px-4 text-xs">
                  {row.hasAccompanyingAdults === 'Yes'
                    ? 'Has Accompanying adults.'
                    : 'No Accompany.'}
                </p>
                <div className="mt-2 mx-3 bg-gray-50 p-2 rounded-2xl">
                  <p className="text-xs font-bold">
                    {row.accompanyingPersonName ?? '-'}
                  </p>
                  <p className="text-xs">
                    {row.accompanyingPersonGender ?? '-'} -{' '}
                    {row.accompanyingPersonAge ?? '-'} yrs
                  </p>
                  <p className="text-xs">
                    {row.accompanyingPersonRelation ?? '-'}
                  </p>
                  <p className="text-xs">
                    {row.accompanyingPersonContact ?? '-'}
                  </p>
                  <div className="flex gap-1 mt-2">
                    <p className="text-xs bg-blue-200 text-blue-800 font-bold rounded-xl p-1 px-2 w-fit">
                      {row.numMaleAccompanying ?? '0'} male
                    </p>
                    <p className="text-xs bg-blue-200 text-blue-800 font-bold rounded-xl p-1 px-2 w-fit">
                      {row.numFemaleAccompanying ?? '0'} female
                    </p>
                    <p className="text-xs bg-blue-200 text-blue-800 font-bold rounded-xl p-1 px-2 w-fit">
                      {row.numNonParticipatingSiblings ?? '0'} children
                    </p>
                  </div>
                </div>
              </div>
              <hr className="border-t mx-4" />
              <div className="pt-2">
                <p className="px-4 text-xs font-semibold text-gray-600">
                  Accommodation Details
                </p>
                <div className="mt-2 mx-3 bg-gray-50 p-2 rounded-2xl">
                  <p className="text-xs font-bold">Check-In</p>
                  <p className="text-xs">
                    {row.checkInDate ?? '-'} - {row.checkInTime ?? '-'}
                  </p>
                  <p className="text-xs font-bold">Check-Out</p>
                  <p className="text-xs">
                    {row.checkOutDate ?? '-'} - {row.checkOutTime ?? '-'}
                  </p>

                  <p className="text-xs mt-2 font-semibold">
                    For student: {row.needsAccommodation ?? '-'}
                  </p>
                  <p className="text-xs">
                    Allergies: {row.foodAllergies ?? '-'}
                  </p>
                  <div className="flex gap-1 flex-wrap mt-2">
                    <p className="text-xs bg-blue-200 text-blue-800 font-bold rounded-xl p-1 px-2 w-fit">
                      {row.numMaleAccompanyingNeedAccommodation ?? '0'} male
                    </p>
                    <p className="text-xs bg-blue-200 text-blue-800 font-bold rounded-xl p-1 px-2 w-fit">
                      {row.numFemaleAccompanyingNeedAccommodation ?? '0'} female
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tab and Desktop View */}
        <div className="overflow-x-auto m-4 hidden md:block">
          <table className="table-auto w-full mt-6 border-collapse">
            <thead>
              <tr className="bg-black text-white">
                <th className="px-4 py-2 border">Actions</th>
                <th className="px-4 py-2 border">Student Details</th>
                <th className="px-4 py-2 border">BalVikas Details</th>
                <th className="px-4 py-2 border">
                  Arrival & Departure Logistics
                </th>
                <th className="px-4 py-2 border">Accompany Details</th>
                <th className="px-4 py-2 border">Accommodation Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row, index) => (
                <tr
                  key={index}
                  className={`${row.overallRegistrationStatus === 'Accepted' ? 'bg-white' : 'bg-red-200'} hover:bg-blue-50 text-bold transition duration-200`}
                >
                  <td className="px-4 py-2 border max-w-60">
                    <div className="flex flex-col gap-2">
                      {row.entryMarked === true && (
                        <p className="text-xs font-bold bg-[#c4ffc2] text-[#07210d] p-1 px-2 rounded-2xl w-full text-center">
                          Entry Marked
                        </p>
                      )}
                      {row.entryMarked === true ? (
                        <button
                          className="bg-[#ffcece] text-[#350b0b] font-bold px-4 py-1 rounded-xl w-full"
                          disabled={markLoading}
                          onClick={() => {
                            setMarkLoading(true);
                            unmarkEntry(row.studentId)
                              .then((res) => {
                                if (res === true) {
                                  data.forEach((r) => {
                                    if (r.studentId === row.studentId) {
                                      row.entryMarked = false;
                                    }
                                  });
                                  setData(data);
                                } else {
                                  alert(
                                    'Failed to mark entry. Please try again later.',
                                  );
                                }
                              })
                              .catch((err) => {
                                console.log(err);
                                alert(
                                  'Failed to mark entry. Please try again later.',
                                );
                              })
                              .finally(() => {
                                setMarkLoading(false);
                              });
                          }}
                        >
                          {markLoading ? 'Unmarking ...' : 'Unmark Entry'}
                        </button>
                      ) : (
                        <button
                          className="bg-[#cef0ff] text-[#0b1335] font-bold px-4 py-1 rounded-xl w-full"
                          disabled={markLoading}
                          onClick={() => {
                            setMarkLoading(true);
                            markEntry(row.studentId)
                              .then((res) => {
                                if (res === true) {
                                  data.forEach((r) => {
                                    if (r.studentId === row.studentId) {
                                      row.entryMarked = true;
                                    }
                                  });
                                  setData(data);
                                } else {
                                  alert(
                                    'Failed to mark entry. Please try again later.',
                                  );
                                }
                              })
                              .catch((err) => {
                                console.log(err);
                                alert(
                                  'Failed to mark entry. Please try again later.',
                                );
                              })
                              .finally(() => {
                                setMarkLoading(false);
                              });
                          }}
                        >
                          {markLoading ? 'Marking ...' : 'Mark Entry'}
                        </button>
                      )}
                      <hr className="border-t" />
                      {row.entryComment ? (
                        <div className="bg-gray-50 border p-2 rounded-2xl">
                          <p className="text-xs font-bold">Comment</p>
                          <p className="text-xs text-gray-800">
                            {row.entryComment}
                          </p>
                          <button
                            className="bg-[#fffac5] text-[#35330b] font-bold px-4 py-1 rounded-xl w-full mt-2"
                            onClick={() => {
                              setCommentStudentId(row.studentId);
                              setCorrectionMessage(row.entryComment ?? '');
                              setIsCorrectionDialogOpen(true);
                            }}
                          >
                            Edit Comment
                          </button>
                          <button
                            className="bg-[#ffc5c5] text-[#350b0b] font-bold px-4 py-1 rounded-xl w-full mt-2"
                            onClick={() => {
                              setEditLoading(true);
                              removeComment(row.studentId)
                                .then((res) => {
                                  if (res === true) {
                                    data.forEach((r) => {
                                      if (r.studentId === row.studentId) {
                                        row.entryComment = '';
                                      }
                                    });
                                    setData(data);
                                  } else {
                                    alert(
                                      'Failed to remove comment. Please try again later.',
                                    );
                                  }
                                })
                                .catch((err) => {
                                  console.log(err);
                                  alert(
                                    'Failed to remove comment. Please try again later.',
                                  );
                                })
                                .finally(() => {
                                  setEditLoading(false);
                                });
                            }}
                          >
                            {editLoading ? 'Removing ...' : 'Remove Comment'}
                          </button>
                        </div>
                      ) : (
                        <button
                          className="bg-[#dcceff] text-[#270b35] font-bold px-4 py-1 rounded-xl w-full"
                          onClick={() => {
                            setCommentStudentId(row.studentId);
                            setCorrectionMessage(row.entryComment ?? '');
                            setIsCorrectionDialogOpen(true);
                          }}
                        >
                          Add Comment
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2 border max-w-40">
                    <p className="font-bold">{row.studentFullName ?? '-'}</p>
                    <p className="text-xs">
                      {row.gender ?? '-'} - {row.dateOfBirth ?? '-'}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-3 mb-2">
                      <p className="text-xs font-bold bg-[#c4ffc2] text-[#07210d] p-1 px-2 rounded-2xl w-fit">
                        {row.studentId ?? '-'}
                      </p>
                      <p className="text-xs font-bold bg-[#bad1ff] text-[#090e2d] p-1 px-2 rounded-2xl w-fit">
                        {row.studentGroup ?? '-'}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-2 border max-w-50">
                    <p className="font-bold">{row.district ?? '-'}</p>
                    <p className="text-xs">{row.samithiName ?? '-'}</p>
                    <p className="text-xs">
                      DOJ BV: {row.dateOfJoiningBalvikas ?? '-'}{' '}
                      {row.yearOfJoiningBalvikas ?? '-'}
                    </p>
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
                  <td className="border max-w-50">
                    <div className="flex flex-col justify-around items-center gap-4 mt-2 mb-2">
                      <div className="border rounded-2xl p-2 w-60">
                        <p className="text-xs font-semibold">{'Arrival'}</p>
                        <p className="text-xs font-bold">
                          {row.arrivalDate ?? '-'} - {row.arrivalTime ?? '-'}
                        </p>
                        <p className="text-xs">
                          {row.needsPickup === 'Yes'
                            ? 'Needs pickup.'
                            : 'Pickup not needed.'}
                        </p>
                        {row.needsPickup === 'Yes' && (
                          <div className="bg-purple-100 p-2 rounded-xl mt-2">
                            <p className="text-xs">
                              Mode: {row.modeOfTravel ?? '-'}
                            </p>
                            <p className="text-xs">
                              Pickup Point: {row.pickupPoint ?? '-'}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="border rounded-2xl p-2 w-60">
                        <p className="text-xs font-semibold">{'Departure'}</p>
                        <p className="text-xs font-bold">
                          {row.departureDate ?? '-'} -{' '}
                          {row.departureTime ?? '-'}
                        </p>
                        <p className="text-xs">
                          {row.needsDrop === 'Yes'
                            ? 'Needs drop.'
                            : 'Drop not needed.'}
                        </p>
                        {row.needsDrop === 'Yes' && (
                          <div className="bg-purple-100 p-2 rounded-xl mt-2">
                            <p className="text-xs">
                              Mode: {row.modeOfTravelForDrop ?? '-'}
                            </p>
                            <p className="text-xs">
                              Drop Point: {row.dropOffPoint ?? '-'}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2 border">
                    <p className="text-xs">
                      {row.hasAccompanyingAdults === 'Yes'
                        ? 'Has Accompanying adults.'
                        : 'No Accompany.'}
                    </p>
                    <div className="mt-2 bg-purple-100 p-2 rounded-2xl">
                      <p className="text-xs font-bold">
                        {row.accompanyingPersonName ?? '-'}
                      </p>
                      <p className="text-xs">
                        {row.accompanyingPersonGender ?? '-'} -{' '}
                        {row.accompanyingPersonAge ?? '-'} yrs
                      </p>
                      <p className="text-xs">
                        {row.accompanyingPersonRelation ?? '-'}
                      </p>
                      <p className="text-xs">
                        {row.accompanyingPersonContact ?? '-'}
                      </p>
                      <div className="flex gap-1 mt-2">
                        <p className="text-xs bg-blue-200 text-blue-800 font-bold rounded-xl p-1 px-2 w-fit">
                          {row.numMaleAccompanying ?? '0'} male
                        </p>
                        <p className="text-xs bg-blue-200 text-blue-800 font-bold rounded-xl p-1 px-2 w-fit">
                          {row.numFemaleAccompanying ?? '0'} female
                        </p>
                        <p className="text-xs bg-blue-200 text-blue-800 font-bold rounded-xl p-1 px-2 w-fit">
                          {row.numNonParticipatingSiblings ?? '0'} children
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2 border">
                    <div className="mt-2 bg-purple-100 p-2 rounded-2xl">
                      <p className="text-xs font-bold">Check-In</p>
                      <p className="text-xs">
                        {row.checkInDate ?? '-'} - {row.checkInTime ?? '-'}
                      </p>
                      <p className="text-xs font-bold">Check-Out</p>
                      <p className="text-xs">
                        {row.checkOutDate ?? '-'} - {row.checkOutTime ?? '-'}
                      </p>

                      <p className="text-xs mt-2 font-semibold">
                        For student: {row.needsAccommodation ?? '-'}
                      </p>
                      <p className="text-xs">
                        Allergies: {row.foodAllergies ?? '-'}
                      </p>
                      <div className="flex gap-1 flex-wrap mt-2">
                        <p className="text-xs bg-blue-200 text-blue-800 font-bold rounded-xl p-1 px-2 w-fit">
                          {row.numMaleAccompanyingNeedAccommodation ?? '0'} male
                        </p>
                        <p className="text-xs bg-blue-200 text-blue-800 font-bold rounded-xl p-1 px-2 w-fit">
                          {row.numFemaleAccompanyingNeedAccommodation ?? '0'}{' '}
                          female
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog
        open={isCorrectionDialogOpen}
        onClose={() => setIsCorrectionDialogOpen(false)}
        className="fixed z-50 shadow-2xl"
      >
        <div className="fixed inset-0 flex w-screen items-center justify-center p-2 overflow-y-auto backdrop-blur-sm">
          <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-3 text-left align-middle shadow-xl transition-all border">
            <div className="flex flex-row justify-between my-2">
              <DialogTitle className="text-sm font-medium text-gray-900 w-[70%]">
                Comments during Registration
              </DialogTitle>
              <button
                onClick={() => setIsCorrectionDialogOpen(false)}
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

            <div className="flex flex-col gap-4">
              <div
                className={`bg-gray-100 text-bold flex flex-col gap-2 rounded-2xl`}
              >
                <div className="mt-2 px-3">
                  <textarea
                    className="border p-2 rounded-2xl w-full"
                    placeholder="Enter comments details here..."
                    value={correctionMessage}
                    onChange={(e) => setCorrectionMessage(e.target.value)}
                  ></textarea>

                  <div className="flex flex-row justify-between mt-2">
                    <button
                      className="bg-[#ffcece] text-[#350b0b] font-bold px-4 py-1 rounded-xl mr-2 my-2 w-full disabled:opacity-50"
                      disabled={isLoading}
                      onClick={() => {
                        setIsCorrectionDialogOpen(false);
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      className="bg-[#dcceff] text-[#270b35] font-bold px-4 py-1 rounded-xl mr-2 my-2 w-full disabled:opacity-50"
                      disabled={
                        isLoading ||
                        correctionMessage.toString().trim().length === 0
                      }
                      onClick={() => {
                        setIsLoading(true);
                        submitComment(commentStudentId, correctionMessage)
                          .then((res) => {
                            setIsLoading(false);
                            if (res === true) {
                              data.forEach((row) => {
                                if (row.studentId === commentStudentId) {
                                  row.entryComment = correctionMessage;
                                }
                              });
                              setData(data);

                              setCorrectionMessage('');
                              setIsCorrectionDialogOpen(false);
                            } else {
                              alert(
                                'Failed to submit comment. Please try again later.',
                              );
                            }
                          })
                          .catch((err) => {
                            console.log(err);
                            alert(
                              'Failed to submit comment. Please try again later.',
                            );
                          })
                          .finally(() => {
                            setIsLoading(false);
                          });
                      }}
                    >
                      {isLoading ? 'Submitting ... ' : 'Submit Comment'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  ) : user && filterDistrict === '' ? (
    <div
      className={
        'flex flex-col justify-center w-screen md:w-fit ml-auto mr-auto' +
        (isCorrectionDialogOpen ? ' blur md:blur-none md:grayscale' : '')
      }
    >
      <div className="rounded-2xl p-4 m-4 bg-white border overflow-x-auto justify-between flex flex-col md:flex-row gap-4 md:gap-0">
        <div>
          <h1 className="text-2xl font-bold">Welcome, {user.name}</h1>
          <p className="text-gray-700">{user.email}</p>
        </div>
      </div>
      <div className="bg-white p-4 rounded-2xl border w-auto m-4">
        <div className="flex flex-col grow w-full md:w-auto">
          <label
            htmlFor="district"
            className="mb-2"
          >
            <b>District</b>
          </label>
          <select
            id="district"
            className="border p-2 rounded-2xl"
            value={filterDistrict}
            onChange={(e) => setFilterDistrict(e.target.value)}
          >
            <option value="">Select district</option>
            {districts.map((district, index) => (
              <option
                key={index}
                value={district}
              >
                {district}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  ) : (
    <div className="flex h-screen items-center justify-center">
      <p className="text-2xl font-semibold">Loading...</p>
    </div>
  );
}
