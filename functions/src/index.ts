import * as functions from "firebase-functions";

import * as admin from "firebase-admin";
admin.initializeApp();

export const helloWorld = functions.region("asia-northeast1")
    .https.onRequest(
        async (request, response) => {
          const original = request.query.text;
          const writeResult = await admin
              .firestore().collection("messages")
              .add({original: original});
          functions.logger.info("Hello logs!", {structuredData: true});
          response.json({
            result: `Message with ID: ${writeResult.id} added!`,
          });
        });
