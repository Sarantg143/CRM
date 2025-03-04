const admin = require("firebase-admin");
const dotenv = require("dotenv");


dotenv.config();

if (!admin.apps.length) {
  let serviceAccount;
  if (process.env.FIREBASE_PROJECT_ID) {
    serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"), // Fix private key formatting
    };
  } else {
    serviceAccount = require("./keys/zions-788b3-firebase-adminsdk-sqciu-130eeba92b.json");
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_BUCKET_NAME || "zions-788b3.appspot.com",
  });
}

const db = admin.firestore();
const auth = admin.auth();
// const bucket = admin.storage().bucket();
const storageRef = admin.storage().bucket(process.env.FIREBASE_BUCKET_NAME || "zions-788b3.appspot.com");

module.exports = { db, auth, admin, storageRef };
