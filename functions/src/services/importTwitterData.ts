import {restore} from "firestore-export-import";
import * as request from "request-promise";

type Payload = {
    url: string
}
const jsonToFirestore = async (urlPath: Payload ): Promise<string | void> => {
  try {
    const backupData = await request(urlPath.url);
    await restore(backupData);
    return "upload successful";
  } catch (error) {
    console.log(error);
  }
};

export {jsonToFirestore};
