const admin = require("firebase-admin");
const functions = require("firebase-functions");
const express = require("express");
const app = express();

admin.initializeApp();

app.get("/:id", async (req, res) => {
  const id = req.params.id;
  const legoPartWithId = await getLegoPartById(id);
  res.status(200).json(legoPartWithId);
});

app.get("/", async (req, res) => {
  const allLegoParts = [];
  let legoPartWithId = {};
  const snapShot = await admin.firestore().collection("lego_parts").get();
  snapShot.forEach((doc) => {
    legoPartWithId = doc.data();
    legoPartWithId.id = doc.id;
    allLegoParts.push(legoPartWithId);
  });
  res.status(200).json(allLegoParts);
});

app.post("/", async (req, res) => {
  const writeResult = await admin
      .firestore()
      .collection("lego_parts")
      .add(req.body);
  const legoPartWithId = await getLegoPartById(writeResult.id);
  res.status(200).json(legoPartWithId);
});

app.put("/:id", async (req, res) => {
  const id = req.params.id;
  const body = req.body;
  await admin.firestore().collection("lego_parts").doc(id).set(body);
  const legoPartWithId = await getLegoPartById(id);
  res.status(200).json(legoPartWithId);
});

app.delete("/:id", async (req, res) => {
  const id = req.params.id;
  const legoPartToDelete = await getLegoPartById(id);
  if (legoPartToDelete == null) {
    res.sendStatus(410);
  } else {
    await admin.firestore().collection("lego_parts").doc(id).delete();
    res.status(200).json({id: legoPartToDelete.id});
  }
});

/** This function gets a lego part by firestore id
 * @param {string} id, firestore automatic id.
 */
async function getLegoPartById(id) {
  const legoPartRef = await admin.firestore().collection("lego_parts").doc(id);
  const legoPart = await legoPartRef.get();
  let legoPartWithId = {};
  if (legoPart.data() === undefined) {
    return null;
  } else {
    legoPartWithId = legoPart.data();
    legoPartWithId.id = legoPart.id;
    return legoPartWithId;
  }
}

exports.lego_parts = functions.https.onRequest(app);
