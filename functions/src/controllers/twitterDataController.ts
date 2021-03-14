/* eslint-disable max-len */
import {Response} from "express";
import {db} from "../config/firebase";
import {jsonToFirestore} from "../services/importTwitterData";

type dataType = {
  source: string,
  tweet: string,
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
    res.status(500).json(error.message);
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

export {addTwitterData, getAllEntries, updateTwitterData, deleteTwitterData, importTwitterData};
