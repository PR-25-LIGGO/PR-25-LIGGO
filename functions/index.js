/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

const db = admin.firestore();

exports.deleteExpiredEvents = functions.pubsub.schedule('every 1 hours').onRun(async (context) => {
  const now = new Date();
  const expirationThreshold = new Date(now.getTime() - 5 * 60 * 60 * 1000); // ahora - 5 horas

  const snapshot = await db.collection("events").get();

  const batch = db.batch();
  let deleteCount = 0;

  snapshot.forEach(doc => {
    const data = doc.data();

    // Ajusta el parseo según cómo guardes la fecha/hora en Firestore
    // Ejemplo para ISO strings:
    if (!data.dateTime) return; // salta si no tiene campo combinado

    const eventDateTime = data.dateTime.toDate ? data.dateTime.toDate() : new Date(data.dateTime);

    if (eventDateTime.getTime() + 5 * 60 * 60 * 1000 < now.getTime()) {
      batch.delete(doc.ref);
      deleteCount++;
    }
  });

  await batch.commit();
  console.log(`Eliminados ${deleteCount} eventos expirados.`);
  return null;
});
