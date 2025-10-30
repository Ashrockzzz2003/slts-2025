'use client';

import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { useRouter } from 'next/navigation';
import { useEffect, useId, useState } from 'react';
import secureLocalStorage from 'react-secure-storage';
import { getRegistrationData, submitCorrectionRequest } from '@/app/_util/data';
import { auth } from '@/app/_util/initApp';

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [data, setData] = useState(null);
  const [filteredData, setFilteredData] = useState(null);

  // filters.
  const [districts, setDistricts] = useState([]);
  const [filterDistrict, setFilterDistrict] = useState('');

  const [events, setEvents] = useState([]);
  const [filterEvent, setFilterEvent] = useState('');

  const [groups, setGroups] = useState([]);
  const [filterGroup, setFilterGroup] = useState('');

  const [modeOfTravelOptions, setModeOfTravelOptions] = useState([]);
  const [filterModeOfTravel, setFilterModeOfTravel] = useState('');

  const [modeOfTravelForDropOptions, setModeOfTravelForDropOptions] = useState(
    [],
  );
  const [filterModeOfTravelForDrop, setFilterModeOfTravelForDrop] =
    useState('');

  const [checkInDateOptions, setCheckInDateOptions] = useState([]);
  const [filterCheckInDate, setFilterCheckInDate] = useState('');

  const [checkOutDateOptions, setCheckOutDateOptions] = useState([]);
  const [filterCheckOutDate, setFilterCheckOutDate] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [filterNeedForPickup, setFilterNeedForPickup] = useState('');
  const [filterNeedForDrop, setFilterNeedForDrop] = useState('');
  const [filterNeedForAccommodation, setFilterNeedForAccommodation] =
    useState('');

  const [correctionData, setCorrectionData] = useState(null);
  const [correctionMessage, setCorrectionMessage] = useState('');
  const [correctionName, setCorrectionName] = useState('');
  const [correctionPhone, setCorrectionPhone] = useState('');

  const [isCorrectionDialogOpen, setIsCorrectionDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogType, setDialogType] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  // IDs for some components
  const searchInputId = useId();

  const districtSelectId = useId();
  const eventSelectId = useId();
  const groupSelectId = useId();
  const needForPickupSelectId = useId();
  const modeOfTravelSelectId = useId();
  const needForDropSelectId = useId();
  const modeOfTravelForDropSelectId = useId();
  const needForAccommodationSelectId = useId();
  const checkInDateSelectId = useId();
  const checkOutDateSelectId = useId();

  useEffect(() => {
    if (!secureLocalStorage.getItem('user')) {
      router.push('/');
    }

    const user = JSON.parse(secureLocalStorage.getItem('user'));
    setUser(user);
    getRegistrationData().then((_data) => {
      // Handle Logout.
      if (_data == null || _data.length !== 8) {
        router.push('/');
      }

      setData(_data[0]);
      setFilteredData(_data[0]);

      setDistricts(_data[1]);
      setEvents(_data[2]);
      setGroups(_data[3]);
      setModeOfTravelOptions(_data[4]);
      setModeOfTravelForDropOptions(_data[5]);
      setCheckInDateOptions(_data[6]);
      setCheckOutDateOptions(_data[7]);
    });
  }, [router]);

  useEffect(() => {
    if (data) {
      setFilteredData(
        data.filter((row) => {
          return (
            (filterDistrict === '' || row.district === filterDistrict) &&
            (filterEvent === '' ||
              row.registeredEvents.includes(filterEvent)) &&
            (filterGroup === '' || row.studentGroup === filterGroup) &&
            (filterModeOfTravel === '' ||
              row.modeOfTravel === filterModeOfTravel) &&
            (filterModeOfTravelForDrop === '' ||
              row.modeOfTravelForDrop === filterModeOfTravelForDrop) &&
            (filterNeedForPickup === '' ||
              row.needsPickup.toString() === filterNeedForPickup) &&
            (filterNeedForDrop === '' ||
              row.needsDrop.toString() === filterNeedForDrop) &&
            (filterNeedForAccommodation === '' ||
              row.needsAccommodation.toString() ===
                filterNeedForAccommodation) &&
            (filterCheckInDate === '' ||
              row.checkInDate === filterCheckInDate) &&
            (filterCheckOutDate === '' ||
              row.checkOutDate === filterCheckOutDate) &&
            (searchQuery === '' ||
              row.studentFullName
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
              row.studentId.toLowerCase().includes(searchQuery.toLowerCase()))
          );
        }),
      );
    }
  }, [
    data,
    filterDistrict,
    filterEvent,
    filterGroup,
    filterNeedForPickup,
    filterNeedForDrop,
    filterNeedForAccommodation,
    searchQuery,
    filterModeOfTravel,
    filterModeOfTravelForDrop,
    filterCheckInDate,
    filterCheckOutDate,
  ]);

  return user && filteredData ? (
    <>
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
          <div className="flex flex-row">
            <button
              type="button"
              className="bg-[#fffece] text-[#2c350b] font-bold px-4 py-1 rounded-xl mr-2"
              onClick={() => router.push('/admin/event')}
            >
              Events
            </button>
            {/* <button
                            className="bg-[#fffece] text-[#2c350b] font-bold px-4 py-1 rounded-xl mr-2"
                            onClick={() => router.push('/admin/accommodation')}
                        >
                            Accommodation
                        </button> */}
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

        <div className="flex flex-row flex-wrap gap-4 m-4 justify-center overflow-x-auto">
          <div className="bg-white p-4 rounded-2xl border w-full">
            <div className="flex flex-col gap-4">
              <div>
                <input
                  id={searchInputId}
                  className="border pt-2 pb-2 pl-4 rounded-2xl w-full"
                  placeholder="Search by name or student ID"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="flex flex-col grow w-full md:w-auto">
                  <label
                    htmlFor={districtSelectId}
                    className="mb-2"
                  >
                    <b>District</b>
                  </label>
                  <select
                    id={districtSelectId}
                    className="border p-2 rounded-2xl"
                    value={filterDistrict}
                    onChange={(e) => setFilterDistrict(e.target.value)}
                  >
                    <option value="">All</option>
                    {districts.map((district, _) => (
                      <option
                        key={district}
                        value={district}
                      >
                        {district}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col grow w-full">
                  <label
                    htmlFor={eventSelectId}
                    className="mb-2"
                  >
                    <b>Event</b>
                  </label>
                  <select
                    id={eventSelectId}
                    className="border p-2 rounded-2xl"
                    value={filterEvent}
                    onChange={(e) => setFilterEvent(e.target.value)}
                  >
                    <option value="">All</option>
                    {events.map((event, _) => (
                      <option
                        key={event}
                        value={event}
                      >
                        {event}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col grow w-full">
                  <label
                    htmlFor={groupSelectId}
                    className="mb-2"
                  >
                    <b>Group</b>
                  </label>
                  <select
                    id={groupSelectId}
                    className="border p-2 rounded-2xl"
                    value={filterGroup}
                    onChange={(e) => setFilterGroup(e.target.value)}
                  >
                    <option value="">All</option>
                    {groups.map((group, _) => (
                      <option
                        key={group}
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

        <div className="flex flex-col md:flex-row m-4 gap-4 items-center">
          <div className="bg-white p-4 rounded-2xl border grow w-full md:w-auto">
            <div className="flex flex-row flex-wrap justify-between gap-2">
              <div className="flex flex-col gap-2 w-full md:w-auto">
                <label htmlFor={needForPickupSelectId}>
                  <b>Needs Pickup</b>
                </label>
                <select
                  id={needForPickupSelectId}
                  className="border p-2 rounded-2xl"
                  value={filterNeedForPickup}
                  onChange={(e) => setFilterNeedForPickup(e.target.value)}
                >
                  <option value="">All</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              <div className="flex flex-col gap-2 w-full md:w-auto">
                <label htmlFor={modeOfTravelSelectId}>
                  <b>Mode Of Travel</b>
                </label>
                <select
                  id={modeOfTravelSelectId}
                  className="border p-2 rounded-2xl"
                  value={filterModeOfTravel}
                  onChange={(e) => setFilterModeOfTravel(e.target.value)}
                >
                  <option value="">All</option>
                  {modeOfTravelOptions.map((mode, _) => (
                    <option
                      key={mode}
                      value={mode}
                    >
                      {mode}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border grow w-full md:w-auto">
            <div className="flex flex-row flex-wrap justify-between gap-2">
              <div className="flex flex-col gap-2 w-full md:w-auto">
                <label htmlFor={needForDropSelectId}>
                  <b>Needs Drop</b>
                </label>
                <select
                  id={needForDropSelectId}
                  className="border p-2 rounded-2xl"
                  value={filterNeedForDrop}
                  onChange={(e) => setFilterNeedForDrop(e.target.value)}
                >
                  <option value="">All</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              <div className="flex flex-col justify-between gap-2 w-full md:w-auto">
                <label htmlFor={modeOfTravelForDropSelectId}>
                  <b>Mode Of Travel</b>
                </label>
                <select
                  id={modeOfTravelForDropSelectId}
                  className="border p-2 rounded-2xl"
                  value={filterModeOfTravelForDrop}
                  onChange={(e) => setFilterModeOfTravelForDrop(e.target.value)}
                >
                  <option value="">All</option>
                  {modeOfTravelForDropOptions.map((mode, _) => (
                    <option
                      key={mode}
                      value={mode}
                    >
                      {mode}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border grow w-full md:w-auto">
            <div className="flex flex-col md:flex-row flex-wrap justify-between gap-2">
              <div className="flex flex-col gap-2 w-full md:w-auto">
                <label htmlFor={needForAccommodationSelectId}>
                  <b>Needs Accommodation</b>
                </label>
                <select
                  id={needForAccommodationSelectId}
                  className="border p-2 rounded-2xl"
                  value={filterNeedForAccommodation}
                  onChange={(e) =>
                    setFilterNeedForAccommodation(e.target.value)
                  }
                >
                  <option value="">All</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
              <div className="flex flex-col gap-2 w-full md:w-auto">
                <label htmlFor="pickupPoint">
                  <b>Check In Date</b>
                </label>
                <select
                  id={checkInDateSelectId}
                  className="border p-2 rounded-2xl"
                  value={filterCheckInDate}
                  onChange={(e) => setFilterCheckInDate(e.target.value)}
                >
                  <option value="">All</option>
                  {checkInDateOptions.map((date, _) => (
                    <option
                      key={date}
                      value={date}
                    >
                      {date}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-2 w-full md:w-auto">
                <label htmlFor="dropOffPoint">
                  <b>Check Out Date</b>
                </label>
                <select
                  id={checkOutDateSelectId}
                  className="border p-2 rounded-2xl"
                  value={filterCheckOutDate}
                  onChange={(e) => setFilterCheckOutDate(e.target.value)}
                >
                  <option value="">All</option>
                  {checkOutDateOptions.map((date, _) => (
                    <option
                      key={date}
                      value={date}
                    >
                      {date}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row flex-wrap gap-4 m-4 justify-center overflow-x-auto">
          <div className="bg-white p-4 rounded-2xl border flex flex-col justify-between">
            <div>
              <p className="text-lg font-bold">Total Registrations</p>
              <p className="text-sm font-semibold text-gray-500">
                Participants
              </p>
            </div>
            <div className="flex justify-around gap-3">
              <div className="pt-2">
                <p className="text-sm font-bold">Male</p>
                <p className="text-4xl font-bold">
                  {filteredData.reduce(
                    (acc, row) =>
                      acc + parseInt((row.gender === 'Male' ? 1 : 0) ?? 0, 10),
                    0,
                  )}
                </p>
              </div>
              <div className="pt-2">
                <p className="text-sm font-bold">Female</p>
                <p className="text-4xl font-bold">
                  {filteredData.reduce(
                    (acc, row) =>
                      acc +
                      parseInt((row.gender === 'Female' ? 1 : 0) ?? 0, 10),
                    0,
                  )}
                </p>
              </div>
              <div className="pt-2 bg-gray-100 p-2 px-8 rounded-2xl">
                <p className="text-sm font-bold">Total</p>
                <p className="text-4xl font-bold">
                  {filteredData.reduce(
                    (acc, row) =>
                      acc + parseInt((row.gender === 'Male' ? 1 : 0) ?? 0, 10),
                    0,
                  ) +
                    filteredData.reduce(
                      (acc, row) =>
                        acc +
                        parseInt((row.gender === 'Female' ? 1 : 0) ?? 0, 10),
                      0,
                    )}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border flex flex-col justify-between">
            <div>
              <p className="text-lg font-bold">Total Accompanying Adults</p>
              <p className="text-sm font-semibold text-gray-500">
                Non-Participants
              </p>
            </div>
            <div className="flex justify-around gap-3">
              <div className="pt-2">
                <p className="text-sm font-bold">Male</p>
                <p className="text-4xl font-bold">
                  {filteredData.reduce(
                    (acc, row) =>
                      acc + parseInt(row.numMaleAccompanying ?? 0, 10),
                    0,
                  )}
                </p>
              </div>
              <div className="pt-2">
                <p className="text-sm font-bold">Female</p>
                <p className="text-4xl font-bold">
                  {filteredData.reduce(
                    (acc, row) =>
                      acc + parseInt(row.numFemaleAccompanying ?? 0, 10),
                    0,
                  )}
                </p>
              </div>
              <div className="pt-2">
                <p className="text-sm font-bold">Children</p>
                <p className="text-4xl font-bold">
                  {filteredData.reduce(
                    (acc, row) =>
                      acc + parseInt(row.numNonParticipatingSiblings ?? 0, 10),
                    0,
                  )}
                </p>
              </div>
              <div className="pt-2 bg-gray-100 p-2 px-8 rounded-2xl">
                <p className="text-sm font-bold">Total</p>
                <p className="text-4xl font-bold">
                  {filteredData.reduce(
                    (acc, row) =>
                      acc + parseInt(row.numMaleAccompanying ?? 0, 10),
                    0,
                  ) +
                    filteredData.reduce(
                      (acc, row) =>
                        acc + parseInt(row.numFemaleAccompanying ?? 0, 10),
                      0,
                    ) +
                    filteredData.reduce(
                      (acc, row) =>
                        acc +
                        parseInt(row.numNonParticipatingSiblings ?? 0, 10),
                      0,
                    )}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border flex flex-col justify-between">
            <p className="text-lg font-bold">Accommodation Logistics</p>
            <div className="flex flex-row flex-nowrap">
              <div className="pr-2">
                <div>
                  <p className="text-sm font-semibold text-gray-500">
                    Non-Participants
                  </p>
                </div>
                <div className="flex justify-around gap-3">
                  <div className="pt-2">
                    <p className="text-sm font-bold">Male</p>
                    <p className="text-4xl font-bold">
                      {filteredData.reduce(
                        (acc, row) =>
                          acc +
                          parseInt(
                            row.numMaleAccompanyingNeedAccommodation ?? 0,
                            10,
                          ),
                        0,
                      )}
                    </p>
                  </div>
                  <div className="pt-2">
                    <p className="text-sm font-bold">Female</p>
                    <p className="text-4xl font-bold">
                      {filteredData.reduce(
                        (acc, row) =>
                          acc +
                          parseInt(
                            row.numFemaleAccompanyingNeedAccommodation ?? 0,
                            10,
                          ),
                        0,
                      )}
                    </p>
                  </div>
                  {/* <div className="pt-2 bg-gray-100 p-2 px-8 rounded-2xl">
                                        <p className="text-sm font-bold">Total</p>
                                        <p className="text-4xl font-bold">
                                            {filteredData.reduce((acc, row) => acc + parseInt(row.numMaleAccompanyingNeedAccommodation ?? 0), 0) +
                                                filteredData.reduce((acc, row) => acc + parseInt(row.numFemaleAccompanyingNeedAccommodation ?? 0), 0)}
                                        </p>
                                    </div> */}
                </div>
              </div>
              <div className="border-l px-2">
                <div>
                  <p className="text-sm font-semibold text-gray-500">
                    Participants
                  </p>
                </div>
                <div className="flex justify-around gap-3">
                  <div className="pt-2">
                    <p className="text-sm font-bold">Male</p>
                    <p className="text-4xl font-bold">
                      {filteredData.reduce(
                        (acc, row) =>
                          acc +
                          parseInt(
                            (row.needsAccommodation === 'Yes' &&
                            row.gender === 'Male'
                              ? 1
                              : 0) ?? 0,
                            10,
                          ),
                        0,
                      )}
                    </p>
                  </div>
                  <div className="pt-2">
                    <p className="text-sm font-bold">Female</p>
                    <p className="text-4xl font-bold">
                      {filteredData.reduce(
                        (acc, row) =>
                          acc +
                          parseInt(
                            (row.needsAccommodation === 'Yes' &&
                            row.gender === 'Female'
                              ? 1
                              : 0) ?? 0,
                            10,
                          ),
                        0,
                      )}
                    </p>
                  </div>
                  {/* <div className="pt-2 bg-gray-100 p-2 px-8 rounded-2xl">
                                        <p className="text-sm font-bold">Total</p>
                                        <p className="text-4xl font-bold">
                                            {filteredData.reduce((acc, row) => acc + parseInt((row.needsAccommodation == "Yes" && row.gender == "Male" ? 1 : 0) ?? 0), 0) +
                                                filteredData.reduce((acc, row) => acc + parseInt((row.needsAccommodation == "Yes" && row.gender == "Female" ? 1 : 0) ?? 0), 0)}
                                        </p>
                                    </div> */}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border flex flex-col justify-between">
            <p className="text-lg font-bold">Accommodation</p>
            <div>
              <div>
                <p className="text-sm font-semibold text-gray-500">Overall</p>
              </div>
              <div className="flex justify-around gap-3">
                <div className="pt-2">
                  <p className="text-sm font-bold">Male</p>
                  <p className="text-4xl font-bold">
                    {filteredData.reduce(
                      (acc, row) =>
                        acc +
                        parseInt(
                          (row.needsAccommodation === 'Yes' &&
                          row.gender === 'Male'
                            ? 1
                            : 0) ?? 0,
                          10,
                        ),
                      0,
                    ) +
                      filteredData.reduce(
                        (acc, row) =>
                          acc +
                          parseInt(
                            row.numMaleAccompanyingNeedAccommodation ?? 0,
                            10,
                          ),
                        0,
                      )}
                  </p>
                </div>
                <div className="pt-2">
                  <p className="text-sm font-bold">Female</p>
                  <p className="text-4xl font-bold">
                    {filteredData.reduce(
                      (acc, row) =>
                        acc +
                        parseInt(
                          (row.needsAccommodation === 'Yes' &&
                          row.gender === 'Female'
                            ? 1
                            : 0) ?? 0,
                          10,
                        ),
                      0,
                    ) +
                      filteredData.reduce(
                        (acc, row) =>
                          acc +
                          parseInt(
                            row.numFemaleAccompanyingNeedAccommodation ?? 0,
                            10,
                          ),
                        0,
                      )}
                  </p>
                </div>
                <div className="pt-2 bg-gray-100 p-2 px-8 rounded-2xl">
                  <p className="text-sm font-bold">Total</p>
                  <p className="text-4xl font-bold">
                    {filteredData.reduce(
                      (acc, row) =>
                        acc +
                        parseInt(
                          (row.needsAccommodation === 'Yes' &&
                          row.gender === 'Male'
                            ? 1
                            : 0) ?? 0,
                          10,
                        ),
                      0,
                    ) +
                      filteredData.reduce(
                        (acc, row) =>
                          acc +
                          parseInt(
                            (row.needsAccommodation === 'Yes' &&
                            row.gender === 'Female'
                              ? 1
                              : 0) ?? 0,
                            10,
                          ),
                        0,
                      ) +
                      filteredData.reduce(
                        (acc, row) =>
                          acc +
                          parseInt(
                            row.numMaleAccompanyingNeedAccommodation ?? 0,
                            10,
                          ),
                        0,
                      ) +
                      filteredData.reduce(
                        (acc, row) =>
                          acc +
                          parseInt(
                            row.numFemaleAccompanyingNeedAccommodation ?? 0,
                            10,
                          ),
                        0,
                      )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile View */}
        <div className="bg-white p-2 rounded-3xl border flex flex-col justify-between m-4 md:hidden gap-4">
          {filteredData.map((row, _) => (
            <div
              key={row}
              className={`${row.overallRegistrationStatus === 'Accepted' ? 'bg-gray-100' : 'bg-red-200'} text-bold flex flex-col gap-2 rounded-2xl`}
            >
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
                {row.registeredEvents.map((event, _) => (
                  <p
                    key={event}
                    className="text-xs bg-green-200 text-green-800 font-bold rounded-xl p-1 px-2 w-fit"
                  >
                    {event ?? '-'}
                  </p>
                ))}
              </div>
              <div className="mt-2 px-3">
                {row.correctionRequest?.sd ? (
                  <div className="bg-red-100 p-2 rounded-xl border border-red-300">
                    <p className="text-xs text-red-800 font-semibold">
                      Correction Requested
                    </p>
                    <p className="text-xs text-red-800 font-light my-2">
                      {row.correctionRequest.sd.correctionMessage ?? '-'}
                    </p>
                    <p className="text-xs text-red-800 font-light">
                      Requested By Name:{' '}
                      {row.correctionRequest.sd.correctedByName ?? '-'}
                    </p>
                    <p className="text-xs text-red-800 font-light">
                      Requested By Phone:{' '}
                      {row.correctionRequest.sd.correctedByPhoneNumber ?? '-'}
                    </p>
                    <button
                      type="button"
                      className="bg-[#fbb7b7] text-[#350b0b] p-2 font-bold text-xs rounded-lg mt-2 w-full"
                      onClick={() => {
                        setCorrectionData(row);
                        setDialogTitle(
                          'Edit Correction Request in Student Details',
                        );
                        setDialogType('sd');

                        setCorrectionMessage(
                          row.correctionRequest.sd.correctionMessage,
                        );
                        setCorrectionName(
                          row.correctionRequest.sd.correctedByName,
                        );
                        setCorrectionPhone(
                          row.correctionRequest.sd.correctedByPhoneNumber,
                        );

                        setIsCorrectionDialogOpen(true);
                      }}
                    >
                      Edit Correction Request
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="bg-[#fbfbb7] text-[#2c350b] p-1 font-bold border border-yellow-300 text-xs rounded-lg"
                    onClick={() => {
                      setCorrectionData(row);
                      setDialogTitle('Request Correction in Student Details');
                      setDialogType('sd');

                      setCorrectionMessage('');
                      setCorrectionName('');
                      setCorrectionPhone('');

                      setIsCorrectionDialogOpen(true);
                    }}
                  >
                    Request Correction in Student Details
                  </button>
                )}
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
              <div className="mt-2 px-3">
                {row.correctionRequest?.ad ? (
                  <div className="bg-red-100 p-2 rounded-xl border border-red-300">
                    <p className="text-xs text-red-800 font-semibold">
                      Correction Requested
                    </p>
                    <p className="text-xs text-red-800 font-light my-2">
                      {row.correctionRequest.ad.correctionMessage ?? '-'}
                    </p>
                    <p className="text-xs text-red-800 font-light">
                      Requested By Name:{' '}
                      {row.correctionRequest.ad.correctedByName ?? '-'}
                    </p>
                    <p className="text-xs text-red-800 font-light">
                      Requested By Phone:{' '}
                      {row.correctionRequest.ad.correctedByPhoneNumber ?? '-'}
                    </p>
                    <button
                      type="button"
                      className="bg-[#fbb7b7] text-[#350b0b] p-2 font-bold text-xs rounded-lg mt-2 w-full"
                      onClick={() => {
                        setCorrectionData(row);
                        setDialogTitle(
                          'Edit Correction Request in Arrival & Departure Logistics',
                        );
                        setDialogType('ad');

                        setCorrectionMessage(
                          row.correctionRequest.ad.correctionMessage,
                        );
                        setCorrectionName(
                          row.correctionRequest.ad.correctedByName,
                        );
                        setCorrectionPhone(
                          row.correctionRequest.ad.correctedByPhoneNumber,
                        );

                        setIsCorrectionDialogOpen(true);
                      }}
                    >
                      Edit Correction Request
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="bg-[#fbfbb7] text-[#2c350b] p-1 font-bold border border-yellow-300 text-xs rounded-lg"
                    onClick={() => {
                      setCorrectionData(row);
                      setDialogTitle(
                        'Request Correction in Arrival & Departure Logistics',
                      );
                      setDialogType('ad');

                      setCorrectionMessage('');
                      setCorrectionName('');
                      setCorrectionPhone('');

                      setIsCorrectionDialogOpen(true);
                    }}
                  >
                    Request Correction in Arrival & Departure Logistics
                  </button>
                )}
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
              <div className="mt-2 px-3">
                {row.correctionRequest?.ac ? (
                  <div className="bg-red-100 p-2 rounded-xl border border-red-300">
                    <p className="text-xs text-red-800 font-semibold">
                      Correction Requested
                    </p>
                    <p className="text-xs text-red-800 font-light my-2">
                      {row.correctionRequest.ac.correctionMessage ?? '-'}
                    </p>
                    <p className="text-xs text-red-800 font-light">
                      Requested By Name:{' '}
                      {row.correctionRequest.ac.correctedByName ?? '-'}
                    </p>
                    <p className="text-xs text-red-800 font-light">
                      Requested By Phone:{' '}
                      {row.correctionRequest.ac.correctedByPhoneNumber ?? '-'}
                    </p>
                    <button
                      type="button"
                      className="bg-[#fbb7b7] text-[#350b0b] p-2 font-bold text-xs rounded-lg mt-2 w-full"
                      onClick={() => {
                        setCorrectionData(row);
                        setDialogTitle(
                          'Edit Correction Request in Accompany Details',
                        );
                        setDialogType('ac');

                        setCorrectionMessage(
                          row.correctionRequest.ac.correctionMessage,
                        );
                        setCorrectionName(
                          row.correctionRequest.ac.correctedByName,
                        );
                        setCorrectionPhone(
                          row.correctionRequest.ac.correctedByPhoneNumber,
                        );

                        setIsCorrectionDialogOpen(true);
                      }}
                    >
                      Edit Correction Request
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="bg-[#fbfbb7] text-[#2c350b] p-1 font-bold border border-yellow-300 text-xs rounded-lg"
                    onClick={() => {
                      setCorrectionData(row);
                      setDialogTitle('Request Correction in Accompany Details');
                      setDialogType('ac');

                      setCorrectionMessage('');
                      setCorrectionName('');
                      setCorrectionPhone('');

                      setIsCorrectionDialogOpen(true);
                    }}
                  >
                    Request Correction in Accompany Details
                  </button>
                )}
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
              <div className="mt-2 px-3 pb-4">
                {row.correctionRequest?.rc ? (
                  <div className="bg-red-100 p-2 rounded-xl border border-red-300">
                    <p className="text-xs text-red-800 font-semibold">
                      Correction Requested
                    </p>
                    <p className="text-xs text-red-800 font-light my-2">
                      {row.correctionRequest.rc.correctionMessage ?? '-'}
                    </p>
                    <p className="text-xs text-red-800 font-light">
                      Requested By Name:{' '}
                      {row.correctionRequest.rc.correctedByName ?? '-'}
                    </p>
                    <p className="text-xs text-red-800 font-light">
                      Requested By Phone:{' '}
                      {row.correctionRequest.rc.correctedByPhoneNumber ?? '-'}
                    </p>
                    <button
                      type="button"
                      className="bg-[#fbb7b7] text-[#350b0b] p-2 font-bold text-xs rounded-lg mt-2 w-full"
                      onClick={() => {
                        setCorrectionData(row);
                        setDialogTitle(
                          'Edit Correction Request in Accomodation Details',
                        );
                        setDialogType('rc');

                        setCorrectionMessage(
                          row.correctionRequest.rc.correctionMessage,
                        );
                        setCorrectionName(
                          row.correctionRequest.rc.correctedByName,
                        );
                        setCorrectionPhone(
                          row.correctionRequest.rc.correctedByPhoneNumber,
                        );

                        setIsCorrectionDialogOpen(true);
                      }}
                    >
                      Edit Correction Request
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="bg-[#fbfbb7] text-[#2c350b] p-1 font-bold border border-yellow-300 text-xs rounded-lg"
                    onClick={() => {
                      setCorrectionData(row);
                      setDialogTitle(
                        'Request Correction in Accomodation Details',
                      );
                      setDialogType('rc');

                      setCorrectionMessage('');
                      setCorrectionName('');
                      setCorrectionPhone('');

                      setIsCorrectionDialogOpen(true);
                    }}
                  >
                    Request Correction in Accomodation Details
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Tab and Desktop View */}
        <div className="overflow-x-auto m-4 hidden md:block">
          <table className="table-auto w-full mt-6 border-collapse">
            <thead>
              <tr className="bg-black text-white">
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
              {filteredData.map((row, _) => (
                <tr
                  key={row}
                  className={`${row.overallRegistrationStatus === 'Accepted' ? 'bg-white' : 'bg-red-200'} hover:bg-blue-50 text-bold transition duration-200`}
                >
                  <td className="px-4 py-2 border max-w-[160px]">
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
                    <div className="mt-2 px-3">
                      {row.correctionRequest?.sd ? (
                        <div className="bg-red-100 p-2 rounded-xl border border-red-300">
                          <p className="text-xs text-red-800 font-semibold">
                            Correction Requested
                          </p>
                          <p className="text-xs text-red-800 font-light my-2">
                            {row.correctionRequest.sd.correctionMessage ?? '-'}
                          </p>
                          <p className="text-xs text-red-800 font-light">
                            Requested By Name:{' '}
                            {row.correctionRequest.sd.correctedByName ?? '-'}
                          </p>
                          <p className="text-xs text-red-800 font-light">
                            Requested By Phone:{' '}
                            {row.correctionRequest.sd.correctedByPhoneNumber ??
                              '-'}
                          </p>
                          <button
                            type="button"
                            className="bg-[#fbb7b7] text-[#350b0b] p-2 font-bold text-xs rounded-lg mt-2 w-full"
                            onClick={() => {
                              setCorrectionData(row);
                              setDialogTitle(
                                'Edit Correction Request in Student Details',
                              );
                              setDialogType('sd');

                              setCorrectionMessage(
                                row.correctionRequest.sd.correctionMessage,
                              );
                              setCorrectionName(
                                row.correctionRequest.sd.correctedByName,
                              );
                              setCorrectionPhone(
                                row.correctionRequest.sd.correctedByPhoneNumber,
                              );

                              setIsCorrectionDialogOpen(true);
                            }}
                          >
                            Edit Correction Request
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="bg-[#fbfbb7] text-[#2c350b] p-1 font-bold border border-yellow-300 text-xs rounded-lg"
                          onClick={() => {
                            setCorrectionData(row);
                            setDialogTitle(
                              'Request Correction in Student Details',
                            );
                            setDialogType('sd');

                            setCorrectionMessage('');
                            setCorrectionName('');
                            setCorrectionPhone('');

                            setIsCorrectionDialogOpen(true);
                          }}
                        >
                          Request Correction in Student Details
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2 border max-w-[200px]">
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
                  <td className="border max-w-[200px]">
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
                      <div className="mt-2 px-3">
                        {row.correctionRequest?.ad ? (
                          <div className="bg-red-100 p-2 rounded-xl border border-red-300">
                            <p className="text-xs text-red-800 font-semibold">
                              Correction Requested
                            </p>
                            <p className="text-xs text-red-800 font-light my-2">
                              {row.correctionRequest.ad.correctionMessage ??
                                '-'}
                            </p>
                            <p className="text-xs text-red-800 font-light">
                              Requested By Name:{' '}
                              {row.correctionRequest.ad.correctedByName ?? '-'}
                            </p>
                            <p className="text-xs text-red-800 font-light">
                              Requested By Phone:{' '}
                              {row.correctionRequest.ad
                                .correctedByPhoneNumber ?? '-'}
                            </p>
                            <button
                              type="button"
                              className="bg-[#fbb7b7] text-[#350b0b] p-2 font-bold text-xs rounded-lg mt-2 w-full"
                              onClick={() => {
                                setCorrectionData(row);
                                setDialogTitle(
                                  'Edit Correction Request in Arrival & Departure Logistics',
                                );
                                setDialogType('ad');

                                setCorrectionMessage(
                                  row.correctionRequest.ad.correctionMessage,
                                );
                                setCorrectionName(
                                  row.correctionRequest.ad.correctedByName,
                                );
                                setCorrectionPhone(
                                  row.correctionRequest.ad
                                    .correctedByPhoneNumber,
                                );

                                setIsCorrectionDialogOpen(true);
                              }}
                            >
                              Edit Correction Request
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="bg-[#fbfbb7] text-[#2c350b] p-1 font-bold border border-yellow-300 text-xs rounded-lg"
                            onClick={() => {
                              setCorrectionData(row);
                              setDialogTitle(
                                'Request Correction in Arrival & Departure Logistics',
                              );
                              setDialogType('ad');

                              setCorrectionMessage('');
                              setCorrectionName('');
                              setCorrectionPhone('');

                              setIsCorrectionDialogOpen(true);
                            }}
                          >
                            Request Correction in Arrival & Departure Logistics
                          </button>
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
                    <div className="mt-2 px-3">
                      {row.correctionRequest?.ac ? (
                        <div className="bg-red-100 p-2 rounded-xl border border-red-300">
                          <p className="text-xs text-red-800 font-semibold">
                            Correction Requested
                          </p>
                          <p className="text-xs text-red-800 font-light my-2">
                            {row.correctionRequest.ac.correctionMessage ?? '-'}
                          </p>
                          <p className="text-xs text-red-800 font-light">
                            Requested By Name:{' '}
                            {row.correctionRequest.ac.correctedByName ?? '-'}
                          </p>
                          <p className="text-xs text-red-800 font-light">
                            Requested By Phone:{' '}
                            {row.correctionRequest.ac.correctedByPhoneNumber ??
                              '-'}
                          </p>
                          <button
                            type="button"
                            className="bg-[#fbb7b7] text-[#350b0b] p-2 font-bold text-xs rounded-lg mt-2 w-full"
                            onClick={() => {
                              setCorrectionData(row);
                              setDialogTitle(
                                'Edit Correction Request in Accompany Details',
                              );
                              setDialogType('ac');

                              setCorrectionMessage(
                                row.correctionRequest.ac.correctionMessage,
                              );
                              setCorrectionName(
                                row.correctionRequest.ac.correctedByName,
                              );
                              setCorrectionPhone(
                                row.correctionRequest.ac.correctedByPhoneNumber,
                              );

                              setIsCorrectionDialogOpen(true);
                            }}
                          >
                            Edit Correction Request
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="bg-[#fbfbb7] text-[#2c350b] p-1 font-bold border border-yellow-300 text-xs rounded-lg"
                          onClick={() => {
                            setCorrectionData(row);
                            setDialogTitle(
                              'Request Correction in Accompany Details',
                            );
                            setDialogType('ac');

                            setCorrectionMessage('');
                            setCorrectionName('');
                            setCorrectionPhone('');

                            setIsCorrectionDialogOpen(true);
                          }}
                        >
                          Request Correction in Accompany Details
                        </button>
                      )}
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
                    <div className="mt-2 px-3 pb-4">
                      {row.correctionRequest?.rc ? (
                        <div className="bg-red-100 p-2 rounded-xl border border-red-300">
                          <p className="text-xs text-red-800 font-semibold">
                            Correction Requested
                          </p>
                          <p className="text-xs text-red-800 font-light my-2">
                            {row.correctionRequest.rc.correctionMessage ?? '-'}
                          </p>
                          <p className="text-xs text-red-800 font-light">
                            Requested By Name:{' '}
                            {row.correctionRequest.rc.correctedByName ?? '-'}
                          </p>
                          <p className="text-xs text-red-800 font-light">
                            Requested By Phone:{' '}
                            {row.correctionRequest.rc.correctedByPhoneNumber ??
                              '-'}
                          </p>
                          <button
                            type="button"
                            className="bg-[#fbb7b7] text-[#350b0b] p-2 font-bold text-xs rounded-lg mt-2 w-full"
                            onClick={() => {
                              setCorrectionData(row);
                              setDialogTitle(
                                'Edit Correction Request in Accomodation Details',
                              );
                              setDialogType('rc');

                              setCorrectionMessage(
                                row.correctionRequest.rc.correctionMessage,
                              );
                              setCorrectionName(
                                row.correctionRequest.rc.correctedByName,
                              );
                              setCorrectionPhone(
                                row.correctionRequest.rc.correctedByPhoneNumber,
                              );

                              setIsCorrectionDialogOpen(true);
                            }}
                          >
                            Edit Correction Request
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="bg-[#fbfbb7] text-[#2c350b] p-1 font-bold border border-yellow-300 text-xs rounded-lg"
                          onClick={() => {
                            setCorrectionData(row);
                            setDialogTitle(
                              'Request Correction in Accomodation Details',
                            );
                            setDialogType('rc');

                            setCorrectionMessage('');
                            setCorrectionName('');
                            setCorrectionPhone('');

                            setIsCorrectionDialogOpen(true);
                          }}
                        >
                          Request Correction in Accomodation Details
                        </button>
                      )}
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
        <div className="fixed inset-0 flex w-screen items-center justify-center p-2 overflow-y-auto">
          <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-3 text-left align-middle shadow-xl transition-all border">
            <div className="flex flex-row justify-between my-2">
              <DialogTitle className="text-sm font-medium text-gray-900 w-[70%]">
                {dialogTitle}
              </DialogTitle>
              <button
                type="button"
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
                  <title>SVG Icon</title>
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
                {dialogType === 'sd' && (
                  <>
                    <div className="px-4 pt-2">
                      <p className="mt-1 text-xs font-semibold text-gray-600">
                        Student Details
                      </p>
                      <p className="font-bold">
                        {correctionData.studentFullName ?? '-'}
                      </p>
                      <p className="text-xs">
                        {correctionData.gender ?? '-'} -{' '}
                        {correctionData.dateOfBirth ?? '-'}
                      </p>
                      <p className="text-xs">
                        {correctionData.district ?? '-'},{' '}
                        {correctionData.samithiName ?? '-'}
                      </p>
                      <p className="text-xs mt-2">
                        DOJ BV: {correctionData.dateOfJoiningBalvikas ?? '-'}{' '}
                        {correctionData.yearOfJoiningBalvikas ?? '-'}
                      </p>
                      {correctionData.studentGroup === 'Group 3' && (
                        <p className="text-xs">
                          Passed group 2:{' '}
                          {correctionData.hasPassedGroup2Exam ?? '-'}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1 px-3">
                      <p className="text-xs font-bold bg-[#c4ffc2] text-[#07210d] p-1 px-2 rounded-2xl w-fit">
                        {correctionData.studentId ?? '-'}
                      </p>
                      <p className="text-xs font-bold bg-[#bad1ff] text-[#090e2d] p-1 px-2 rounded-2xl w-fit">
                        {correctionData.studentGroup ?? '-'}
                      </p>
                      {correctionData.registeredEvents.map((event, _) => (
                        <p
                          key={event}
                          className="text-xs bg-green-200 text-green-800 font-bold rounded-xl p-1 px-2 w-fit"
                        >
                          {event ?? '-'}
                        </p>
                      ))}
                    </div>
                  </>
                )}
                {dialogType === 'ad' && (
                  <div className="mt-2">
                    <p className="text-xs font-semibold text-gray-600 px-4">
                      Arrival & Departure Logistics
                    </p>
                    <div className="flex flex-col gap-1 px-3">
                      <div className="border bg-gray-200 rounded-2xl p-2 w-full mt-1">
                        <p className="text-xs font-semibold">{'Arrival'}</p>
                        <p className="text-xs font-bold">
                          {correctionData.arrivalDate ?? '-'} -{' '}
                          {correctionData.arrivalTime ?? '-'}
                        </p>
                        <p className="text-xs">
                          {correctionData.needsPickup === 'Yes'
                            ? 'Needs pickup.'
                            : 'Pickup not needed.'}
                        </p>
                        {correctionData.needsPickup === 'Yes' && (
                          <div className="bg-blue-100 p-2 rounded-xl mt-2 border border-blue-300">
                            <p className="text-xs text-blue-950 font-semibold">
                              Mode: {correctionData.modeOfTravel ?? '-'}
                            </p>
                            <p className="text-xs text-blue-950 font-semibold">
                              Pickup Point: {correctionData.pickupPoint ?? '-'}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="border bg-gray-200 rounded-2xl p-2 w-full">
                        <p className="text-xs font-semibold">{'Departure'}</p>
                        <p className="text-xs font-bold">
                          {correctionData.departureDate ?? '-'} -{' '}
                          {correctionData.departureTime ?? '-'}
                        </p>
                        <p className="text-xs">
                          {correctionData.needsDrop === 'Yes'
                            ? 'Needs drop.'
                            : 'Drop not needed.'}
                        </p>
                        {correctionData.needsDrop === 'Yes' && (
                          <div className="bg-blue-100 p-2 rounded-xl mt-2 border border-blue-300">
                            <p className="text-xs text-blue-950 font-semibold">
                              Mode: {correctionData.modeOfTravelForDrop ?? '-'}
                            </p>
                            <p className="text-xs text-blue-950 font-semibold">
                              Drop Point: {correctionData.dropOffPoint ?? '-'}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                {dialogType === 'ac' && (
                  <div className="py-2">
                    <p className="px-4 text-xs font-semibold text-gray-600">
                      Accompany Details
                    </p>
                    <p className="px-4 text-xs">
                      {correctionData.hasAccompanyingAdults === 'Yes'
                        ? 'Has Accompanying adults.'
                        : 'No Accompany.'}
                    </p>
                    <div className="mt-2 mx-3 bg-gray-50 p-2 rounded-2xl">
                      <p className="text-xs font-bold">
                        {correctionData.accompanyingPersonName ?? '-'}
                      </p>
                      <p className="text-xs">
                        {correctionData.accompanyingPersonGender ?? '-'} -{' '}
                        {correctionData.accompanyingPersonAge ?? '-'} yrs
                      </p>
                      <p className="text-xs">
                        {correctionData.accompanyingPersonRelation ?? '-'}
                      </p>
                      <p className="text-xs">
                        {correctionData.accompanyingPersonContact ?? '-'}
                      </p>
                      <div className="flex gap-1 mt-2">
                        <p className="text-xs bg-blue-200 text-blue-800 font-bold rounded-xl p-1 px-2 w-fit">
                          {correctionData.numMaleAccompanying ?? '0'} male
                        </p>
                        <p className="text-xs bg-blue-200 text-blue-800 font-bold rounded-xl p-1 px-2 w-fit">
                          {correctionData.numFemaleAccompanying ?? '0'} female
                        </p>
                        <p className="text-xs bg-blue-200 text-blue-800 font-bold rounded-xl p-1 px-2 w-fit">
                          {correctionData.numNonParticipatingSiblings ?? '0'}{' '}
                          children
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {dialogType === 'rc' && (
                  <div className="py-2">
                    <p className="px-4 text-xs font-semibold text-gray-600">
                      Accommodation Details
                    </p>
                    <div className="mt-2 mx-3 bg-gray-50 p-2 rounded-2xl">
                      <p className="text-xs font-bold">Check-In</p>
                      <p className="text-xs">
                        {correctionData.checkInDate ?? '-'} -{' '}
                        {correctionData.checkInTime ?? '-'}
                      </p>
                      <p className="text-xs font-bold">Check-Out</p>
                      <p className="text-xs">
                        {correctionData.checkOutDate ?? '-'} -{' '}
                        {correctionData.checkOutTime ?? '-'}
                      </p>

                      <p className="text-xs mt-2 font-semibold">
                        For student: {correctionData.needsAccommodation ?? '-'}
                      </p>
                      <p className="text-xs">
                        Allergies: {correctionData.foodAllergies ?? '-'}
                      </p>
                      <div className="flex gap-1 flex-wrap mt-2">
                        <p className="text-xs bg-blue-200 text-blue-800 font-bold rounded-xl p-1 px-2 w-fit">
                          {correctionData.numMaleAccompanyingNeedAccommodation ??
                            '0'}{' '}
                          male
                        </p>
                        <p className="text-xs bg-blue-200 text-blue-800 font-bold rounded-xl p-1 px-2 w-fit">
                          {correctionData.numFemaleAccompanyingNeedAccommodation ??
                            '0'}{' '}
                          female
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                <div className="mt-2 px-3">
                  <textarea
                    className="border p-2 rounded-2xl w-full"
                    placeholder="Enter correction details here..."
                    value={correctionMessage}
                    onChange={(e) => setCorrectionMessage(e.target.value)}
                  ></textarea>

                  <p className="text-xs mx-2 mt-2">
                    {
                      'Please enter your name and phone number so that we can identify who is requesting the correction.'
                    }
                  </p>

                  <label
                    htmlFor="name"
                    className="text-xs mx-2 mt-2"
                  >
                    {'Plese enter your name with role in Balvikas.'}
                  </label>
                  <input
                    type="text"
                    value={correctionName}
                    className="border p-2 rounded-2xl w-full"
                    placeholder="eg. Ananya (Coimbatore Guru)"
                    onChange={(e) => {
                      setCorrectionName(e.target.value);
                    }}
                  />
                  <input
                    type="text"
                    value={correctionPhone}
                    className="border p-2 rounded-2xl w-full mt-1"
                    placeholder="Plese enter your phone number."
                    onChange={(e) => {
                      setCorrectionPhone(e.target.value);
                    }}
                  />

                  <div className="flex flex-row justify-between mt-2">
                    <button
                      type="button"
                      className="bg-[#ffcece] text-[#350b0b] font-bold px-4 py-1 rounded-xl mr-2 my-2 w-full disabled:opacity-50"
                      disabled={isLoading}
                      onClick={() => {
                        setIsCorrectionDialogOpen(false);
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="bg-[#dcceff] text-[#270b35] font-bold px-4 py-1 rounded-xl mr-2 my-2 w-full disabled:opacity-50"
                      disabled={
                        isLoading ||
                        (correctionMessage.toString().trim().length === 0 &&
                          correctionName.toString().trim().length === 0 &&
                          correctionPhone.toString().trim().length === 0)
                      }
                      onClick={() => {
                        setIsLoading(true);
                        submitCorrectionRequest(
                          correctionData.studentId,
                          dialogType,
                          correctionMessage,
                          correctionName,
                          correctionPhone,
                        )
                          .then((res) => {
                            setIsLoading(false);
                            if (res === true) {
                              data.forEach((row, index) => {
                                if (
                                  row.studentId === correctionData.studentId
                                ) {
                                  if (!data[index].correctionRequest) {
                                    data[index].correctionRequest = {};
                                  }

                                  if (
                                    !data[index].correctionRequest[dialogType]
                                  ) {
                                    data[index].correctionRequest[dialogType] =
                                      {};
                                  }

                                  data[index].correctionRequest[dialogType] = {
                                    correctionMessage: correctionMessage,
                                    correctedByName: correctionName,
                                    correctedByPhoneNumber: correctionPhone,
                                  };
                                }
                              });

                              setCorrectionMessage('');
                              setCorrectionName('');
                              setCorrectionPhone('');
                              setDialogType('');
                              setIsCorrectionDialogOpen(false);
                            } else {
                              alert(
                                'Failed to submit correction request. Please try again later.',
                              );
                            }
                          })
                          .catch((err) => {
                            console.log(err);
                            alert(
                              'Failed to submit correction request. Please try again later.',
                            );
                          })
                          .finally(() => {
                            setIsLoading(false);
                          });
                      }}
                    >
                      {isLoading ? 'Submitting ... ' : 'Submit Correction'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  ) : (
    <div className="flex h-screen items-center justify-center">
      <p className="text-2xl font-semibold">Loading...</p>
    </div>
  );
}
