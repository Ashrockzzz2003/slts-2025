'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import secureLocalStorage from 'react-secure-storage';
import { getRegistrationData } from '@/app/_util/data';
import { convertAMPMTo24HourDate, time24hrTo12hr } from '@/app/_util/helper';
import { auth } from '@/app/_util/initApp';

export default function DistrictStats() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [_districts, setDistricts] = useState([]);
  const [_checkInDateOptions, setCheckInDateOptions] = useState([]);
  const [_checkOutDateOptions, setCheckOutDateOptions] = useState([]);
  // const [checkInData, setCheckInData] = useState([]);
  const [uniqueDates, setUniqueDates] = useState([]);

  const [filterDate, setFilterDate] = useState('');

  useEffect(() => {
    const savedUser = secureLocalStorage.getItem('user');
    if (!savedUser) {
      router.push('/');
      return;
    }

    const parsedUser = JSON.parse(savedUser);
    setUser(parsedUser);

    getRegistrationData().then((_data) => {
      if (!_data || _data.length !== 8) {
        console.error('Invalid registration data received');
        router.push('/');
        return;
      }

      setData(_data[0]);
      setDistricts(_data[1]);
      setCheckInDateOptions(_data[6]);
      setCheckOutDateOptions(_data[7]);

      const organizedData = _data[0];

      const groupedData = {};

      // group rows by checkInDate first.
      organizedData.forEach((item) => {
        const key = item.checkInDate;
        if (!key) return;
        if (!groupedData[key]) {
          groupedData[key] = [];
        }
        groupedData[key].push(item);
      });

      // for each checkInDate, group by checkInTime
      const groupedRows = Object.keys(groupedData).map((key) => {
        const rows = groupedData[key];
        const groupedRows = {};

        rows.forEach((row) => {
          if (!row.checkInTime) return;
          const time = convertAMPMTo24HourDate(row.checkInTime);
          if (!groupedRows[time]) {
            groupedRows[time] = [];
          }
          groupedRows[time].push(row);
        });

        return {
          checkInDate: key,
          rows: Object.keys(groupedRows).map((time) => ({
            checkInTime: time,
            rows: groupedRows[time],
          })),
        };
      });

      // sort by checkInTime
      groupedRows.forEach((group) => {
        group.rows.sort((a, b) => {
          if (a.checkInTime < b.checkInTime) {
            return -1;
          }
          if (a.checkInTime > b.checkInTime) {
            return 1;
          }
          return 0;
        });
      });

      // group each checkInTime row by district
      groupedRows.forEach((group) => {
        group.rows.forEach((row) => {
          const districtGroup = {};
          row.rows.forEach((item) => {
            if (!districtGroup[item.district]) {
              districtGroup[item.district] = [];
            }
            districtGroup[item.district].push(item);
          });

          row.rows = Object.keys(districtGroup).map((district) => ({
            district,
            rows: districtGroup[district],
          }));
        });
      });

      // get unique dates
      const _uniqueDates = groupedRows.map((group) => group.checkInDate);
      _uniqueDates.sort((a, b) => {
        if (a < b) {
          return -1;
        }
        if (a > b) {
          return 1;
        }
        return 0;
      });
      setUniqueDates(_uniqueDates);

      // sort by checkInDate groupedRows
      groupedRows.sort((a, b) => {
        if (a.checkInDate < b.checkInDate) {
          return -1;
        }
        if (a.checkInDate > b.checkInDate) {
          return 1;
        }
        return 0;
      });

      // set default filter date
      setFilterDate(_uniqueDates[0]);
      setFilteredData(groupedRows);
    });
  }, [router]);

  return user && data.length ? (
    <div className="flex flex-col justify-center w-fit mx-auto">
      <div className="rounded-2xl p-4 m-4 bg-white border flex flex-row justify-between">
        <div>
          <h1 className="text-2xl font-bold">Welcome, {user.name}</h1>
          <p className="text-gray-700">{user.email}</p>
        </div>

        <div className="flex flex-row">
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

      <div className="flex flex-wrap gap-2 my-4">
        {uniqueDates.map((date, _idx) => (
          <button
            type="button"
            key={date}
            className={`px-4 py-2 rounded-xl ${
              filterDate === date ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
            onClick={() => setFilterDate(date)}
          >
            {date}
          </button>
        ))}
      </div>

      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-800 mb-2">
          Check-In Date: {filterDate}
        </h1>
        <div className="flex flex-col gap-4">
          {filteredData[uniqueDates.indexOf(filterDate)].rows.map((g, _) => (
            <div
              key={g}
              className="bg-white p-4 rounded-2xl border"
            >
              <p className="text-sm font-bold">
                Time: {time24hrTo12hr(g.checkInTime)}
              </p>
              {g.rows.map((r, _) => (
                <div key={r}>
                  <p className="text-lg font-semibold text-gray-500">
                    {r.district}
                  </p>
                  <div className="flex justify-around gap-3">
                    <div className="pt-2">
                      <p className="text-sm font-bold">Male</p>
                      <p className="text-4xl font-bold">
                        {r.rows.reduce(
                          (acc, row) =>
                            acc +
                            ((row.needsAccommodation === 'Yes' ||
                              parseInt(
                                row.numMaleAccompanyingNeedAccommodation,
                                10,
                              ) > 0) &&
                            row.gender === 'Male'
                              ? 1
                              : 0) +
                            (parseInt(
                              row.numMaleAccompanyingNeedAccommodation,
                              10,
                            ) || 0),
                          0,
                        )}
                      </p>
                    </div>
                    <div className="pt-2">
                      <p className="text-sm font-bold">Female</p>
                      <p className="text-4xl font-bold">
                        {r.rows.reduce(
                          (acc, row) =>
                            acc +
                            ((row.needsAccommodation === 'Yes' ||
                              parseInt(
                                row.numFemaleAccompanyingNeedAccommodation,
                                10,
                              ) > 0) &&
                            row.gender === 'Female'
                              ? 1
                              : 0) +
                            (parseInt(
                              row.numFemaleAccompanyingNeedAccommodation,
                              10,
                            ) || 0),
                          0,
                        )}
                      </p>
                    </div>
                    <div className="pt-2 bg-gray-100 p-2 px-8 rounded-2xl">
                      <p className="text-sm font-bold">Total</p>
                      <p className="text-4xl font-bold">
                        {r.rows.reduce(
                          (acc, row) =>
                            acc +
                            (row.needsAccommodation === 'Yes' ||
                            parseInt(
                              row.numMaleAccompanyingNeedAccommodation,
                              10,
                            ) > 0 ||
                            parseInt(
                              row.numFemaleAccompanyingNeedAccommodation,
                              10,
                            ) > 0
                              ? 1
                              : 0) +
                            (parseInt(
                              row.numMaleAccompanyingNeedAccommodation,
                              10,
                            ) || 0) +
                            (parseInt(
                              row.numFemaleAccompanyingNeedAccommodation,
                              10,
                            ) || 0),
                          0,
                        )}
                      </p>
                    </div>
                  </div>
                  {i2 === g.rows.length - 1 ? null : <hr className="my-4" />}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  ) : (
    <div className="flex h-screen items-center justify-center">
      <p className="text-2xl font-semibold">Loading...</p>
    </div>
  );
}
