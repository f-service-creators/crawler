import * as functions from "firebase-functions";

import * as admin from "firebase-admin";
import Global = NodeJS.Global;
export interface GlobalWithCognitoFix extends Global {
  fetch: any
}
declare const global: GlobalWithCognitoFix;
global.fetch = require("node-fetch");
admin.initializeApp();

export const helloWorld = functions.region("asia-northeast1")
  .https.onRequest(
    async (request, response) => {
      const original = request.query.text;
      const writeResult = await admin
        .firestore().collection("messages")
        .add({ original: original });
      functions.logger.info("Hello logs!", { structuredData: true });
      response.json({
        result: `Message with ID: ${writeResult.id} added!`,
      });
    });

export const crawlByApi = functions.region("asia-northeast1")
  .https.onRequest(
    async (request, response) => {
      const keywords = request.query.keywords;

      let params: Record<string, string>;
      if (typeof keywords === "string") {
        params = { limit: "100", keywords: keywords };
      } else {
        params = { limit: "100" };
      }

      const query = new URLSearchParams(params);
      console.log("before fetch")
      try {
        const res = await fetch(`https://jirei-seido-api.mirasapo-plus.go.jp/supports?${query}`, {
          method: "GET",
          mode: "cors",
          headers: {
            "Content-Type": "application/json",
          },
        });
        console.log("after fetch")
        if (res.ok) {
          const resJson = await res.json();
          console.log(JSON.stringify(resJson));
          response.json(resJson)
        } else {
          throw new Error("Response is NG");
        }
      } catch (error) {
        functions.logger.error(error);
      }
    }
  );
