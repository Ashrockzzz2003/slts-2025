'use client';

import { useState } from 'react';

export default function Grp2Step2({ previousStep, nextStep }) {
  const [grp2Data, setgrp2Data] = useState({
    event1: '',
    event2: '',
  });

  const [grp2error, setGrp2error] = useState({});

  const handleChange = (e) => {
    setgrp2Data({ ...grp2Data, [e.target.name]: e.target.value });
  };

  const handlePrevious21 = () => {
    previousStep();
  };

  const validateForm = () => {
    const errors = {};
    if (!grp2Data.event1) {
      errors.event1 = 'Event 1 is mandatory';
      alert('Event 1 is mandatory');
    }
    if (grp2Data.event1 === grp2Data.event2) {
      errors.event2 = 'Event 1 and Event 2 cannot be the same';
      alert('Event 1 and Event 2 cannot be the same');
    }
    if (
      (grp2Data.event1.startsWith('Tamizh Chants') &&
        grp2Data.event2.startsWith('Bhajans')) ||
      (grp2Data.event1.startsWith('Bhajans') &&
        grp2Data.event2.startsWith('Tamizh Chants'))
    ) {
      errors.event2 =
        'Student cannot participate in Tamizh Chants and Bhajans at the same time';
      alert(
        'Student cannot participate in Tamizh Chants and Bhajans at the same time',
      );
    }
    setGrp2error(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      nextStep();
    }
  };

  return (
    <div className="flex flex-col justify-center w-screen md:fit ml-auto mr-auto">
      <form onSubmit={handleSubmit}>
        <div className="rounded-2xl p-6 mt-8 mb-8 w-11/12 sm:w-8/12 mx-auto bg-gray-200 shadow-lg border border-gray-300 overflow-x-auto flex flex-col gap-4 md:gap-0">
          <div className="rounded-2xl p-6 mt-8 w-full sm:w-10/12 mx-auto bg-gray-100 shadow-lg border border-gray-300 overflow-x-auto flex flex-col gap-5 md:gap-0">
            <h2 className="text-xl text-black text-left">
              Pick to register for 1st event
            </h2>
            <div className="flex flex-col gap-2">
              <select
                name="event1"
                value={grp2Data.event1}
                onChange={handleChange}
                required
                className="text-xl text-gray-700 border border-gray-500 p-4 mt-2 rounded-2xl w-full sm:w-auto"
              >
                <option
                  value=""
                  disabled
                >
                  Select an event
                </option>
                <option value="Bhajans - Boys">Bhajans - Boys</option>
                <option value="Bhajans - Girls">Bhajans - Girls</option>
                <option value="Slokas - Boys">Slokas - Boys</option>
                <option value="Slokas - Girls">Slokas - Girls</option>
                <option value="Vedam Chanting - Boys">
                  Vedam Chanting - Boys
                </option>
                <option value="Vedam Chanting - Girls">
                  Vedam Chanting - Girls
                </option>
                <option value="Elocution - English">Elocution - English</option>
                <option value="Elocution - Tamizh">Elocution - Tamizh</option>
                <option value="Drawing">Drawing</option>
                <option value="Tamizh Chants - Boys">
                  Tamizh Chants - Boys
                </option>
                <option value="Tamizh Chants - Girls">
                  Tamizh Chants - Girls
                </option>
                <option value="GROUP - Altar Decoration (Boys)">
                  GROUP - Altar Decoration (Boys)
                </option>
                <option value="GROUP - Altar Decoration (Girls)">
                  GROUP - Altar Decoration (Girls)
                </option>
                <option value="GROUP - Devotional Singing (Boys)">
                  GROUP - Devotional Singing (Boys)
                </option>
                <option value="GROUP - Devotional Singing (Girls)">
                  GROUP - Devotional Singing (Girls)
                </option>
                <option value="GROUP - Rudram Namakam Chanting (Boys)">
                  GROUP - Rudram Namakam Chanting (Boys)
                </option>
                <option value="GROUP - Rudram Namakam Chanting (Girls)">
                  GROUP - Rudram Namakam Chanting (Girls)
                </option>
              </select>
              {grp2error.event1 && (
                <span className="text-red-500 text-sm">{grp2error.event1}</span>
              )}
            </div>
          </div>

          <div className="rounded-2xl p-6 mt-8 w-full sm:w-10/12 mx-auto bg-gray-100 shadow-lg border border-gray-300 overflow-x-auto flex flex-col gap-5 md:gap-0">
            <h2 className="text-xl text-black text-left">
              Pick to register for 2nd event (optional)
            </h2>
            <div className="flex flex-col gap-2">
              <select
                name="event2"
                value={grp2Data.event2}
                onChange={handleChange}
                className="text-xl text-gray-700 border border-gray-500 p-4 mt-2 rounded-2xl w-full sm:w-auto"
              >
                <option
                  value=""
                  disabled
                >
                  Select an event
                </option>
                <option value="Bhajans - Boys">Bhajans - Boys</option>
                <option value="Bhajans - Girls">Bhajans - Girls</option>
                <option value="Slokas - Boys">Slokas - Boys</option>
                <option value="Slokas - Girls">Slokas - Girls</option>
                <option value="Vedam Chanting - Boys">
                  Vedam Chanting - Boys
                </option>
                <option value="Vedam Chanting - Girls">
                  Vedam Chanting - Girls
                </option>
                <option value="Elocution - English">Elocution - English</option>
                <option value="Elocution - Tamizh">Elocution - Tamizh</option>
                <option value="Drawing">Drawing</option>
                <option value="Tamizh Chants - Boys">
                  Tamizh Chants - Boys
                </option>
                <option value="Tamizh Chants - Girls">
                  Tamizh Chants - Girls
                </option>
              </select>
              {grp2error.event2 && (
                <span className="text-red-500 text-sm">{grp2error.event2}</span>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center w-full px-6 sm:px-20">
            <button
              onClick={handlePrevious21}
              type="button"
              className="text-2xl font-bold mt-6 sm:mt-12 mb-4 sm:mb-7"
            >
              <span className="bg-white p-4 rounded-2xl hover:bg-slate-900 hover:text-white hover:border-blue border border-black transition">
                Previous
              </span>
            </button>

            <button
              type="submit"
              className="text-2xl font-bold mt-6 sm:mt-12 mb-4 sm:mb-7"
            >
              <span className="bg-white p-4 rounded-2xl hover:bg-slate-900 hover:text-white hover:border-blue border border-black transition">
                Next
              </span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
