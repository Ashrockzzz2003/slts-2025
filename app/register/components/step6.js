'use client';

import { useState } from 'react';

export default function Step6({ previousStep }) {
  const [step6Data, setStep6Data] = useState({
    accomodation: '',
    noma: '',
    nowa: '',
    fa: '',
    cinDate: '',
    cinTime: '',
    coutDate: '',
    coutTime: '',
  });

  const [step6Error, setStep6Error] = useState({});

  const handleChange = (e) => {
    setStep6Data({ ...step6Data, [e.target.name]: e.target.value });
  };

  const handlePrevious21 = () => {
    previousStep();
  };

  const validateForms = () => {
    const errors = {};
    if (!step6Data.accomodation) {
      errors.accomodation = 'This field is mandatory';
      alert('Select whether the student need accomodation');
    }
    if (step6Data.accomodation === 'Yes') {
      if (!step6Data.noma) {
        errors.noma = 'This field is mandatory';
        alert('Number of gents is mandatory');
      }
      if (!step6Data.nowa) {
        errors.nowa = 'This field is mandatory';
        alert('Number of gents is mandatory');
      }
      if (!step6Data.cinDate) {
        errors.cinDate = 'This field is mandatory';
        alert('Checj-in date is mandatory');
      }
      if (!step6Data.cinTime) {
        errors.cinTime = 'This field is mandatory';
        alert('Check-in time is mandatory');
      }
      if (!step6Data.coutDate) {
        errors.coutDate = 'This field is mandatory';
        alert('Check-out date is mandatory');
      }
      if (!step6Data.coutTime) {
        errors.coutTime = 'This field is mandatory';
        alert('Check-out time is mandatory');
      }
      if (parseInt(step6Data.noma, 10) < 0) {
        errors.noma = 'Invalid number';
        alert('Invalid number of gents');
      }
      if (parseInt(step6Data.nowa, 10) < 0) {
        errors.nowa = 'Invalid number';
        alert('Invalid number of mahilas');
      }
      if (step6Data.coutDate < step6Data.cinDate) {
        errors.coutDate = 'Check-out date must be after check-in date';
        alert('Check-out date must be after check-in date');
      }
    }
    setStep6Error(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForms()) {
      alert('Registered Successfully');
    }
  };

  return (
    <div className="flex flex-col justify-center w-screen md:fit ml-auto mr-auto">
      <form onSubmit={handleSubmit}>
        <div className="rounded-2xl p-6 mt-8 mb-8 w-11/12 sm:w-8/12 mx-auto bg-gray-200 shadow-lg border border-gray-300 overflow-x-auto flex flex-col gap-4 md:gap-0">
          <div className="rounded-2xl p-6 mt-8 w-full sm:w-10/12 mx-auto bg-gray-100 shadow-lg border border-gray-300 overflow-x-auto flex flex-col gap-5 md:gap-0">
            <h2 className="text-xl text-black text-left">
              Does the student need accomodation facility?
            </h2>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="accomodation"
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
                  name="accomodation"
                  value="No"
                  onChange={handleChange}
                  className="w-4 h-4"
                />
                <span className="text-xl text-gray-700">No</span>
              </label>
              {step6Error.accomodation && (
                <span className="text-red-500 text-sm">
                  {step6Error.accomodation}
                </span>
              )}
            </div>
          </div>

          <div className="rounded-2xl p-6 mt-8 w-full sm:w-10/12 mx-auto bg-gray-100 shadow-lg border border-gray-300 overflow-x-auto flex flex-col gap-5 md:gap-0">
            <h2 className="text-xl text-black text-left">
              Number of Gents(Men) need accomodation facility
            </h2>
            <div className="flex flex-col gap-2">
              <input
                type="number"
                name="noma"
                placeholder="No. of Gents"
                onChange={handleChange}
                className="text-xl text-gray-700 border border-gray-500 p-4 mt-2 rounded-2xl w-full sm:w-auto"
              ></input>
              {step6Error.noma && (
                <span className="text-red-500 text-sm">{step6Error.noma}</span>
              )}
            </div>
          </div>

          <div className="rounded-2xl p-6 mt-8 w-full sm:w-10/12 mx-auto bg-gray-100 shadow-lg border border-gray-300 overflow-x-auto flex flex-col gap-5 md:gap-0">
            <h2 className="text-xl text-black text-left">
              Number of Mahilas(Women) need accomodation facility
            </h2>
            <div className="flex flex-col gap-2">
              <input
                type="number"
                name="nowa"
                placeholder="No. of Mahilas"
                onChange={handleChange}
                className="text-xl text-gray-700 border border-gray-500 p-4 mt-2 rounded-2xl w-full sm:w-auto"
              ></input>
              {step6Error.nowa && (
                <span className="text-red-500 text-sm">{step6Error.nowa}</span>
              )}
            </div>
          </div>

          <div className="rounded-2xl p-6 mt-8 w-full sm:w-10/12 mx-auto bg-gray-100 shadow-lg border border-gray-300 overflow-x-auto flex flex-col gap-5 md:gap-0">
            <h2 className="text-xl text-black text-left">
              Any food alergies for the student? (Optional)
            </h2>
            <div className="flex flex-col gap-2">
              <input
                type="text"
                name="fa"
                placeholder="Food alergies for the student"
                value={step6Data.fa}
                onChange={handleChange}
                className="text-xl text-gray-700 border border-gray-500 p-4 mt-2 rounded-2xl w-full sm:w-auto"
              ></input>
              {step6Error.fa && (
                <span className="text-red-500 text-sm">{step6Error.fa}</span>
              )}
            </div>
          </div>

          <div className="rounded-2xl p-6 mt-8 w-full sm:w-10/12 mx-auto bg-gray-100 shadow-lg border border-gray-300 overflow-x-auto flex flex-col gap-5 md:gap-0">
            <h2 className="text-xl text-black text-left">Check-in Date</h2>
            <div className="flex flex-col gap-2">
              <input
                type="date"
                name="cinDate"
                value={step6Data.cinDate}
                onChange={handleChange}
                className="text-xl text-gray-700 border border-gray-500 p-4 mt-2 rounded-2xl w-full sm:w-auto"
              ></input>
              {step6Error.cinDate && (
                <span className="text-red-500 text-sm">
                  {step6Error.cinDate}
                </span>
              )}
            </div>
          </div>

          <div className="rounded-2xl p-6 mt-8 w-full sm:w-10/12 mx-auto bg-gray-100 shadow-lg border border-gray-300 overflow-x-auto flex flex-col gap-5 md:gap-0">
            <h2 className="text-xl text-black text-left">Check-in Time</h2>
            <div className="flex flex-col gap-2">
              <input
                type="time"
                name="cinTime"
                value={step6Data.cinTime}
                onChange={handleChange}
                className="text-xl text-gray-700 border border-gray-500 p-4 mt-2 rounded-2xl w-full sm:w-auto"
              ></input>
              {step6Error.cinTime && (
                <span className="text-red-500 text-sm">
                  {step6Error.cinTime}
                </span>
              )}
            </div>
          </div>

          <div className="rounded-2xl p-6 mt-8 w-full sm:w-10/12 mx-auto bg-gray-100 shadow-lg border border-gray-300 overflow-x-auto flex flex-col gap-5 md:gap-0">
            <h2 className="text-xl text-black text-left">Check-out Date</h2>
            <div className="flex flex-col gap-2">
              <input
                type="date"
                name="coutDate"
                value={step6Data.coutDate}
                onChange={handleChange}
                className="text-xl text-gray-700 border border-gray-500 p-4 mt-2 rounded-2xl w-full sm:w-auto"
              ></input>
              {step6Error.coutDate && (
                <span className="text-red-500 text-sm">
                  {step6Error.coutDate}
                </span>
              )}
            </div>
          </div>

          <div className="rounded-2xl p-6 mt-8 w-full sm:w-10/12 mx-auto bg-gray-100 shadow-lg border border-gray-300 overflow-x-auto flex flex-col gap-5 md:gap-0">
            <h2 className="text-xl text-black text-left">Check-out Time</h2>
            <div className="flex flex-col gap-2">
              <input
                type="time"
                name="coutTime"
                value={step6Data.coutTime}
                onChange={handleChange}
                className="text-xl text-gray-700 border border-gray-500 p-4 mt-2 rounded-2xl w-full sm:w-auto"
              ></input>
              {step6Error.coutTime && (
                <span className="text-red-500 text-sm">
                  {step6Error.coutTime}
                </span>
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
