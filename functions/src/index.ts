import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import express = require("express");
import cors = require("cors");

// 1. Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// 2. Setup Express
const app = express();
app.use(cors({ origin: true }));
app.use(express.json()); // Built-in JSON parser (replaces body-parser)

// --- ROUTES ---

// GET All Sessions
app.get("/sessions", async (req: express.Request, res: express.Response) => {
  try {
    const snapshot = await db.collection("sessions").get();
    const sessions = snapshot.docs.map((doc) => doc.id);
    res.status(200).json({ sessions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ sessions: [] });
  }
});

// POST Create New Session
app.post("/sessions", async (req: express.Request, res: express.Response) => {
  const sessionId = req.body.sessionId;
  if (!sessionId) {
    res.status(400).json({ message: "Session ID missing" });
    return;
  }

  try {
    const docRef = db.collection("sessions").doc(sessionId);
    const doc = await docRef.get();

    if (!doc.exists) {
      await docRef.set({
        challenges: [],
        headerTimer: { timer: 0, timeStamp: null },
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    const snapshot = await db.collection("sessions").get();
    const sessions = snapshot.docs.map((d) => d.id);
    res.status(200).json({ sessions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating session" });
  }
});

// DELETE Session
app.delete(
  "/sessions/:sessionId",
  async (req: express.Request, res: express.Response) => {
    const sessionId = req.params.sessionId;
    try {
      await db.collection("sessions").doc(sessionId).delete();

      const snapshot = await db.collection("sessions").get();
      const sessions = snapshot.docs.map((d) => d.id);
      res.status(200).json({ sessions });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Could not delete session" });
    }
  }
);

// GET Challenges
app.get(
  "/challenges/:sessionId",
  async (req: express.Request, res: express.Response) => {
    try {
      const doc = await db
        .collection("sessions")
        .doc(req.params.sessionId)
        .get();
      const data = doc.data();
      res.status(200).json({ challenges: data?.challenges || [] });
    } catch (error) {
      console.error(error);
      res.status(200).json({ challenges: [] });
    }
  }
);

// PUT Add/Update Game
app.put("/add-game", async (req: express.Request, res: express.Response) => {
  const { challenge, sessionId } = req.body;

  try {
    const docRef = db.collection("sessions").doc(sessionId);

    await db.runTransaction(async (t) => {
      const doc = await t.get(docRef);
      if (!doc.exists) throw new Error("Session does not exist");

      const data = doc.data();
      const challenges = data?.challenges || [];

      const existingIndex = challenges.findIndex(
        (c: any) => c.id === challenge.id
      );

      if (existingIndex > -1) {
        challenges[existingIndex] = challenge;
      } else {
        challenges.push(challenge);
      }

      t.update(docRef, { challenges });
    });

    const updatedDoc = await docRef.get();
    res.status(200).json({ challenges: updatedDoc.data()?.challenges || [] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error adding game" });
  }
});

// DELETE Game
app.delete(
  "/delete-game/:sessionId/:id",
  async (req: express.Request, res: express.Response) => {
    const { sessionId, id } = req.params;

    try {
      const docRef = db.collection("sessions").doc(sessionId);
      const doc = await docRef.get();

      if (!doc.exists) {
        res.status(404).json({ message: "Session not found" });
        return;
      }

      const data = doc.data();
      const challenges = data?.challenges || [];
      const updatedChallenges = challenges.filter((c: any) => c.id !== id);

      await docRef.update({ challenges: updatedChallenges });

      res.status(200).json({ challenges: updatedChallenges });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error deleting game" });
    }
  }
);

// GET Header Timer
app.get(
  "/header/:sessionId",
  async (req: express.Request, res: express.Response) => {
    const sessionId = req.params.sessionId;
    if (!sessionId || sessionId === "initial") {
      res.status(200).json({ timer: 0, timeStamp: null });
      return;
    }

    try {
      const doc = await db.collection("sessions").doc(sessionId).get();
      const data = doc.data();
      res.status(200).json(data?.headerTimer || { timer: 0, timeStamp: null });
    } catch (error) {
      res.status(200).json({ timer: 0, timeStamp: null });
    }
  }
);

// PUT Header Timer
app.put(
  "/header-timer",
  async (req: express.Request, res: express.Response) => {
    const { seconds, timeStamp, sessionId } = req.body;

    if (sessionId && sessionId !== "initial") {
      try {
        await db
          .collection("sessions")
          .doc(sessionId)
          .update({
            headerTimer: { timer: seconds, timeStamp: timeStamp },
          });
        res.status(200).json({ success: true });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Could not save timer" });
      }
    } else {
      res.status(200).json({ message: "Ignored" });
    }
  }
);

export const api = functions.https.onRequest(app);
