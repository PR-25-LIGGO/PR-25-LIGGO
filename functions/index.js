const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

exports.cleanUpOldEvents = functions.pubsub.schedule("every 1 hours").onRun(async (context) => {
  const now = admin.firestore.Timestamp.now();
  const snapshot = await db.collection("events").get();

  const deletions = [];

  snapshot.forEach((doc) => {
    const data = doc.data();
    const eventDateTime = new Date(`${data.date} ${data.time}`);
    const eventEnd = new Date(eventDateTime.getTime() + 5 * 60 * 60 * 1000);

    if (now.toDate() > eventEnd) {
      deletions.push(doc.ref.delete());
    }
  });

  await Promise.all(deletions);
  console.log("Eventos expirados eliminados:", deletions.length);
  return null;
});
