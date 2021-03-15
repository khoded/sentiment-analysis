import * as request from "request-promise";
import {db} from "../config/firebase";
import * as shortid from "shortid";

type Payload = {
    url: string
}
const jsonToFirestore = async (urlPath: Payload ): Promise<any> => {
  try {
    const twitterData = db.collection("dataSets");
    const importData = await request(urlPath.url);
    // eslint-disable-next-line max-len
    const dataSets = JSON.parse(importData);
    for (let index = 0; index < dataSets.length; index++) {
      const data = dataSets[index];
      const twitterDataObject = {
        id: shortid.generate(),
        source: data.source,
        tweet: data.tweet,
      };
      await twitterData.add(twitterDataObject);
    }
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
