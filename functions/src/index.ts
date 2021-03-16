import * as functions from "firebase-functions";
import * as express from "express";
import routes from "./routes/v1/routes";
import * as cors from "cors";


const app = express();
app.use(cors());
app.use("/v1", routes);

export {scheduledSentimentAnalysisCron} from "./cron/cron";
exports.app = functions.https.onRequest(app);
