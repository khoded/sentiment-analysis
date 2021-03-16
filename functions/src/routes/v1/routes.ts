/* eslint-disable max-len */

import * as express from "express";
import {addTwitterData, getAllEntries, updateTwitterData, deleteTwitterData, importTwitterData, analyseData, analyzeText} from "../../controllers/twitterDataController";


// eslint-disable-next-line new-cap
const router = express.Router();

router.get("/", (req, res) => res.status(200).send("Hey there!"));
router.post("/analyze", analyzeText);
router.post("/datasets", addTwitterData);
router.post("/datasets/import", importTwitterData);
router.post("/datasets/semantic", analyseData);
router.get("/datasets", getAllEntries);
router.patch("/datasets/:twitterDataId", updateTwitterData);
router.delete("/datasets/:twitterDataId", deleteTwitterData);

export default router;


