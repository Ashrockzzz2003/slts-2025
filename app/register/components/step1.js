'use client';

import { useState } from 'react';

export default function Step1({ nextStep, setSelectedGroup, setGuru }) {
  const [formData, setFormData] = useState({
    group: '',
    fullName: '',
    dob: '',
    gender: '',
    district: '',
    samithiName: '',
    yoj: '',
    guru: '',
    doj: '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const parseDate = (dateStr) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  //field validation
  const validateForms = () => {
    const newErrors = {};

    if (!formData.group) {
      newErrors.group = 'Group is mandatory';
      alert('Group is mandatory');
    }
    if (!formData.fullName) {
      newErrors.fullName = 'Name is mandatory';
      alert('Name is mandatory');
    }
    if (!formData.dob) {
      newErrors.dob = 'Date of Birth is mandatory';
      alert('Date of Birth is mandatory');
    } else {
      const dob = parseDate(formData.dob);
      if (
        formData.group === 'Group 1' &&
        (dob < parseDate('2015-12-25') || dob > parseDate('2019-12-24'))
      ) {
        newErrors.dob =
          'For Group 1, DOB should be between 25-12-2015 and 24-12-2019';
        alert('For Group 1, DOB should be between 25-12-2015 and 24-12-2019');
      }
      if (
        formData.group === 'Group 2' &&
        (dob < parseDate('2012-12-25') || dob > parseDate('2015-12-24'))
      ) {
        newErrors.dob =
          'For Group 2, DOB should be between 25-12-2012 and 24-12-2015';
        alert('For Group 2, DOB should be between 25-12-2012 and 24-12-2015');
      }
      if (
        formData.group === 'Group 3' &&
        (dob < parseDate('2008-12-25') || dob > parseDate('2012-12-24'))
      ) {
        newErrors.dob =
          'For Group 3, DOB should be between 25-12-2008 and 24-12-2012';
        alert('For Group 3, DOB should be between 25-12-2008 and 24-12-2012');
      }
      if (
        formData.group === 'General Category' &&
        (dob < parseDate('2006-12-25') || dob > parseDate('2010-12-24'))
      ) {
        newErrors.dob =
          'For General Category, DOB should be between 25-12-2006 and 24-12-2010';
        alert(
          'For General Category, DOB should be between 25-12-2006 and 24-12-2010',
        );
      }
    }
    if (!formData.gender) {
      newErrors.gender = 'Gender is mandatory';
      alert('Gender is mandatory');
    }
    if (!formData.district) {
      newErrors.district = 'District is mandatory';
      alert('District is mandatory');
    }
    if (!formData.samithiName) {
      newErrors.samithiName = 'Samithi is mandatory';
      alert('Samithi is mandatory');
    }
    if (!formData.yoj) {
      newErrors.yoj = 'Year of Joining is mandatory';
      alert('Year of Joining is mandatory');
    }
    if (formData.yoj.length !== 4) {
      newErrors.yoj = 'Invalid Year';
      alert('Invalid Year');
    }
    if (!formData.guru) {
      newErrors.guru = 'This field is mandatory';
      alert('Select whether Guru accompanying student');
    }
    if (new Date(formData.dob).getFullYear() > formData.yoj) {
      newErrors.yoj = 'Year of Joining must be greater than Date of Birth';
      alert('Year of Joining must be greater than Date of Birth');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForms()) {
      setSelectedGroup(formData.group);
      setGuru(formData.guru);
      nextStep();
    }
  };

  return (
    <div className="flex flex-col justify-center w-screen md:fit ml-auto mr-auto">
      <form onSubmit={handleSubmit}>
        <div className="rounded-2xl p-6 mt-8 mb-8 w-11/12 sm:w-8/12 mx-auto bg-gray-200 shadow-lg border border-gray-300 overflow-x-auto flex flex-col gap-4 md:gap-0">
          <div className="rounded-2xl p-6 mt-8 w-full sm:w-10/12 mx-auto bg-gray-100 shadow-lg border border-gray-300 overflow-x-auto flex flex-col gap-5 md:gap-0">
            <h2 className="text-xl text-black text-left">
              Which GROUP does the student belong to?
            </h2>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="group"
                  value="Group 1"
                  onChange={handleChange}
                  required
                  className="w-4 h-4 mt-2"
                />
                <span className="text-xl text-gray-700 mt-2">Group 1</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="group"
                  value="Group 2"
                  onChange={handleChange}
                  className="w-4 h-4"
                />
                <span className="text-xl text-gray-700">Group 2</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="group"
                  value="Group 3"
                  onChange={handleChange}
                  className="w-4 h-4"
                />
                <span className="text-xl text-gray-700">Group 3</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="group"
                  value="General Category"
                  onChange={handleChange}
                  className="w-4 h-4"
                />
                <span className="text-xl text-gray-700">General Category</span>
              </label>

              {errors.group && (
                <span className="text-red-500 text-sm">{errors.group}</span>
              )}
            </div>
          </div>

          <div className="rounded-2xl p-6 mt-8 w-full sm:w-10/12 mx-auto bg-gray-100 shadow-lg border border-gray-300 overflow-x-auto flex flex-col gap-5 md:gap-0">
            <h2 className="text-xl text-black text-left">
              Student&aposs Full Name
            </h2>
            <div className="flex flex-col gap-2">
              <input
                type="text"
                name="fullName"
                placeholder="Student's Full Name"
                value={formData.fullName.toUpperCase()}
                onChange={handleChange}
                required
                className="text-xl text-gray-700 border border-gray-500 p-4 mt-2 rounded-2xl w-full sm:w-auto"
              ></input>
              {errors.fullName && (
                <span className="text-red-500 text-sm">{errors.fullName}</span>
              )}
            </div>
          </div>

          <div className="rounded-2xl p-6 mt-8 w-full sm:w-10/12 mx-auto bg-gray-100 shadow-lg border border-gray-300 overflow-x-auto flex flex-col gap-5 md:gap-0">
            <h2 className="text-xl text-black text-left">
              Student&aposs Date of Birth (DOB)
            </h2>
            <div className="flex flex-col gap-2">
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                required
                className="text-xl text-gray-700 border border-gray-500 p-4 mt-2 rounded-2xl w-full sm:w-auto"
              ></input>
              {errors.dob && (
                <span className="text-red-500 text-sm">{errors.dob}</span>
              )}
            </div>
          </div>

          <div className="rounded-2xl p-6 mt-8 w-full sm:w-10/12 mx-auto bg-gray-100 shadow-lg border border-gray-300 overflow-x-auto flex flex-col gap-5 md:gap-0">
            <h2 className="text-xl text-black text-left">
              Student&aposs Gender
            </h2>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="gender"
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
                name="gender"
                value="Female"
                onChange={handleChange}
                className="w-4 h-4 mt-2"
              />
              <span className="text-xl text-gray-700 mt-2">Female</span>
            </label>
            {errors.gender && (
              <span className="text-red-500 text-sm">{errors.gender}</span>
            )}
          </div>

          <div className="rounded-2xl p-6 mt-8 w-full sm:w-10/12 mx-auto bg-gray-100 shadow-lg border border-gray-300 overflow-x-auto flex flex-col gap-5 md:gap-0">
            <h2 className="text-xl text-black text-left">
              Which district does the student belong to?
            </h2>
            <div className="flex flex-col gap-2">
              <select
                name="district"
                onChange={handleChange}
                value={formData.district}
                required
                className="text-xl text-gray-700 border border-gray-500 p-4 mt-2 rounded-2xl w-full sm:w-auto"
              >
                <option
                  value=""
                  disabled
                >
                  Select a district
                </option>
                <option value="Chennai East Coast">Chennai East Coast</option>
                <option value="Chennai North">Chennai North</option>
                <option value="Chennai North West">Chennai North West</option>
                <option value="Chennai South">Chennai South</option>
                <option value="Chennai South East">Chennai South East</option>
                <option value="Chennai West">Chennai West</option>
                <option value="Coimbatore">Coimbatore</option>
                <option value="Cuddalore">Cuddalore</option>
                <option value="Dharmapuri / Krishnagiri">
                  Dharmapuri / Krishnagiri
                </option>
                <option value="Dindigul">Dindigul</option>
                <option value="Erode">Erode</option>
                <option value="Kanchipuram North">Kanchipuram North</option>
                <option value="Kanchipuram South">Kanchipuram South</option>
                <option value="Kanyakumari">Kanyakumari</option>
                <option value="Karur">Karur</option>
                <option value="Madurai">Madurai</option>
                <option value="Mayiladuthurai">Mayiladuthurai</option>
                <option value="Nagapattinam">Nagapattinam</option>
                <option value="Namakkal">Namakkal</option>
                <option value="Nilgiris">Nilgiris</option>
                <option value="Puducherry">Puducherry</option>
                <option value="Salem">Salem</option>
                <option value="Sivaganga & Ramnad">Sivaganga & Ramnad</option>
                <option value="Thanjavur">Thanjavur</option>
                <option value="Theni">Theni</option>
                <option value="Tirunelveli">Tirunelveli</option>
                <option value="Tirupur">Tirupur</option>
                <option value="Tiruvallur East">Tiruvallur East</option>
                <option value="Tiruvallur West">Tiruvallur West</option>
                <option value="Tiruvannamalai">Tiruvannamalai</option>
                <option value="Trichy">Trichy</option>
                <option value="Tuticorin">Tuticorin</option>
                <option value="Vellore">Vellore</option>
                <option value="Villupuram">Villupuram</option>
                <option value="Virudhunagar">Virudhunagar</option>
              </select>
              {errors.district && (
                <span className="text-red-500 text-sm">{errors.district}</span>
              )}
            </div>
          </div>

          <div className="rounded-2xl p-6 mt-8 w-full sm:w-10/12 mx-auto bg-gray-100 shadow-lg border border-gray-300 overflow-x-auto flex flex-col gap-5 md:gap-0">
            <h2 className="text-xl text-black text-left">Name of Samithi</h2>
            <div className="flex flex-col gap-2">
              <input
                type="text"
                name="samithiName"
                onChange={handleChange}
                placeholder="Name of Samithi"
                required
                className="text-xl text-gray-700 border border-gray-500 p-4 mt-2 rounded-2xl w-full sm:w-auto"
              ></input>
              {errors.samithiName && (
                <span className="text-red-500 text-sm">
                  {errors.samithiName}
                </span>
              )}
            </div>
          </div>

          <div className="rounded-2xl p-6 mt-8 w-full sm:w-10/12 mx-auto bg-gray-100 shadow-lg border border-gray-300 overflow-x-auto flex flex-col gap-5 md:gap-0">
            <h2 className="text-xl text-black text-left">
              Student&aposs Year of Joining Balvikas
            </h2>
            <div className="flex flex-col gap-2">
              <input
                type="number"
                name="yoj"
                onChange={handleChange}
                placeholder="YOJ (2024,2023,etc,..)"
                required
                className="text-xl text-gray-700 border border-gray-500 p-4 mt-2 rounded-2xl w-full sm:w-auto"
              ></input>
              {errors.yoj && (
                <span className="text-red-500 text-sm">{errors.yoj}</span>
              )}
            </div>
          </div>

          <div className="rounded-2xl p-6 mt-8 w-full sm:w-10/12 mx-auto bg-gray-100 shadow-lg border border-gray-300 overflow-x-auto flex flex-col gap-5 md:gap-0">
            <h2 className="text-xl text-black text-left">
              Is the Guru accompanying the student?
            </h2>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="guru"
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
                  name="guru"
                  value="No"
                  onChange={handleChange}
                  className="w-4 h-4"
                />
                <span className="text-xl text-gray-700">No</span>
              </label>
            </div>
          </div>

          <div className="rounded-2xl p-6 mt-8 w-full sm:w-10/12 mx-auto bg-gray-100 shadow-lg border border-gray-300 overflow-x-auto flex flex-col gap-5 md:gap-0">
            <h2 className="text-xl text-black text-left">
              Student&aposs Date of Joining Balvikas (Optional)
            </h2>
            <div className="flex flex-col gap-2">
              <input
                type="date"
                name="doj"
                onChange={handleChange}
                className="text-xl text-gray-700 border border-gray-500 p-4 mt-2 rounded-2xl w-full sm:w-auto"
              ></input>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <button
              type="submit"
              className="text-2xl font-bold mt-12 mb-7"
            >
              <span className="bg-gray-100 p-4 rounded-2xl hover:bg-black hover:text-white hover:border-blue border border-black transition">
                Next
              </span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
