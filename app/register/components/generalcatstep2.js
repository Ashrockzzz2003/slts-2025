'use client';

import { useState } from 'react';

export default function GeneralStep2({ previousStep, nextStep }) {
  const [generalData, setGeneralData] = useState({
    quiz: '',
  });

  const handleChange = (e) => {
    setGeneralData({ ...generalData, [e.target.name]: e.target.value });
  };

  const handlePrevious21 = () => {
    previousStep();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    nextStep();
  };

  return (
    <>
      <div className="flex flex-col justify-center w-screen md:fit ml-auto mr-auto">
        <form onSubmit={handleSubmit}>
          <div className="rounded-2xl p-6 mt-8 mb-8 w-11/12 sm:w-8/12 mx-auto bg-gray-200 shadow-lg border border-gray-300 overflow-x-auto flex flex-col gap-4 md:gap-0">
            <div className="rounded-2xl p-6 mt-8 w-full sm:w-10/12 mx-auto bg-gray-100 shadow-lg border border-gray-300 overflow-x-auto flex flex-col gap-5 md:gap-0">
              <h2 className="text-xl text-black text-left">
                Are you willing to register for quiz?
              </h2>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="quiz"
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
                    name="quiz"
                    value="No"
                    onChange={handleChange}
                    className="w-4 h-4"
                  />
                  <span className="text-xl text-gray-700">No</span>
                </label>
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
