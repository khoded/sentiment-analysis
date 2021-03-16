import * as request from "request-promise";
import {db} from "../config/firebase";

const batch = db.batch();

type Payload = {
    url: string
}
const jsonToFirestore = async (urlPath: Payload ): Promise<any> => {
  try {
    const importData = await request(urlPath.url);
    // eslint-disable-next-line max-len
    const dataSets = JSON.parse(importData);
    for (let index = 0; index < dataSets.length; index++) {
      const twitterData = db.collection("dataSets").doc();
      const data = dataSets[index];
      const twitterDataObject = {
        source: data.source,
        tweet: data.tweet,
        analysed: false,
      };
      batch.set(twitterData, twitterDataObject);
    }
    await batch.commit();
    return ({
      status: "success",
      message: "External Data  import successfull",
      data: dataSets,
    });
  } catch (error) {
    return ({
      status: "success",
      message: "External Data  import Error",
      data: error.message,
    });
  }
};

export {jsonToFirestore};
