/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable max-len */
import * as functions from "firebase-functions";
import {db} from "../config/firebase";
import * as sentiment from "ml-sentiment";

export const scheduledSentimentAnalysisCron = functions.pubsub.schedule("*/5 * * * *").onRun(async (context) =>{
  console.log("Running function at minute 0 past every hour.");
  try {
    const querySnapshot = await db.collection("dataSets").get();
    querySnapshot.forEach(async (doc: any) => {
      const docData = doc.data();
      const sentimentScore = sentiment.classify(docData.tweet);
      const currentDoc = db.collection("dataSets").doc(doc.id);
      let score;
      let value;
      const convertedScore = sentimentScore *1;
      if (convertedScore < 0 ) {
        score = "negative";
        value = score;
      } else if (convertedScore > 0) {
        score = "postive";
        value = score;
      } else {
        score = "neutral";
        value = score;
      }
      const twitterDataObject ={
        score: score,
        value: value,
      };
      await currentDoc.set(twitterDataObject);
      console.log("Running Cron function end .");
      return null;
    });
  } catch (error) {
    return error.message;
  }
});
