'use client';

import { useState } from 'react';

export default function Step2({ previousStep, nextStep }) {
  const [grp1Data, setgrp1Data] = useState({
    event1: '',
    event2: '',
    grpsinging: '',
  });

  const [error, setError] = useState({});

  const handlePrevious21 = () => {
    previousStep();
  };

  const handleNext23 = () => {
    nextStep();
  };

  const handleChange = (e) => {
    setgrp1Data({ ...grp1Data, [e.target.name]: e.target.value });
  };

  //form validation
  const validateGrp1 = () => {
    const newError = {};
    if (!grp1Data.event1) {
      newError.event1 = 'Event 1 is mandatory';
      alert('Event 1 is mandatory');
    }
    if (grp1Data.event1 === grp1Data.event2) {
      newError.event2 = 'Event 1 and Event 2 cannot be the same';
      alert('Event 1 and Event 2 cannot be the same');
    }
    if (
      (grp1Data.event1 === 'Tamizh Chants' && grp1Data.event2 === 'Bhajans') ||
      (grp1Data.event1 === 'Bhajans' && grp1Data.event2 === 'Tamizh Chants')
    ) {
      newError.event2 =
        'Student cannot participate in Tamizh Chants and Bhajans at the same time';
      alert(
        'Student cannot participate in Tamizh Chants and Bhajans at the same time',
      );
    }

    setError(newError);
    return Object.keys(newError).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateGrp1()) {
      nextStep();
    }
  };

  return (
    <>
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
                  value={grp1Data.event1}
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
                  <option value="Bhajans">Bhajans</option>
                  <option value="Slokas">Slokas</option>
                  <option value="Vedam Chanting">Vedam Chanting</option>
                  <option value="Story Telling - English">
                    Story Telling - English
                  </option>
                  <option value="Story Telling - Tamizh">
                    Story Telling - Tamizh
                  </option>
                  <option value="Drawing">Drawing</option>
                  <option value="Tamizh Chants">Tamizh Chants</option>
                </select>
                {error.event1 && (
                  <span className="text-red-500 text-sm">{error.event1}</span>
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
                  value={grp1Data.event2}
                  onChange={handleChange}
                  className="text-xl text-gray-700 border border-gray-500 p-4 mt-2 rounded-2xl w-full sm:w-auto"
                >
                  <option
                    value=""
                    disabled
                  >
                    Select an event
                  </option>
                  <option value="Bhajans">Bhajans</option>
                  <option value="Slokas">Slokas</option>
                  <option value="Vedam Chanting">Vedam Chanting</option>
                  <option value="Story Telling - English">
                    Story Telling - English
                  </option>
                  <option value="Story Telling - Tamizh">
                    Story Telling - Tamizh
                  </option>
                  <option value="Drawing">Drawing</option>
                  <option value="Tamizh Chants">Tamizh Chants</option>
                </select>
                {error.event2 && (
                  <span className="text-red-500 text-sm">{error.event2}</span>
                )}
              </div>
            </div>

            <div className="rounded-2xl p-6 mt-8 w-full sm:w-10/12 mx-auto bg-gray-100 shadow-lg border border-gray-300 overflow-x-auto flex flex-col gap-5 md:gap-0">
              <h2 className="text-xl text-black text-left">
                Pick to register for group events (optional)
              </h2>
              <div className="flex flex-col gap-2">
                <select
                  name="grpsinging"
                  value={grp1Data.grpsinging}
                  onChange={handleChange}
                  className="text-xl text-gray-700 border border-gray-500 p-4 mt-2 rounded-2xl w-full sm:w-auto"
                >
                  <option
                    value=""
                    disabled
                  >
                    Select an event
                  </option>
                  <option value="Devotional Singing (Boys)">
                    Devotional Singing (Boys)
                  </option>
                  <option value="Devotional Singing (Girls)">
                    Devotional Singing (Girls)
                  </option>
                </select>
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
    </>
  );
}
