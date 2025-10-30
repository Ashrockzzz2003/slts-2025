'use client';

import {
  Description,
  Dialog,
  DialogPanel,
  DialogTitle,
} from '@headlessui/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import secureLocalStorage from 'react-secure-storage';
import { getEventData, updateCrieria } from '@/app/_util/data';
import { auth } from '@/app/_util/initApp';

export default function ManageEvents() {
  const router = useRouter();
  const [user, setUser] = useState({});
  const [data, setData] = useState(null);
  const [filteredData, setFilteredData] = useState(null);

  const [groups, setGroups] = useState([]);
  const [filterGroup, setFilterGroup] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [cIsOpen, setCIsOpen] = useState(false);
  const [eventNameBuffer, setEventNameBuffer] = useState('');
  const [criteriaBuffer, setCriteriaBuffer] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!secureLocalStorage.getItem('user')) {
      router.push('/');
    }

    const user = JSON.parse(secureLocalStorage.getItem('user'));
    setUser(user);
    getEventData().then((_data) => {
      if (_data == null || _data.length != 2) {
        router.push('/');
      }

      setData(_data[0]);
      setFilteredData(_data[0]);
      setGroups(_data[1]);

      isLoading && setIsLoading(false);
    });
  }, [router, isLoading]);

  useEffect(() => {
    if (data) {
      setFilteredData(
        data.filter((row) => {
          return (
            (filterGroup == '' || row.group.includes(filterGroup)) &&
            (searchQuery == '' ||
              row.name.toLowerCase().includes(searchQuery.toLowerCase()))
          );
        }),
      );
    }
  }, [data, filterGroup, searchQuery]);

  return !isLoading && user && filteredData ? (
    <>
      <div className={'flex flex-col justify-center w-screen ml-auto mr-auto'}>
        <div className="rounded-2xl p-4 m-4 bg-white border overflow-x-auto justify-between flex flex-row">
          <div>
            <h1 className="text-2xl font-bold">Welcome, {user.name}</h1>
            <p className="text-gray-700">{user.email}</p>
          </div>
          <div className="flex flex-row">
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

        <div className="flex flex-row flex-wrap gap-4 m-4 justify-center overflow-x-auto">
          <div className="bg-white p-4 rounded-2xl border">
            <div className="flex flex-col gap-4">
              <div>
                <input
                  id="search"
                  className="border p-2 rounded-2xl w-full"
                  placeholder="Search by event name"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex flex-row flex-wrap gap-4 justify-center items-center">
                <div className="flex flex-col gap-2">
                  <label htmlFor="group">Group</label>
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

        <div className="flex flex-row flex-wrap gap-4 m-4 justify-center overflow-x-auto">
          <table className="table-auto w-full mt-6 border-collapse">
            <thead>
              <tr className="bg-black text-white">
                <th className="border px-4 py-2">Event Name</th>
                <th className="border px-4 py-2">Judges</th>
                <th className="border px-4 py-2">Criteria</th>
                <th className="border px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((event, index) => (
                <tr
                  key={index}
                  className="bg-white hover:bg-blue-50 text-bold transition duration-200"
                >
                  <td className="border px-4 py-2 max-w-[240px]">
                    <div>
                      <p className="font-bold">{event.name}</p>
                    </div>
                    <div className="flex flex-row flex-wrap gap-1">
                      {event.group.map((group, index) => (
                        <p
                          key={index}
                          className="bg-gray-200 text-gray-800 font-semibold px-2 py-1 rounded-xl w-fit"
                        >
                          {group}
                        </p>
                      ))}
                    </div>
                  </td>
                  <td className="border px-4 py-2">
                    <div className="flex flex-col flex-wrap gap-1 w-fit">
                      {event.judgeEmailList.map((judge, index) => (
                        <p
                          className="bg-[#f6e7ff] text-[#220b35] px-2 py-1 rounded-2xl font-semibold"
                          key={index}
                        >
                          {judge}
                        </p>
                      ))}
                    </div>
                  </td>
                  <td className="border px-4 py-2">
                    <table className="table-auto">
                      <thead>
                        <tr>
                          <th className="border px-4 py-2">Criteria</th>
                          <th className="border px-4 py-2">Marks</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.keys(event.evalCriteria).map((key, index) => (
                          <tr key={index}>
                            <td className="border px-4 py-2">{key}</td>
                            <td className="border px-4 py-2">
                              {event.evalCriteria[key]}
                            </td>
                          </tr>
                        ))}
                        <tr>
                          <td className="border px-4 py-2 font-bold">Total</td>
                          <td className="border px-4 py-2 font-bold">
                            {Object.values(event.evalCriteria).reduce(
                              (a, b) => a + b,
                              0,
                            )}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                  <td className="border px-4 py-2">
                    <div className="flex flex-col gap-2">
                      <button
                        className="bg-[#cefdff] text-[#0b0d35] font-bold px-4 py-1 rounded-xl"
                        onClick={() => {
                          setEventNameBuffer(event.name);
                          setCriteriaBuffer(Object.entries(event.evalCriteria));
                          setCIsOpen(true);
                        }}
                      >
                        Update Criteria
                      </button>
                      <a
                        className="bg-[#f7ffce] text-[#2c350b] font-bold px-4 py-1 rounded-xl text-center decoration-none"
                        href={`/admin/event/${event.name.includes('GROUP') ? 'group' : 'individual'}?event=${encodeURIComponent(event.name)}`}
                      >
                        View Leaderboard
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog
        open={cIsOpen}
        onClose={() => setCIsOpen(false)}
        className="relative z-50 shadow-2xl"
      >
        <div className="fixed inset-0 flex w-screen items-center justify-center p-4 backdrop-blur-sm">
          <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
            <div className="flex flex-row justify-between">
              <DialogTitle className="text-lg font-medium leading-6 text-gray-900">
                Update Judging Criteria
              </DialogTitle>
              <button
                onClick={() => setCIsOpen(false)}
                className="bg-gray-200 p-2 rounded-full"
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
              <Description term="Event Name">
                {filteredData[0].name}
              </Description>
              {/* Dynamic criteria as list of (key, value) pair */}
              <table className="table-auto">
                <thead>
                  <tr>
                    <th className="border px-4 py-2">Criteria</th>
                    <th className="border px-4 py-2">Marks</th>
                    <th className="border px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {criteriaBuffer.map((_, index) => (
                    <tr key={index}>
                      <td className="border px-4 py-2">
                        <input
                          type="text"
                          className="border p-2 rounded-2xl w-full"
                          value={criteriaBuffer[index][0]}
                          onChange={(e) => {
                            const _criteriaBuffer = [...criteriaBuffer];
                            _criteriaBuffer[index][0] = e.target.value;
                            setCriteriaBuffer(_criteriaBuffer);
                          }}
                        />
                      </td>
                      <td className="border px-4 py-2">
                        <input
                          type="number"
                          className="border p-2 rounded-2xl w-full"
                          value={criteriaBuffer[index][1] ?? 0}
                          onChange={(e) => {
                            const _criteriaBuffer = [...criteriaBuffer];
                            _criteriaBuffer[index][1] =
                              e.target.value.toString();
                            setCriteriaBuffer(_criteriaBuffer);
                          }}
                        />
                      </td>
                      <td className="border px-4 py-2">
                        <button
                          className="bg-[#ffcece] text-[#350b0b] font-bold px-4 py-1 rounded-xl"
                          onClick={() => {
                            const _criteriaBuffer = [...criteriaBuffer];
                            _criteriaBuffer.splice(index, 1);
                            setCriteriaBuffer(_criteriaBuffer);
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  <tr>
                    {/* total */}
                    <td className="border px-4 py-2 font-bold">Total</td>
                    <td className="border px-4 py-2 font-bold">
                      {criteriaBuffer
                        .map((c) => c[1])
                        .reduce((a, b) => a + parseInt(b), 0)}
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="flex flex-row gap-4">
                <button
                  className="bg-[#f6ffce] text-[#30350b] font-bold px-4 py-1 rounded-xl"
                  onClick={() => {
                    setCriteriaBuffer([...criteriaBuffer, ['', 0]]);
                  }}
                >
                  Add Criteria
                </button>
              </div>

              <button
                className="bg-[#d3ffce] text-[#0b3511] font-bold px-4 py-1 rounded-xl"
                onClick={() => {
                  setIsLoading(true);

                  const _criteria = {};
                  criteriaBuffer.forEach((c) => {
                    _criteria[c[0]] = c[1];
                  });

                  updateCrieria(eventNameBuffer, _criteria).then((res) => {
                    if (res) {
                      setCIsOpen(false);
                      router.refresh();
                    }
                  });
                }}
              >
                Update Criteria
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
