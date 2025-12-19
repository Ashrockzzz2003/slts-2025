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
    <div className="min-h-screen bg-slate-100 p-2 md:p-4">
      <div className="max-w-[1400px] mx-auto bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[calc(100vh-2rem)]">
        {/* Integrated Header & Controls */}
        <div className="bg-slate-50 border-b border-slate-200 p-4 space-y-4 shrink-0">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-1.5 bg-indigo-600 rounded-full"></div>
              <div>
                <h1 className="text-xl font-black text-slate-900 leading-none">
                  SLBTS 2025
                </h1>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                  {user.name}
                </p>
              </div>
            </div>

            {/* Compact Stats Integrated into Header */}
            <div className="flex items-center gap-8 bg-white px-6 py-3 rounded-2xl border-2 border-slate-100 shadow-sm">
              <div className="flex items-center gap-5 border-r-2 border-slate-50 pr-8">
                <p className="text-4xl font-black text-slate-900 leading-none tracking-tighter">
                  {filteredData.length}
                </p>
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-black text-blue-600 leading-none">
                    {filteredData.filter((r) => r.gender === 'Male').length}M
                  </span>
                  <span className="text-sm font-black text-pink-600 leading-none">
                    {filteredData.filter((r) => r.gender === 'Female').length}F
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-5">
                <p className="text-4xl font-black text-slate-900 leading-none tracking-tighter">
                  {filteredData.reduce(
                    (acc, row) =>
                      acc +
                      (parseInt(row.numMaleAccompanying) || 0) +
                      (parseInt(row.numFemaleAccompanying) || 0) +
                      (parseInt(row.numNonParticipatingSiblings) || 0),
                    0,
                  )}
                </p>
                <div className="flex items-center gap-2.5">
                  <span className="text-sm font-black text-blue-600">
                    {filteredData.reduce(
                      (acc, row) =>
                        acc + (parseInt(row.numMaleAccompanying) || 0),
                      0,
                    )}
                    M
                  </span>
                  <span className="text-sm font-black text-pink-600">
                    {filteredData.reduce(
                      (acc, row) =>
                        acc + (parseInt(row.numFemaleAccompanying) || 0),
                      0,
                    )}
                    F
                  </span>
                  <span className="text-sm font-black text-purple-600">
                    {filteredData.reduce(
                      (acc, row) =>
                        acc + (parseInt(row.numNonParticipatingSiblings) || 0),
                      0,
                    )}
                    C
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                className="bg-indigo-600 text-white font-bold px-4 py-2 rounded-xl text-sm hover:bg-indigo-700 transition"
                onClick={() => router.push('/admin/event')}
              >
                Events
              </button>
              <button
                className="bg-indigo-600 text-white font-bold px-4 py-2 rounded-xl text-sm hover:bg-indigo-700 transition"
                onClick={() => router.push('/admin/accommodation')}
              >
                Stay
              </button>
              <button
                className="bg-red-50 text-red-600 font-bold px-4 py-2 rounded-xl text-sm hover:bg-red-100 transition"
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

          {/* Integrated Search & Filters */}
          <div className="space-y-4">
            <div className="relative group">
              <span className="absolute inset-y-0 left-5 flex items-center text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </span>
              <input
                className="pl-14 pr-6 py-4 bg-white border-2 border-slate-200 rounded-2xl w-full text-slate-900 placeholder-slate-400 font-black text-xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 shadow-sm transition-all outline-none"
                placeholder="Search by student name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-7 gap-3">
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
                <div
                  key={i}
                  className="flex flex-col gap-1.5"
                >
                  <label className="text-[11px] font-black uppercase text-slate-500 ml-1 tracking-widest leading-none">
                    {f.label}
                  </label>
                  <select
                    className="bg-white border-2 border-slate-200 px-3 py-2 rounded-xl text-sm font-bold text-slate-800 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer"
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

        {/* Dense Desktop Table View */}
        <div className="flex-1 overflow-hidden hidden md:block">
          <div className="overflow-x-auto h-full scrollbar-hide">
            <table className="table-auto w-full border-collapse bg-white text-sm">
              <thead className="sticky top-0 z-20 shadow-md">
                <tr className="bg-slate-900 text-white border-b border-slate-700">
                  {[
                    'Participant & BalVikas',
                    'Logistics',
                    'Stay & Accompany',
                    'Contact & Remarks',
                  ].map((h, i) => (
                    <th
                      key={i}
                      className="px-5 py-4 text-left font-black uppercase text-sm tracking-widest"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredData.map((row, index) => (
                  <tr
                    key={index}
                    className={`${row.overallRegistrationStatus === 'Accepted' ? 'bg-white' : 'bg-red-50/30'} hover:bg-slate-50 transition`}
                  >
                    {/* Column 1: Participant */}
                    <td className="px-5 py-4 align-top border-r border-slate-50 min-w-[300px]">
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-start">
                          <p className="font-black text-slate-900 text-lg leading-tight uppercase truncate pr-2">
                            {row.studentFullName ?? '-'}
                          </p>
                          <span
                            className={`px-2.5 py-1 rounded-md text-xs font-black uppercase shrink-0 ${row.gender === 'Male' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}
                          >
                            {row.gender?.[0] ?? '-'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-slate-500">
                            {row.studentId ?? '-'}
                          </span>
                          <span className="text-sm font-bold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded leading-none">
                            {row.studentGroup ?? '-'}
                          </span>
                        </div>
                        <div className="mt-1.5">
                          <p className="text-base font-bold text-slate-800 leading-none truncate">
                            {row.district ?? '-'}
                          </p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {row.registeredEvents
                              .slice(0, 2)
                              .map((event, idx) => (
                                <span
                                  key={idx}
                                  className="text-xs bg-emerald-50 text-emerald-800 font-bold rounded px-2.5 py-1 border border-emerald-100 leading-none"
                                >
                                  {event}
                                </span>
                              ))}
                            {row.registeredEvents.length > 2 && (
                              <span className="text-xs font-bold text-slate-400 shrink-0">
                                +{row.registeredEvents.length - 2} more
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Column 2: Logistics */}
                    <td className="px-5 py-4 align-top border-r border-slate-50 min-w-[160px]">
                      <div className="space-y-3">
                        {['Arrival', 'Departure'].map((type) => (
                          <div
                            key={type}
                            className="flex flex-col"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-black text-slate-400 uppercase tracking-tighter">
                                {type}
                              </span>
                              <span
                                className={`text-xs font-bold px-2 py-0.5 rounded shrink-0 ${row[`needs${type === 'Arrival' ? 'Pickup' : 'Drop'}`] === 'Yes' ? 'bg-amber-100 text-amber-800' : 'text-slate-400'}`}
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
                            <p className="text-base font-black text-slate-900 leading-none">
                              {row[`${type.toLowerCase()}Date`] ?? '-'}
                            </p>
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* Column 3: Stay & Accompany */}
                    <td className="px-5 py-4 align-top border-r border-slate-50 min-w-[240px]">
                      <div className="flex flex-col gap-2.5">
                        <div className="flex flex-wrap gap-2">
                          <span
                            className={`text-xs font-black px-2.5 py-1 rounded border leading-none shrink-0 ${row.needsAccommodation === 'Yes' || row.needsAccommodation === 'Own Accommodation' ? 'bg-green-600 text-white border-green-700' : 'bg-slate-100 text-slate-500 border-slate-200'}`}
                          >
                            STAY:{' '}
                            {row.needsAccommodation === 'Own Accommodation'
                              ? 'Own'
                              : row.needsAccommodation}
                          </span>
                          <span
                            className={`text-xs font-black px-2.5 py-1 rounded border leading-none shrink-0 ${row.needsReturnFoodPacket === 'Yes' ? 'bg-orange-500 text-white border-orange-600' : 'bg-slate-100 text-slate-500 border-slate-200'}`}
                          >
                            FOOD: {row.needsReturnFoodPacket}
                          </span>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded-xl border-2 border-slate-100 shadow-sm overflow-hidden">
                          <div className="flex justify-between items-center mb-1.5">
                            <p className="text-base font-black text-slate-900 uppercase truncate pr-2">
                              {row.accompanyingPersonName ?? 'None'}
                            </p>
                            {row.totalAccompanyingCount > 0 && (
                              <span className="bg-slate-800 text-white text-xs font-black px-2.5 py-1 rounded-full shrink-0">
                                T:{row.totalAccompanyingCount}
                              </span>
                            )}
                          </div>
                          <div className="flex gap-3 text-sm font-bold uppercase tracking-tighter text-slate-500">
                            Male:
                            <span className="text-blue-700 shrink-0">
                              {row.numMaleAccompanying ?? 0}
                            </span>
                            Female:
                            <span className="text-pink-700 shrink-0">
                              {row.numFemaleAccompanying ?? 0}
                            </span>
                            Children:
                            <span className="text-purple-700 shrink-0">
                              {row.numNonParticipatingSiblings ?? 0} (
                              {row.numBoyAccompanyingKid} Boys +{' '}
                              {row.numGirlAccompanyingKid} Girls)
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Column 4: Contact & Remarks */}
                    <td className="px-5 py-4 align-top min-w-[240px]">
                      <div className="space-y-2">
                        <p className="font-mono font-bold text-slate-900 text-lg leading-none">
                          {row.contactPhone ?? '-'}
                        </p>
                        <p className="font-bold text-blue-700 text-sm break-all leading-none">
                          {row.contactEmail ?? '-'}
                        </p>
                        {row.remarks && (
                          <p className="mt-1.5 text-xs text-amber-950 font-bold leading-tight line-clamp-1 italic">
                            "{row.remarks}"
                          </p>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Compact Mobile View */}
        <div className="md:hidden overflow-y-auto flex-1 p-4 bg-slate-100 space-y-4">
          {filteredData.map((row, index) => {
            const totalAccompanyingCount =
              (parseInt(row.numMaleAccompanying) || 0) +
              (parseInt(row.numFemaleAccompanying) || 0) +
              (parseInt(row.numNonParticipatingSiblings) || 0);
            const isExpanded = expandedCards.has(index);
            return (
              <div
                key={index}
                className={`bg-white rounded-3xl shadow-md border border-slate-200 overflow-hidden transition-all ${row.overallRegistrationStatus === 'Accepted' ? '' : 'bg-red-50/30'}`}
              >
                {/* Clickable Header */}
                <button
                  onClick={() => toggleCard(index)}
                  className="w-full p-5 text-left flex justify-between items-start hover:bg-slate-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 mb-2">
                      <p className="font-black text-slate-900 text-lg uppercase leading-tight flex-1">
                        {row.studentFullName}
                      </p>
                      <div className="flex gap-2 shrink-0">
                        <span
                          className={`px-2.5 py-1 rounded-md text-xs font-black uppercase ${row.gender === 'Male' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}
                        >
                          {row.gender?.[0] ?? '-'}
                        </span>
                        <span className="text-[11px] font-black bg-indigo-50 text-indigo-700 px-2 py-1 rounded-lg leading-none">
                          {row.studentGroup}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-3 text-xs font-bold text-slate-500">
                      <span className="bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                        {row.studentId}
                      </span>
                      <span className="text-slate-500">{row.district}</span>
                    </div>
                  </div>
                  <svg
                    className={`w-6 h-6 text-slate-400 shrink-0 ml-2 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="px-5 pb-5 space-y-3 border-t border-slate-100 pt-3">
                    {/* Events */}
                    {row.registeredEvents &&
                      row.registeredEvents.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {row.registeredEvents.map((event, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-emerald-50 text-emerald-800 font-bold rounded px-2.5 py-1 border border-emerald-100 leading-none"
                            >
                              {event}
                            </span>
                          ))}
                        </div>
                      )}

                    {/* Logistics */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-50 p-3 rounded-2xl">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-black uppercase text-slate-400 text-[10px] tracking-wider">
                            Arrival
                          </p>
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded shrink-0 ${row.needsPickup === 'Yes' ? 'bg-amber-100 text-amber-800' : 'text-slate-400'}`}
                          >
                            {row.needsPickup === 'Yes' ? 'Pickup' : 'No'}
                          </span>
                        </div>
                        <p className="font-bold text-slate-800 text-sm">
                          {row.arrivalDate ?? '-'}
                        </p>
                        {row.arrivalTime && (
                          <p className="text-xs text-slate-500 mt-0.5">
                            {row.arrivalTime}
                          </p>
                        )}
                      </div>
                      <div className="bg-slate-50 p-3 rounded-2xl">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-black uppercase text-slate-400 text-[10px] tracking-wider">
                            Departure
                          </p>
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded shrink-0 ${row.needsDrop === 'Yes' ? 'bg-amber-100 text-amber-800' : 'text-slate-400'}`}
                          >
                            {row.needsDrop === 'Yes' ? 'Drop' : 'No'}
                          </span>
                        </div>
                        <p className="font-bold text-slate-800 text-sm">
                          {row.departureDate ?? '-'}
                        </p>
                        {row.departureTime && (
                          <p className="text-xs text-slate-500 mt-0.5">
                            {row.departureTime}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Stay & Food */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-50 p-3 rounded-2xl">
                        <p className="font-black uppercase text-slate-400 text-[10px] mb-1 tracking-wider">
                          Stay
                        </p>
                        <span
                          className={`text-xs font-black px-2.5 py-1 rounded border leading-none ${row.needsAccommodation === 'Yes' || row.needsAccommodation === 'Own Accommodation' ? 'bg-green-600 text-white border-green-700' : 'bg-slate-100 text-slate-500 border-slate-200'}`}
                        >
                          {row.needsAccommodation === 'Own Accommodation'
                            ? 'Own'
                            : row.needsAccommodation}
                        </span>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-2xl">
                        <p className="font-black uppercase text-slate-400 text-[10px] mb-1 tracking-wider">
                          Food
                        </p>
                        <span
                          className={`text-xs font-black px-2.5 py-1 rounded border leading-none ${row.needsReturnFoodPacket === 'Yes' ? 'bg-orange-500 text-white border-orange-600' : 'bg-slate-100 text-slate-500 border-slate-200'}`}
                        >
                          {row.needsReturnFoodPacket}
                        </span>
                      </div>
                    </div>

                    {/* Accompanying */}
                    {totalAccompanyingCount > 0 && (
                      <div className="bg-slate-50 p-3 rounded-2xl border-2 border-slate-100">
                        <div className="flex justify-between items-center mb-1.5">
                          <p className="text-sm font-black text-slate-900 uppercase truncate pr-2">
                            {row.accompanyingPersonName ?? 'None'}
                          </p>
                          <span className="bg-slate-800 text-white text-xs font-black px-2.5 py-1 rounded-full shrink-0">
                            T:{totalAccompanyingCount}
                          </span>
                        </div>
                        <div className="flex gap-3 text-xs font-bold uppercase tracking-tighter">
                          <span className="text-blue-700 shrink-0">
                            M:{row.numMaleAccompanying ?? 0}
                          </span>
                          <span className="text-pink-700 shrink-0">
                            F:{row.numFemaleAccompanying ?? 0}
                          </span>
                          {row.numNonParticipatingSiblings > 0 && (
                            <span className="text-purple-700 shrink-0">
                              C:{row.numNonParticipatingSiblings}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Contact */}
                    <div className="pt-2 border-t border-slate-100 space-y-2">
                      <p className="font-mono font-bold text-slate-900 text-sm">
                        {row.contactPhone ?? '-'}
                      </p>
                      {row.contactEmail && (
                        <p className="font-bold text-blue-700 text-xs break-all">
                          {row.contactEmail}
                        </p>
                      )}
                      {row.remarks && row.remarks.trim() && (
                        <p className="text-xs text-amber-950 font-bold leading-tight italic mt-1">
                          "{row.remarks}"
                        </p>
                      )}
                      <p className="text-xs text-slate-500 font-medium italic">
                        {row.district} • {row.samithiName}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  ) : (
    <div className="flex h-screen items-center justify-center">
      <p className="text-2xl font-semibold text-slate-400 animate-pulse">
        Loading Dashboard...
      </p>
    </div>
  );
}
