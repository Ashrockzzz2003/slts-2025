'use client';

import { useState } from 'react';

export default function Step5({ previousStep, nextStep, guru }) {
  const [step5Data, setStep5Data] = useState({
    guruName: '',
    guruGender: '',
    guruAge: '',
    guruContact: '',
    adult: '',
  });

  const [step5Error, setStep5Error] = useState({});

  const [accompanyingPerson, setAccompanyingPerson] = useState([]);

  const handleChange = (e) => {
    setStep5Data({ ...step5Data, [e.target.name]: e.target.value });
  };

  const handlePrevious21 = () => {
    previousStep();
  };

  const validateForms = () => {
    const errors = {};
    if (!step5Data.adult) {
      errors.adult = 'This field is mandatory';
      alert('Please select whether adults are accompanying');
    }
    if (
      !step5Data.guruAge ||
      step5Data.guruAge.length > 2 ||
      parseInt(step5Data.guruAge) < 0
    ) {
      errors.guruAge = 'Invalid age';
      alert('Invalid Guru age');
    }
    if (
      !step5Data.guruContact ||
      step5Data.guruContact.length !== 10 ||
      parseInt(step5Data.guruContact) < 0
    ) {
      errors.guruContact = 'Invalid contact number';
      alert('Invalid Guru contact number');
    }
    accompanyingPerson.forEach((person, index) => {
      if (!person.accname) {
        errors[`accname${index}`] = 'This field is mandatory';
        alert("Accompany's name is mandatory");
      }
      if (!person.accgender) {
        errors[`accgender${index}`] = 'This field is mandatory';
        alert("Accompany's gender is mandatory");
      }
      if (!person.relation) {
        errors[`relation${index}`] = 'This field is mandatory';
        alert("Accompany's relation with student is mandatory");
      }
      if (!person.cn || person.cn.length !== 10 || parseInt(person.cn) < 0) {
        errors[`cn${index}`] = 'Invalid contact number';
        alert('Invalid contact number');
      }
      if (!person.age || person.age.length > 2 || parseInt(person.age) < 0) {
        errors[`age${index}`] = 'Invalid age';
        alert('Invalid age');
      }
    });

    setStep5Error(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForms()) {
      nextStep();
    }
  };

  const handleAddPerson = () => {
    setAccompanyingPerson([
      ...accompanyingPerson,
      { accname: '', cn: '', age: '', relation: '', accgender: '' },
    ]);
  };

  const handleAccompanyingChange = (index, e) => {
    const { name, value } = e.target;
    const updatedPeople = [...accompanyingPerson];
    updatedPeople[index][name] = value;
    setAccompanyingPerson(updatedPeople);
  };

  return (
    <>
      <div className="flex flex-col justify-center w-screen md:fit ml-auto mr-auto">
        <form onSubmit={handleSubmit}>
          <div className="rounded-2xl p-6 mt-8 mb-8 w-11/12 sm:w-8/12 mx-auto bg-gray-200 shadow-lg border border-gray-300 overflow-x-auto flex flex-col gap-4 md:gap-0">
            {guru === 'Yes' && (
              <>
                <div className="rounded-2xl p-6 mt-8 w-full sm:w-10/12 mx-auto bg-gray-100 shadow-lg border border-gray-300 overflow-x-auto flex flex-col gap-5 md:gap-0">
                  <h2 className="text-xl text-black text-left">
                    Name of the Guru accompanying the student
                  </h2>
                  <div className="flex flex-col gap-2">
                    <input
                      type="text"
                      name="guruName"
                      placeholder="Name of the Guru accompanying the student"
                      value={step5Data.guruName}
                      onChange={handleChange}
                      required
                      className="text-xl text-gray-700 border border-gray-500 p-4 mt-2 rounded-2xl w-full sm:w-auto"
                    ></input>
                    {step5Error.guruName && (
                      <span className="text-red-500 text-sm">
                        {step5Error.guruName}
                      </span>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl p-6 mt-8 w-full sm:w-10/12 mx-auto bg-gray-100 shadow-lg border border-gray-300 overflow-x-auto flex flex-col gap-5 md:gap-0">
                  <h2 className="text-xl text-black text-left">
                    Gender of Guru
                  </h2>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="guruGender"
                      value="Male"
                      onChange={handleChange}
                      required
                      className="w-4 h-4 mt-2"
                    />
                    <span className="text-xl text-gray-700 mt-2">Male</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="guruGender"
                      value="Female"
                      onChange={handleChange}
                      className="w-4 h-4 mt-2"
                    />
                    <span className="text-xl text-gray-700 mt-2">Female</span>
                  </label>
                  {step5Error.guruGender && (
                    <span className="text-red-500 text-sm">
                      {step5Error.guruGender}
                    </span>
                  )}
                </div>

                <div className="rounded-2xl p-6 mt-8 w-full sm:w-10/12 mx-auto bg-gray-100 shadow-lg border border-gray-300 overflow-x-auto flex flex-col gap-5 md:gap-0">
                  <h2 className="text-xl text-black text-left">
                    Contact number of the Guru
                  </h2>
                  <div className="flex flex-col gap-2">
                    <input
                      type="number"
                      name="guruContact"
                      placeholder="Contact number"
                      value={step5Data.guruContact}
                      onChange={handleChange}
                      required
                      className="text-xl text-gray-700 border border-gray-500 p-4 mt-2 rounded-2xl w-full sm:w-auto"
                    ></input>
                    {step5Error.guruContact && (
                      <span className="text-red-500 text-sm">
                        {step5Error.guruContact}
                      </span>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl p-6 mt-8 w-full sm:w-10/12 mx-auto bg-gray-100 shadow-lg border border-gray-300 overflow-x-auto flex flex-col gap-5 md:gap-0">
                  <h2 className="text-xl text-black text-left">
                    Age of the Guru
                  </h2>
                  <div className="flex flex-col gap-2">
                    <input
                      type="number"
                      name="guruAge"
                      placeholder="Age"
                      value={step5Data.guruAge}
                      onChange={handleChange}
                      required
                      className="text-xl text-gray-700 border border-gray-500 p-4 mt-2 rounded-2xl w-full sm:w-auto"
                    ></input>
                    {step5Error.guruAge && (
                      <span className="text-red-500 text-sm">
                        {step5Error.guruAge}
                      </span>
                    )}
                  </div>
                </div>
              </>
            )}

            <div className="rounded-2xl p-6 mt-8 w-full sm:w-10/12 mx-auto bg-gray-100 shadow-lg border border-gray-300 overflow-x-auto flex flex-col gap-5 md:gap-0">
              <h2 className="text-xl text-black text-left">
                Are adults (other than Guru) accompanying the student?
              </h2>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="adult"
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
                    name="adult"
                    value="No"
                    onChange={handleChange}
                    className="w-4 h-4"
                  />
                  <span className="text-xl text-gray-700">No</span>
                </label>
                {step5Error.adult && (
                  <span className="text-red-500 text-sm">
                    {step5Error.adult}
                  </span>
                )}
              </div>
            </div>

            {step5Data.adult === 'Yes' && (
              <button
                onClick={handleAddPerson}
                type="button"
                className="text-2xl font-bold mt-6 sm:mt-12 mb-4 sm:mb-7"
              >
                <span className="bg-white p-4 rounded-2xl hover:bg-slate-900 hover:text-white hover:border-blue border border-black transition">
                  Add Person
                </span>
              </button>
            )}

            {accompanyingPerson.map((person, index) => (
              <div key={person.accname || index}>
                <div
                  key={index}
                  className="rounded-2xl p-6 mt-8 w-full sm:w-10/12 mx-auto bg-gray-100 shadow-lg border border-gray-300 overflow-x-auto flex flex-col gap-5 md:gap-0"
                >
                  <div>
                    <h1 className="text-2xl font-bold mb-4">
                      Accompanying Person {index + 1}
                    </h1>
                  </div>

                  <div className="flex flex-col gap-2">
                    <input
                      type="text"
                      name="accname"
                      placeholder="Name of the accompanying person"
                      onChange={(e) => handleAccompanyingChange(index, e)}
                      className="text-xl text-gray-700 border border-gray-500 p-4 rounded-2xl"
                    ></input>
                    {person.accname && (
                      <span className="text-red-500 text-sm">
                        {person.accname}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 mt-3">
                    <input
                      type="number"
                      name="cn"
                      placeholder="Contact number"
                      onChange={(e) => handleAccompanyingChange(index, e)}
                      className="text-xl text-gray-700 border border-gray-500 p-4 rounded-2xl"
                    ></input>
                    {person.cn && (
                      <span className="text-red-500 text-sm">{person.cn}</span>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 mt-3">
                    <input
                      type="number"
                      name="age"
                      placeholder="Age"
                      onChange={(e) => handleAccompanyingChange(index, e)}
                      className="text-xl text-gray-700 border border-gray-500 p-4 rounded-2xl"
                    ></input>
                    {person.age && (
                      <span className="text-red-500 text-sm">{person.age}</span>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 mt-3">
                    <input
                      type="text"
                      name="relation"
                      placeholder="Relation with student"
                      onChange={(e) => handleAccompanyingChange(index, e)}
                      className="text-xl text-gray-700 border border-gray-500 p-4 rounded-2xl"
                    ></input>
                    {person.relation && (
                      <span className="text-red-500 text-sm">
                        {person.relation}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap- mt-1">
                    <select
                      name="accgender"
                      onChange={(e) => handleAccompanyingChange(index, e)}
                      required
                      className="text-xl text-gray-700 border border-gray-500 p-4 mt-2 rounded-2xl w-full sm:w-auto"
                    >
                      <option
                        value=""
                        disabled
                      >
                        Gender
                      </option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  {person.accgender && (
                    <span className="text-red-500 text-sm">
                      {person.accgender}
                    </span>
                  )}
                </div>
              </div>
            ))}

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
