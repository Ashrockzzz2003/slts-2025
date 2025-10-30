import {
  collection,
  deleteField,
  doc,
  getDoc,
  getDocs,
  query,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { auth, db } from '@/app/_util/initApp';

export const getUserData = async () => {
  if (!auth.currentUser) {
    return null;
  }

  const userDataDocRef = doc(db, 'userData', auth.currentUser.uid);
  const docSnap = await getDoc(userDataDocRef);
  if (docSnap.exists()) {
    return docSnap.data();
  } else {
    return null;
  }
};

export const getRegistrationData = async () => {
  // if (!auth.currentUser) {
  //     return null;
  // }

  const registrationDataCollectionRef = collection(db, 'regData');
  const querySnapshot = await getDocs(registrationDataCollectionRef);
  const data = [];
  querySnapshot.forEach((doc) => {
    data.push(doc.data());
  });

  data.forEach((row) => {
    for (const key in row) {
      if (typeof row[key] === 'number' && Number.isNaN(row[key])) {
        row[key] = null;
      }
    }
  });

  data.sort((a, b) => {
    if (a.district < b.district) {
      return -1;
    }
    if (a.district > b.district) {
      return 1;
    }
    return 0;
  });

  // Collect unique district names, event names, group names.
  const districtSet = new Set();
  const eventNameSet = new Set();
  const groupNameSet = new Set();
  const modeOfTravelSet = new Set();
  const modeOfTravelForDropSet = new Set();
  const checkInDateSet = new Set();
  const checkOutDateSet = new Set();

  data.forEach((row) => {
    districtSet.add(row.district);
    row.registeredEvents.forEach((event) => {
      eventNameSet.add(event);
    });
    groupNameSet.add(row.studentGroup);

    if (row.modeOfTravel !== '' && row.modeOfTravel != null) {
      modeOfTravelSet.add(row.modeOfTravel);
    }

    if (row.modeOfTravelForDrop !== '' && row.modeOfTravelForDrop != null) {
      modeOfTravelForDropSet.add(row.modeOfTravelForDrop);
    }

    if (row.checkInDate !== '' && row.checkInDate != null) {
      checkInDateSet.add(row.checkInDate);
    }

    if (row.checkOutDate !== '' && row.checkOutDate != null) {
      checkOutDateSet.add(row.checkOutDate);
    }
  });

  const checkInDate = Array.from(checkInDateSet).sort(
    (a, b) => new Date(a) - new Date(b),
  );
  const checkOutDate = Array.from(checkOutDateSet).sort(
    (a, b) => new Date(a) - new Date(b),
  );

  return [
    data,
    Array.from(districtSet),
    Array.from(eventNameSet),
    Array.from(groupNameSet),
    Array.from(modeOfTravelSet),
    Array.from(modeOfTravelForDropSet),
    checkInDate,
    checkOutDate,
  ];
};

export const getDistrictData = async (district) => {
  // if (!auth.currentUser) {
  //     return null;
  // }

  const registrationDataCollectionRef = query(
    collection(db, 'regData'),
    where('district', '==', district),
  );
  const querySnapshot = await getDocs(registrationDataCollectionRef);
  const data = [];
  querySnapshot.forEach((doc) => {
    data.push(doc.data());
  });

  data.forEach((row) => {
    for (const key in row) {
      if (typeof row[key] === 'number' && Number.isNaN(row[key])) {
        row[key] = null;
      }
    }
  });

  // Collect unique district names, event names, group names.
  const districtSet = new Set();
  const eventNameSet = new Set();
  const groupNameSet = new Set();
  const modeOfTravelSet = new Set();
  const modeOfTravelForDropSet = new Set();
  const checkInDateSet = new Set();
  const checkOutDateSet = new Set();

  data.forEach((row) => {
    districtSet.add(row.district);
    row.registeredEvents.forEach((event) => {
      eventNameSet.add(event);
    });
    groupNameSet.add(row.studentGroup);

    if (row.modeOfTravel !== '' && row.modeOfTravel != null) {
      modeOfTravelSet.add(row.modeOfTravel);
    }

    if (row.modeOfTravelForDrop !== '' && row.modeOfTravelForDrop != null) {
      modeOfTravelForDropSet.add(row.modeOfTravelForDrop);
    }

    if (row.checkInDate !== '' && row.checkInDate != null) {
      checkInDateSet.add(row.checkInDate);
    }

    if (row.checkOutDate !== '' && row.checkOutDate != null) {
      checkOutDateSet.add(row.checkOutDate);
    }
  });

  const checkInDate = Array.from(checkInDateSet).sort(
    (a, b) => new Date(a) - new Date(b),
  );
  const checkOutDate = Array.from(checkOutDateSet).sort(
    (a, b) => new Date(a) - new Date(b),
  );

  return [
    data,
    Array.from(districtSet),
    Array.from(eventNameSet),
    Array.from(groupNameSet),
    Array.from(modeOfTravelSet),
    Array.from(modeOfTravelForDropSet),
    checkInDate,
    checkOutDate,
  ];
};

export const getEventData = async (_eventName) => {
  // if (!auth.currentUser) {
  //     return null;
  // }

  const eventDataCollectionRef = collection(db, 'eventData');
  const querySnapshot = await getDocs(eventDataCollectionRef);
  const data = [];

  querySnapshot.forEach((doc) => {
    data.push(doc.data());
  });

  // Collect Unique Group Names
  const groupNameSet = new Set();
  data.forEach((row) => {
    row.group.forEach((group) => {
      groupNameSet.add(group);
    });
  });

  return [data, Array.from(groupNameSet)];
};

export const updateCrieria = async (eventName, criteria) => {
  // if (!auth.currentUser) {
  //     return null;
  // }

  // typecast all values to float.
  Object.keys(criteria).forEach((key) => {
    criteria[key] = parseFloat(criteria[key]);
  });

  await updateDoc(doc(db, 'eventData', eventName), {
    evalCriteria: criteria,
  });

  return true;
};

export const getJudgeGroupEventData = async (eventName) => {
  // if (!auth.currentUser) {
  //     return null;
  // }

  const eventDoc = await getDoc(doc(db, 'eventData', eventName));
  const eventMetaData = eventDoc.data();

  const participantRef = query(
    collection(db, 'regData'),
    where('registeredEvents', 'array-contains', eventMetaData.name),
  );
  const participantSnapshot = await getDocs(participantRef);

  const participants = [];
  participantSnapshot.forEach((doc) => {
    participants.push(doc.data());
  });

  participants.forEach((row) => {
    for (const key in row) {
      if (typeof row[key] === 'number' && Number.isNaN(row[key])) {
        row[key] = null;
      }
    }
  });

  const districtData = {};
  participants.forEach((row) => {
    if (!districtData[row.district]) {
      districtData[row.district] = [];
    }
    districtData[row.district].push(row);
  });

  return [districtData, eventMetaData];
};

export const getJudgeEventData = async (eventName) => {
  // if (!auth.currentUser) {
  //     return null;
  // }

  const eventDoc = await getDoc(doc(db, 'eventData', eventName));
  const eventMetaData = eventDoc.data();

  const participantRef = query(
    collection(db, 'regData'),
    where('registeredEvents', 'array-contains', eventMetaData.name),
  );
  const participantSnapshot = await getDocs(participantRef);

  const participants = [];
  participantSnapshot.forEach((doc) => {
    participants.push(doc.data());
  });

  participants.forEach((row) => {
    for (const key in row) {
      if (typeof row[key] === 'number' && Number.isNaN(row[key])) {
        row[key] = null;
      }
    }
  });

  participants.sort((a, b) => {
    if (a.district < b.district) {
      return -1;
    }
    if (a.district > b.district) {
      return 1;
    }
    return 0;
  });

  return [participants, eventMetaData];
};

export const markScore = async (
  studentId,
  eventName,
  judgeId,
  score,
  comment,
) => {
  // update score dict vals to float.
  Object.keys(score).forEach((key) => {
    score[key] = parseFloat(score[key]);
  });

  await updateDoc(doc(db, 'regData', studentId), {
    [`score.${eventName}.${judgeId}`]: score,
    [`comment.${eventName}.${judgeId}`]:
      comment === '' ? '-' : (comment ?? '-'),
  });
  return true;
};

export const markGroupScore = async (
  studentIds,
  eventName,
  judgeId,
  score,
  comment,
) => {
  Object.keys(score).forEach((key) => {
    if (typeof score[key] !== 'number') {
      score[key] = parseFloat(score[key]);
    }
  });

  for (const studentId of studentIds) {
    await updateDoc(doc(db, 'regData', studentId), {
      [`score.${eventName}.${judgeId}`]: score,
      [`comment.${eventName}.${judgeId}`]:
        comment === '' ? '-' : (comment ?? '-'),
    });

    // console.log(`Updated student: ${studentId}`);
  }

  return true;
};

export const submitCorrectionRequest = async (
  studentId,
  type,
  correctionMessage,
  correctedByName,
  correctedByPhoneNumber,
) => {
  await updateDoc(doc(db, 'regData', studentId), {
    [`correctionRequest.${type}`]: {
      correctionMessage: correctionMessage,
      correctedByName: correctedByName,
      correctedByPhoneNumber: correctedByPhoneNumber,
      correctionStatus: 'pending',
      timeStamp: Timestamp.now(),
    },
  });

  return true;
};

export const getStudentData = async (studentId) => {
  studentId = studentId.toString().toUpperCase().trim();
  const studentDoc = await getDoc(doc(db, 'regData', studentId));
  if (!studentDoc.exists()) {
    return null;
  }
  return studentDoc.data();
};

export const substituteEvent = async (
  eventName,
  oldStudentId,
  newStudentId,
  name,
  group,
  gender,
  dob,
  reason,
  judgeId,
) => {
  try {
    const oldStudentDoc = await getDoc(doc(db, 'regData', oldStudentId));
    if (!oldStudentDoc.exists()) {
      return 'Old Student not found';
    }
    const oldStudentData = oldStudentDoc.data();

    if (oldStudentData.registeredEvents.indexOf(eventName) === -1) {
      return 'Old Student is not registered for this event';
    }

    if (newStudentId !== '') {
      const newStudentDoc = await getDoc(doc(db, 'regData', newStudentId));
      if (!newStudentDoc.exists()) {
        return 'New Student not found';
      }
      const newStudentData = newStudentDoc.data();

      if (newStudentData.registeredEvents.indexOf(eventName) !== -1) {
        return 'New Student is already registered for this event';
      }

      if (newStudentData.district !== oldStudentData.district) {
        return 'District of Old and New Student should be same';
      }

      await updateDoc(doc(db, 'regData', oldStudentId), {
        [`substitute.${eventName}`]: {
          newStudentId: newStudentData.studentId,
          newStudentData: newStudentData,
          newStudentName: newStudentData.studentFullName,
          newStudentGroup: newStudentData.studentGroup,
          newStudentGender: newStudentData.gender,
          newStudentDOB: newStudentData.dateOfBirth,
          substituteReason: reason,
          timeStamp: Timestamp.now(),
          updatedBy: judgeId,
        },
      });

      return '';
    } else {
      await updateDoc(doc(db, 'regData', oldStudentId), {
        [`substitute.${eventName}`]: {
          newStudentId: null,
          newStudentName: name,
          newStudentGroup: group,
          newStudentGender: gender,
          newStudentDOB: dob,
          substituteReason: reason,
          timeStamp: Timestamp.now(),
          updatedBy: judgeId,
        },
      });

      return '';
    }
  } catch (error) {
    console.error(error);
    return 'Some error occured';
  }
};

export const removeSubstitute = async (eventName, studentId) => {
  try {
    await updateDoc(doc(db, 'regData', studentId), {
      [`substitute.${eventName}`]: null,
    });

    return '';
  } catch (error) {
    console.error(error);
    return 'Some error occured';
  }
};

export const markEntry = async (studentId) => {
  await updateDoc(doc(db, 'regData', studentId), {
    entryMarked: true,
    entryTimeStamp: Timestamp.now(),
  });
  return true;
};

export const unmarkEntry = async (studentId) => {
  await updateDoc(doc(db, 'regData', studentId), {
    entryMarked: false,
    entryTimeStamp: deleteField(),
  });
  return true;
};

export const submitComment = async (studentId, comment) => {
  await updateDoc(doc(db, 'regData', studentId), {
    entryComment: comment,
    entryCommentTimeStamp: Timestamp.now(),
  });
  return true;
};

export const removeComment = async (studentId) => {
  await updateDoc(doc(db, 'regData', studentId), {
    entryComment: deleteField(),
    entryCommentTimeStamp: deleteField(),
  });
  return true;
};

export const getLiveData = async () => {
  const registrationDataCollectionRef = query(
    collection(db, 'regData'),
    where('entryMarked', '==', true),
  );
  const querySnapshot = await getDocs(registrationDataCollectionRef);
  const data_1 = [];
  querySnapshot.forEach((doc) => {
    data_1.push(doc.data());
  });

  const dataTwoRef = query(
    collection(db, 'regData'),
    where('entryComment', '!=', ''),
  );
  const querySnapshotTwo = await getDocs(dataTwoRef);
  const dataTwo = [];
  querySnapshotTwo.forEach((doc) => {
    dataTwo.push(doc.data());
  });
  const data = [];
  const seen = {};
  data_1.forEach((row) => {
    seen[row.studentId] = true;
    data.push(row);
  });
  dataTwo.forEach((row) => {
    if (!seen[row.studentId]) {
      data.push(row);
    }
  });

  if (data.length === 0) {
    return [[], [], [], [], [], [], [], []];
  }

  data.forEach((row) => {
    for (const key in row) {
      if (typeof row[key] === 'number' && Number.isNaN(row[key])) {
        row[key] = null;
      }
    }
  });

  data.sort((a, b) => {
    if (a.district < b.district) {
      return -1;
    }
    if (a.district > b.district) {
      return 1;
    }
    return 0;
  });

  // Collect unique district names, event names, group names.
  const districtSet = new Set();
  const eventNameSet = new Set();
  const groupNameSet = new Set();
  const modeOfTravelSet = new Set();
  const modeOfTravelForDropSet = new Set();
  const checkInDateSet = new Set();
  const checkOutDateSet = new Set();

  data.forEach((row) => {
    districtSet.add(row.district);
    row.registeredEvents.forEach((event) => {
      eventNameSet.add(event);
    });
    groupNameSet.add(row.studentGroup);

    if (row.modeOfTravel !== '' && row.modeOfTravel != null) {
      modeOfTravelSet.add(row.modeOfTravel);
    }

    if (row.modeOfTravelForDrop !== '' && row.modeOfTravelForDrop != null) {
      modeOfTravelForDropSet.add(row.modeOfTravelForDrop);
    }

    if (row.checkInDate !== '' && row.checkInDate != null) {
      checkInDateSet.add(row.checkInDate);
    }

    if (row.checkOutDate !== '' && row.checkOutDate != null) {
      checkOutDateSet.add(row.checkOutDate);
    }
  });

  const checkInDate = Array.from(checkInDateSet).sort(
    (a, b) => new Date(a) - new Date(b),
  );
  const checkOutDate = Array.from(checkOutDateSet).sort(
    (a, b) => new Date(a) - new Date(b),
  );

  return [
    data,
    Array.from(districtSet),
    Array.from(eventNameSet),
    Array.from(groupNameSet),
    Array.from(modeOfTravelSet),
    Array.from(modeOfTravelForDropSet),
    checkInDate,
    checkOutDate,
  ];
};
