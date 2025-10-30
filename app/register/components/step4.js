'use client';

import { useState } from 'react';

export default function Step4({ previousStep, nextStep }) {
  const [step4Data, setStep4Data] = useState({
    dod: '',
    tod: '',
    drop: '',
    mot: '',
    dp: '',
  });

  const [step4Error, setstep4Error] = useState({});

  const handleChange = (e) => {
    setStep4Data({ ...step4Data, [e.target.name]: e.target.value });
  };

  const handlePrevious21 = () => {
    previousStep();
  };

  const validateForm = () => {
    const errors = {};
    if (!step4Data.dod) {
      errors.dod = 'Date of depature is mandatory';
      alert('Date of depature is mandatory');
    }
    if (!step4Data.tod) {
      errors.tod = 'Time of depature is mandatory';
      alert('Time of depature is mandatory');
    }
    if (!step4Data.drop) {
      errors.drop = 'Drop facility is mandatory';
      alert('Drop facility is mandatory');
    }
    if (step4Data.drop === 'Yes' && !step4Data.mot) {
      errors.mot = 'Mode of Transport is mandatory';
      alert('Mode of Transport is mandatory');
    }
    if (step4Data.drop === 'Yes' && !step4Data.dp) {
      errors.dp = 'Drop off point is mandatory';
      alert('Drop off point is mandatory');
    }

    setstep4Error(errors);
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
            <h2 className="text-xl text-black text-left">Date of Depature</h2>
            <div className="flex flex-col gap-2">
              <input
                type="date"
                name="dod"
                value={step4Data.dod}
                onChange={handleChange}
                required
                className="text-xl text-gray-700 border border-gray-500 p-4 mt-2 rounded-2xl w-full sm:w-auto"
              ></input>
              {step4Error.dod && (
                <span className="text-red-500 text-sm">{step4Error.dod}</span>
              )}
            </div>
          </div>

          <div className="rounded-2xl p-6 mt-8 w-full sm:w-10/12 mx-auto bg-gray-100 shadow-lg border border-gray-300 overflow-x-auto flex flex-col gap-5 md:gap-0">
            <h2 className="text-xl text-black text-left">Time of Depature</h2>
            <div className="flex flex-col gap-2">
              <input
                type="time"
                name="tod"
                value={step4Data.tod}
                onChange={handleChange}
                required
                className="text-xl text-gray-700 border border-gray-500 p-4 mt-2 rounded-2xl w-full sm:w-auto"
              ></input>
              {step4Error.tod && (
                <span className="text-red-500 text-sm">{step4Error.tod}</span>
              )}
            </div>
          </div>

          <div className="rounded-2xl p-6 mt-8 w-full sm:w-10/12 mx-auto bg-gray-100 shadow-lg border border-gray-300 overflow-x-auto flex flex-col gap-5 md:gap-0">
            <h2 className="text-xl text-black text-left">
              Does the student need drop facility?
            </h2>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="drop"
                  value="Yes"
                  onChange={handleChange}
                  required
                  className="w-4 h-4 mt-2"
                />
                <span className="text-xl text-gray-700 mt-2">Yes</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="drop"
                  value="No"
                  onChange={handleChange}
                  className="w-4 h-4"
                />
                <span className="text-xl text-gray-700">No</span>
              </label>
            </div>
          </div>

          <div className="rounded-2xl p-6 mt-8 w-full sm:w-10/12 mx-auto bg-gray-100 shadow-lg border border-gray-300 overflow-x-auto flex flex-col gap-5 md:gap-0">
            <h2 className="text-xl text-black text-left">Mode of Travel</h2>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="mot"
                  value="Train"
                  onChange={handleChange}
                  className="w-4 h-4 mt-2"
                />
                <span className="text-xl text-gray-700 mt-2">Train</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="mot"
                  value="Bus"
                  onChange={handleChange}
                  className="w-4 h-4"
                />
                <span className="text-xl text-gray-700">Bus</span>
              </label>
              {step4Error.mot && (
                <span className="text-red-500 text-sm">{step4Error.mot}</span>
              )}
            </div>
          </div>

          <div className="rounded-2xl p-6 mt-8 w-full sm:w-10/12 mx-auto bg-gray-100 shadow-lg border border-gray-300 overflow-x-auto flex flex-col gap-5 md:gap-0">
            <h2 className="text-xl text-black text-left">Drop Off Point</h2>
            <div className="flex flex-col gap-2">
              <input
                type="text"
                name="dp"
                placeholder="Drop off Point (Landmark)"
                onChange={handleChange}
                className="text-xl text-gray-700 border border-gray-500 p-4 mt-2 rounded-2xl w-full sm:w-auto"
              ></input>
              {step4Error.dp && (
                <span className="text-red-500 text-sm">{step4Error.dp}</span>
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
