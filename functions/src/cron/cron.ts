/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable max-len */
import * as functions from "firebase-functions";
import {db} from "../config/firebase";
import * as nlp from "natural";
import * as sw from "stopword";

const {SentimentAnalyzer, PorterStemmer} = nlp;
const {WordTokenizer} = nlp;
const tokenizer = new WordTokenizer();
const analyzer = new SentimentAnalyzer("English", PorterStemmer, "afinn");


export const scheduledSentimentAnalysisCron = functions.pubsub.schedule("every 5 minutes").onRun(async (context) =>{
  console.log("Running function at minute 0 past every hour.");
  try {
    const querySnapshot = await db.collection("dataSets").where("analysed", "==", false).get();
    querySnapshot.forEach(async (doc: any) => {
      const docData = doc.data();
      const tokenizedReview = tokenizer.tokenize(docData.tweet);
      const filteredReview = sw.removeStopwords(tokenizedReview);
      const sentimentScore = analyzer.getSentiment(filteredReview);
      const currentDoc = db.collection("dataSets").doc(doc.id);
      let score;
      let value;
      const convertedScore = sentimentScore *1;
      if (convertedScore < 0 ) {
        score = "negative";
        value = convertedScore;
      } else if (convertedScore > 0) {
        score = "postive";
        value = convertedScore;
      } else {
        score = "neutral";
        value = convertedScore;
      }
      const twitterDataObject ={
        score: score,
        value: value,
        analysed: true,
      };
      await currentDoc.set(twitterDataObject);
      console.log("Running Cron function end .");
      return null;
    });
  } catch (error) {
    return error.message;
  }
});
