import { cert, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

const serviceAccount = JSON.parse(
  readFileSync('serviceAccountKey.json', 'utf-8'),
);
const admin = initializeApp({
  credential: cert(serviceAccount),
});

const auth = getAuth();
const db = getFirestore();

console.log('[INFO]: Firebase initialized.');
const judgeEmailToId = {};

const createUsers = async () => {
  const adminData = JSON.parse(readFileSync('scripts/adminData.json', 'utf-8'));

  // Create admin.
  const adminUser = await auth.createUser({
    email: adminData.email,
    password: 'password',
    displayName: adminData.name,
    emailVerified: false,
  });

  await db.collection('userData').doc(adminUser.uid).set({
    id: adminUser.uid,
    email: adminData.email,
    role: adminData.role,
    name: adminData.name,
    createdAt: new Date(),
  });

  // Create judges.

  const judgeData = JSON.parse(readFileSync('scripts/judgeData.json', 'utf-8'));

  for (const judge of judgeData) {
    const judgeUser = await auth.createUser({
      email: judge.email,
      password: judge.email.split('@')[0],
      displayName: judge.name,
      emailVerified: false,
    });

    judgeEmailToId[judge.email] = judgeUser.uid;
    await db.collection('userData').doc(judgeUser.uid).set({
      id: judgeUser.uid,
      email: judge.email,
      role: judge.role,
      name: judge.name,
      event: judge.event,
      createdAt: new Date(),
    });
  }

  // console.log(judgeEmailToId)
};

const initEventData = async () => {
  const eventData = JSON.parse(readFileSync('scripts/eventData.json', 'utf-8'));

  for (const event of eventData) {
    event['judgeIdList'] = event.judgeEmailList.map(
      (email) => judgeEmailToId[email],
    );
    await db.collection('eventData').doc(event.name).set(event);
  }
};

const initRegData = async () => {
  const regData = JSON.parse(readFileSync('scripts/regData.json', 'utf-8'));
  for (const reg of regData) {
    await db.collection('regData').doc(reg.studentId).set(reg);
  }
};

createUsers()
  .then(() => {
    initEventData();
    initRegData();
  })
  .catch((error) => {
    console.log('[ERROR]: Error initializing Firestore:', error);
  });
