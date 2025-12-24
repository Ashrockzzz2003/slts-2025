'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import secureLocalStorage from 'react-secure-storage';
import { getRegistrationData } from '@/app/_util/data';
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

  const [searchQuery, setSearchQuery] = useState('');
  const [filterNeedForPickup, setFilterNeedForPickup] = useState('');
  const [filterNeedForDrop, setFilterNeedForDrop] = useState('');
  const [filterNeedForAccommodation, setFilterNeedForAccommodation] =
    useState('');
  const [filterNeedForFoodPacket, setFilterNeedForFoodPacket] = useState('');
  const [filterHasAccompanying, setFilterHasAccompanying] = useState('');
  const [expandedCards, setExpandedCards] = useState(new Set());

  const toggleCard = (index) => {
    setExpandedCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  useEffect(() => {
    if (!secureLocalStorage.getItem('user')) {
      router.push('/');
    }

    const user = JSON.parse(secureLocalStorage.getItem('user'));
    setUser(user);
    getRegistrationData().then((_data) => {
      // Handle Logout.
      if (_data == null || _data.length != 8) {
        router.push('/');
      }

      setData(_data[0]);
      setFilteredData(_data[0]);

      setDistricts(_data[1]);
      setEvents(_data[2]);
      setGroups(_data[3]);
      setModeOfTravelOptions(_data[4]);
      setModeOfTravelForDropOptions(_data[5]);
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
              (filterNeedForAccommodation === 'Yes' &&
                row.needsAccommodation === 'Yes') ||
              (filterNeedForAccommodation === 'No' &&
                (row.needsAccommodation === 'No' ||
                  row.needsAccommodation === 'Own Accommodation')) ||
              (filterNeedForAccommodation === 'Own Accommodation' &&
                row.needsAccommodation === 'Own Accommodation')) &&
            (filterNeedForFoodPacket === '' ||
              row.needsReturnFoodPacket.toString() ===
                filterNeedForFoodPacket) &&
            (filterHasAccompanying === '' ||
              row.hasAccompanyingAdults === filterHasAccompanying) &&
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
    filterNeedForFoodPacket,
    filterHasAccompanying,
    searchQuery,
    filterModeOfTravel,
    filterModeOfTravelForDrop,
  ]);

  return user && filteredData ? (
    <>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">SLBTS 2025</h1>
              <p className="text-gray-500">{user.name}</p>
            </div>

            <div className="flex gap-3 w-full md:w-auto">
              <button
                className="flex-1 md:flex-none bg-indigo-100 text-indigo-800 hover:bg-indigo-200 font-semibold px-4 py-2 rounded-xl transition-colors"
                onClick={() => router.push('/admin/event')}
              >
                Events
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

          {/* Stats Section */}
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 rounded-xl">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Total Participants
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {filteredData.length}
                  </p>
                  <div className="flex gap-2 text-xs font-medium mt-1">
                    <span className="text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                      {filteredData.filter((r) => r.gender === 'Male').length}{' '}
                      Male
                    </span>
                    <span className="text-pink-600 bg-pink-50 px-1.5 py-0.5 rounded">
                      {filteredData.filter((r) => r.gender === 'Female').length}{' '}
                      Female
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-50 rounded-xl">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-purple-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Total Accompanying
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {filteredData.reduce(
                      (acc, row) =>
                        acc +
                        (parseInt(row.numMaleAccompanying) || 0) +
                        (parseInt(row.numFemaleAccompanying) || 0) +
                        (parseInt(row.numNonParticipatingSiblings) || 0),
                      0,
                    )}
                  </p>
                  <div className="flex gap-2 text-xs font-medium mt-1 flex-wrap">
                    <span className="text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                      {filteredData.reduce(
                        (acc, row) =>
                          acc + (parseInt(row.numMaleAccompanying) || 0),
                        0,
                      )}{' '}
                      Male
                    </span>
                    <span className="text-pink-600 bg-pink-50 px-1.5 py-0.5 rounded">
                      {filteredData.reduce(
                        (acc, row) =>
                          acc + (parseInt(row.numFemaleAccompanying) || 0),
                        0,
                      )}{' '}
                      Female
                    </span>
                    <span className="text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">
                      {filteredData.reduce(
                        (acc, row) =>
                          acc +
                          (parseInt(row.numNonParticipatingSiblings) || 0),
                        0,
                      )}{' '}
                      Children (
                      {filteredData.reduce(
                        (acc, row) =>
                          acc + (parseInt(row.numGirlAccompanyingKid) || 0),
                        0,
                      )}{' '}
                      girls,{' '}
                      {filteredData.reduce(
                        (acc, row) =>
                          acc + (parseInt(row.numBoyAccompanyingKid) || 0),
                        0,
                      )}{' '}
                      boys)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters Section */}
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <div className="flex flex-col gap-4">
              {/* Search */}
              <div>
                <label
                  htmlFor="search"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Search Participants
                </label>
                <input
                  id="search"
                  className="w-full border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 p-2 border"
                  placeholder="Search by student name or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Grid Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    label: 'District',
                    setter: setFilterDistrict,
                    options: districts,
                    val: filterDistrict,
                  },
                  {
                    label: 'Event',
                    setter: setFilterEvent,
                    options: events,
                    val: filterEvent,
                  },
                  {
                    label: 'Group',
                    setter: setFilterGroup,
                    options: groups,
                    val: filterGroup,
                  },
                  {
                    label: 'Pickup',
                    setter: setFilterNeedForPickup,
                    options: ['Yes', 'No'],
                    val: filterNeedForPickup,
                  },
                  {
                    label: 'Stay',
                    setter: setFilterNeedForAccommodation,
                    options: ['Yes', 'No', 'Own Accommodation'],
                    val: filterNeedForAccommodation,
                  },
                  {
                    label: 'Food',
                    setter: setFilterNeedForFoodPacket,
                    options: ['Yes', 'No'],
                    val: filterNeedForFoodPacket,
                  },
                  {
                    label: 'Accompany',
                    setter: setFilterHasAccompanying,
                    options: ['Yes', 'No'],
                    val: filterHasAccompanying,
                  },
                ].map((f, i) => (
                  <div key={i}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {f.label}
                    </label>
                    <select
                      className="w-full border-gray-300 rounded-xl focus:ring-blue-500 focus:border-blue-500 p-2 border"
                      value={f.val}
                      onChange={(e) => f.setter(e.target.value)}
                    >
                      <option value="">All {f.label}s</option>
                      {f.options.map((opt, idx) => (
                        <option
                          key={idx}
                          value={opt}
                        >
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden hidden md:block">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {[
                      'Participant & BalVikas',
                      'Logistics',
                      'Stay & Accompany',
                      'Contact & Remarks',
                    ].map((h, i) => (
                      <th
                        key={i}
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredData.map((row, index) => (
                    <tr
                      key={index}
                      className={`hover:bg-gray-50 transition-colors ${row.overallRegistrationStatus !== 'Accepted' ? 'bg-red-50/50' : ''}`}
                    >
                      {/* Column 1: Participant */}
                      <td className="px-6 py-4 align-top">
                        <div className="flex flex-col gap-2">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-gray-900">
                                {row.studentFullName ?? '-'}
                              </span>

                              <span
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                  row.ATTENDEE_STATUS === 'Attended'
                                    ? 'bg-green-100 text-green-700 border border-green-300'
                                    : 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                                }`}
                              >
                                {row.ATTENDEE_STATUS === 'Attended'
                                  ? 'Present'
                                  : 'Yet to Check In'}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                  row.gender === 'Male'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-pink-100 text-pink-800'
                                }`}
                              >
                                {row.gender?.[0] ?? '-'}
                              </span>

                              <span className="text-xs text-gray-500">
                                {row.studentId}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="inline-flex w-fit items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                              {row.studentGroup}
                            </span>
                            <span className="text-sm text-gray-700">
                              {row.district}
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-1 mt-1">
                            {row.registeredEvents
                              .slice(0, 2)
                              .map((event, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800"
                                >
                                  {event}
                                </span>
                              ))}
                            {row.registeredEvents.length > 2 && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                +{row.registeredEvents.length - 2}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Column 2: Logistics */}
                      <td className="px-6 py-4 align-top">
                        <div className="space-y-4">
                          {['Arrival', 'Departure'].map((type) => (
                            <div
                              key={type}
                              className="flex flex-col gap-1"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-gray-500 uppercase">
                                  {type}
                                </span>
                                <span
                                  className={`text-xs font-medium px-2 py-0.5 rounded ${row[`needs${type === 'Arrival' ? 'Pickup' : 'Drop'}`] === 'Yes' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-500'}`}
                                >
                                  {row[
                                    `needs${type === 'Arrival' ? 'Pickup' : 'Drop'}`
                                  ] === 'Yes'
                                    ? type === 'Arrival'
                                      ? 'Pickup'
                                      : 'Drop'
                                    : 'No'}
                                </span>
                              </div>
                              <span className="text-sm font-medium text-gray-900">
                                {row[`${type.toLowerCase()}Date`] ?? '-'}
                              </span>
                              {row[`${type.toLowerCase()}Time`] && (
                                <span className="text-xs text-gray-500">
                                  {row[`${type.toLowerCase()}Time`]}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* Column 3: Stay & Accompany */}
                      <td className="px-6 py-4 align-top">
                        <div className="flex flex-col gap-3">
                          <div className="flex flex-wrap gap-2">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${row.needsAccommodation === 'Yes' || row.needsAccommodation === 'Own Accommodation' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                            >
                              Stay:{' '}
                              {row.needsAccommodation === 'Own Accommodation'
                                ? 'Own'
                                : row.needsAccommodation}
                            </span>
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${row.needsReturnFoodPacket === 'Yes' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'}`}
                            >
                              Food: {row.needsReturnFoodPacket}
                            </span>
                          </div>

                          <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-xs font-medium text-gray-500 uppercase">
                                Accompanying
                              </span>
                              {row.totalAccompanyingCount > 0 && (
                                <span className="bg-gray-200 text-gray-700 text-xs font-bold px-1.5 py-0.5 rounded-full">
                                  {row.totalAccompanyingCount}
                                </span>
                              )}
                            </div>
                            <div className="text-sm font-medium text-gray-900 mb-1">
                              {row.accompanyingPersonName ?? 'None'}
                              {row.accompanyingPersonRelation && (
                                <span className="text-gray-500 font-normal ml-1">
                                  ({row.accompanyingPersonRelation})
                                </span>
                              )}
                            </div>
                            {row.totalAccompanyingCount > 0 && (
                              <div className="flex gap-2 text-xs text-gray-500">
                                <span>
                                  Male: {row.numMaleAccompanying ?? 0}
                                </span>
                                <span>
                                  Female: {row.numFemaleAccompanying ?? 0}
                                </span>
                                <span>
                                  Children:{' '}
                                  {row.numNonParticipatingSiblings ?? 0} (
                                  {row.numGirlAccompanyingKid ?? 0} girls,{' '}
                                  {row.numBoyAccompanyingKid ?? 0} boys)
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Column 4: Contact & Remarks */}
                      <td className="px-6 py-4 align-top">
                        <div className="flex flex-col gap-2">
                          <div className="flex flex-col">
                            {row.accompanyingPersonContact && (
                              <span className="text-sm font-medium text-gray-900">
                                {row.accompanyingPersonContact ?? '-'} (
                                {row.accompanyingPersonRelation ?? '-'})
                              </span>
                            )}
                            <br />
                            <span className="text-xs text-gray-500">
                              (student/guru/parent/guardian)
                            </span>
                            {row.contactEmail && (
                              <span className="text-xs text-blue-600 break-all">
                                {row.contactEmail ?? '-'}
                              </span>
                            )}
                            {row.contactPhone && (
                              <span className="text-xs text-blue-600 break-all">
                                {row.contactPhone ?? '-'}
                              </span>
                            )}
                          </div>

                          {row.remarks && row.remarks.trim() && (
                            <div className="mt-2 p-2 bg-yellow-50 rounded border border-yellow-100">
                              <p className="text-xs text-yellow-800 italic line-clamp-3">
                                "{row.remarks}"
                              </p>
                            </div>
                          )}

                          <div className="mt-1 text-xs text-gray-400">
                            {row.samithiName}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile View */}
          <div className="md:hidden space-y-4">
            {filteredData.map((row, index) => {
              const isExpanded = expandedCards.has(index);
              return (
                <div
                  key={index}
                  className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden ${row.overallRegistrationStatus !== 'Accepted' ? 'bg-red-50/50' : ''}`}
                >
                  <button
                    onClick={() => toggleCard(index)}
                    className="w-full p-4 text-left flex justify-between items-start"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-sm font-bold text-gray-900 line-clamp-1">
                          {row.studentFullName}
                        </span>
                        <span
                          className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${row.gender === 'Male' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'}`}
                        >
                          {row.gender?.[0] ?? '-'}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-2">
                        <span className="bg-gray-100 px-1.5 py-0.5 rounded">
                          {row.studentId}
                        </span>
                        <span className="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded">
                          {row.studentGroup}
                        </span>
                        <span>{row.district}</span>
                      </div>
                    </div>
                    <svg
                      className={`w-5 h-5 text-gray-400 shrink-0 ml-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 space-y-4 border-t border-gray-100 pt-4">
                      {/* Events */}
                      <div className="flex flex-wrap gap-1">
                        {row.registeredEvents.map((event, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800"
                          >
                            {event}
                          </span>
                        ))}
                      </div>

                      {/* Logistics Grid */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-50 p-3 rounded-xl">
                          <p className="text-xs font-medium text-gray-500 uppercase mb-1">
                            Arrival
                          </p>
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`text-xs font-medium px-1.5 py-0.5 rounded ${row.needsPickup === 'Yes' ? 'bg-amber-100 text-amber-800' : 'bg-gray-200 text-gray-600'}`}
                            >
                              {row.needsPickup === 'Yes' ? 'Pickup' : 'No'}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-gray-900">
                            {row.arrivalDate}
                          </p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-xl">
                          <p className="text-xs font-medium text-gray-500 uppercase mb-1">
                            Departure
                          </p>
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`text-xs font-medium px-1.5 py-0.5 rounded ${row.needsDrop === 'Yes' ? 'bg-amber-100 text-amber-800' : 'bg-gray-200 text-gray-600'}`}
                            >
                              {row.needsDrop === 'Yes' ? 'Drop' : 'No'}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-gray-900">
                            {row.departureDate}
                          </p>
                        </div>
                      </div>

                      {/* Accompanying */}
                      <div className="bg-gray-50 p-3 rounded-xl">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-medium text-gray-500 uppercase">
                            Accompanying
                          </span>
                          <span className="bg-gray-200 text-gray-700 text-xs font-bold px-1.5 py-0.5 rounded-full">
                            {row.totalAccompanyingCount} Total
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-900 mb-1">
                          {row.accompanyingPersonName || 'None'}
                          {row.accompanyingPersonRelation && (
                            <span className="text-gray-500 font-normal ml-1">
                              ({row.accompanyingPersonRelation})
                            </span>
                          )}
                        </p>
                        <div className="flex gap-3 text-xs text-gray-500">
                          <span>M: {row.numMaleAccompanying}</span>
                          <span>F: {row.numFemaleAccompanying}</span>
                          <span>C: {row.numNonParticipatingSiblings}</span>
                        </div>
                      </div>

                      {/* Contact */}
                      <div className="pt-2 border-t border-gray-100">
                        {row.accompanyingPersonContact && (
                          <p className="text-sm font-medium text-gray-900">
                            {row.accompanyingPersonContact ?? '-'} (
                            {row.accompanyingPersonRelation ?? '-'})
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mb-1">
                          (student/guru/parent/guardian)
                        </p>
                        {row.contactEmail && (
                          <p className="text-xs text-blue-600 mb-1">
                            {row.contactEmail}
                          </p>
                        )}
                        {row.contactPhone && (
                          <p className="text-xs text-blue-600 mb-2">
                            {row.contactPhone}
                          </p>
                        )}
                        {row.remarks && (
                          <p className="text-xs text-gray-500 italic">
                            "{row.remarks}"
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  ) : (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-gray-500 font-medium">Loading Dashboard...</p>
      </div>
    </div>
  );
}
