/* eslint-disable max-len */
import {Response} from "express";
import {db} from "../config/firebase";
import {jsonToFirestore} from "../services/importTwitterData";
import * as nlp from "natural";
import * as sw from "stopword";

const {SentimentAnalyzer, PorterStemmer} = nlp;
const {WordTokenizer} = nlp;
const tokenizer = new WordTokenizer();
const analyzer = new SentimentAnalyzer("English", PorterStemmer, "afinn");

type dataType = {
  source: string,
  tweet: string,
  score: string,
  analysed: boolean,
}

type payload = {
    url: string
}

type Request = {
  body: dataType,
  params: { twitterDataId: string }
}

type importPayload = {
  body: payload
}

const importTwitterData = async (req: importPayload, res: Response): Promise<any> => {
  const payload = req.body;
  try {
    const jsonData = await jsonToFirestore(payload);
    res.status(200).json(jsonData);
  } catch (error) {
    res.status(500).json(error);
  }
};

const addTwitterData = async (req: Request, res: Response): Promise<any> => {
  const {source, tweet} = req.body;
  try {
    const twitterData = db.collection("dataSets").doc();
    const twitterDataObject = {
      id: twitterData.id,
      source,
      tweet,
      analysed: false,
    };

    twitterData.set(twitterDataObject);

    res.status(200).send({
      status: "success",
      message: "twitterData added successfully",
      data: twitterDataObject,
    });
  } catch (error) {
    res.status(500).json(error.message);
  }
};

const getAllEntries = async (req: Request, res: Response): Promise<any> => {
  try {
    const allEntries: dataType[] = [];
    const querySnapshot = await db.collection("dataSets").get();
    querySnapshot.forEach((doc: any) => allEntries.push(doc.data()));
    return res.status(200).json(allEntries);
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

const updateTwitterData = async (req: Request, res: Response): Promise<any> => {
  const {body: {tweet, source}, params: {twitterDataId}} = req;

  try {
    const twitterData = db.collection("dataSets").doc(twitterDataId);
    const currentData = (await twitterData.get()).data() || {};

    const twitterDataObject = {
      source: source || currentData.source,
      tweet: tweet || currentData.tweet,
    };

    await twitterData.set(twitterDataObject).catch((error: { message: unknown; }) => {
      return res.status(400).json({
        status: "error",
        message: error.message,
      });
    });

    return res.status(200).json({
      status: "success",
      message: "twitterData updated successfully",
      data: twitterDataObject,
    });
  } catch (error) {
    return res.status(500).json(error.message);
  }
};


const deleteTwitterData = async (req: Request, res: Response): Promise<any> => {
  const {twitterDataId} = req.params;

  try {
    const twitterData = db.collection("twitterData").doc(twitterDataId);

    await twitterData.delete().catch((error: { message: unknown; }) => {
      return res.status(400).json({
        status: "error",
        message: error.message,
      });
    });

    return res.status(200).json({
      status: "success",
      message: "twitterData deleted successfully",
    });
  } catch (error) {
    return res.status(500).json(error.message);
  }
};

const analyseData = async (req: Request, res: Response): Promise<any> => {
  const {source, tweet} = req.body;
  let score; let value;
  try {
    const tokenizedReview = tokenizer.tokenize(tweet);
    const filteredReview = sw.removeStopwords(tokenizedReview);
    const sentimentScore = analyzer.getSentiment(filteredReview);
    const convertedScore = sentimentScore *1;
    if (convertedScore < 0 ) {
      score = "negative";
      value = convertedScore;
    } else if (convertedScore > 0) {
      score = "positive";
      value = convertedScore;
    } else {
      score = "neutral";
      value = convertedScore;
    }
    const twitterData = db.collection("dataSets").doc();
    const twitterDataObject = {
      id: twitterData.id,
      source,
      tweet,
      score,
      value,
      analysed: true,
    };
    twitterData.set(twitterDataObject);

    res.status(200).send({
      status: "success",
      message: "twitterData added sentiment analysed successfully",
      data: twitterDataObject,
    });
  } catch (error) {
    res.status(500).json(error.message);
  }
};
export {addTwitterData, getAllEntries, updateTwitterData, deleteTwitterData, importTwitterData, analyseData};
