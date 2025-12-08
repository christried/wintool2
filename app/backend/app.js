import fs from 'node:fs/promises';

import bodyParser from 'body-parser';
import express from 'express';

const app = express();

app.use(express.static('images'));
app.use(bodyParser.json());

// CORS

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // allow all domains
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  next();
});

app.get('/challenges/:sessionId', async (req, res) => {
  const sessionId = req.params.sessionId;

  try {
    const fileContent = await fs.readFile('./data/' + sessionId + '/challenges.json');

    const challengesData = JSON.parse(fileContent);

    res.status(200).json({ challenges: challengesData || [] });
  } catch (error) {
    console.log("Beim Fetchen lief was schief - vermutlich gibt's den Path nicht");
    console.error(error);
  }
});

app.put('/add-game', async (req, res) => {
  const challenge = req.body.challenge;
  const sessionId = req.body.sessionId;
  console.log('PUT kriegt folgende Daten als challenge');
  console.log(challenge);

  const challengesFileContent = await fs.readFile('./data/' + sessionId + '/challenges.json');
  const challengesData = JSON.parse(challengesFileContent);

  let updatedChallenges = challengesData;

  if (!challengesData.some((c) => c.id === challenge.id)) {
    updatedChallenges = [...challengesData, challenge];
  } else {
    const challIndex = updatedChallenges.findIndex((c) => c.id === challenge.id);
    updatedChallenges[challIndex] = challenge;
  }

  await fs.writeFile('./data/' + sessionId + '/challenges.json', JSON.stringify(updatedChallenges));

  res.status(200).json({ challenges: updatedChallenges });
});

app.get('/header/:sessionId', async (req, res) => {
  const sessionId = req.params.sessionId;

  if (sessionId === 'initial' || !sessionId) {
    return res.status(200).json({ timer: 0, timeStamp: null });
  }

  try {
    const fileContent = await fs.readFile('./data/' + sessionId + '/header-timer.json');
    const timerData = JSON.parse(fileContent);
    res.status(200).json(timerData);
  } catch (error) {
    // If file doesn't exist (new session), return 0 instead of crashing
    console.log(`No timer found for ${sessionId}, defaulting to 0.`);
    res.status(200).json({ timer: 0, timeStamp: null });
  }
});

app.put('/header-timer', async (req, res) => {
  const seconds = req.body.seconds;
  const timeStamp = req.body.timeStamp;
  const sessionId = req.body.sessionId;

  console.log(`PUT header-timer for session: ${sessionId}`);

  // Only save if we have a valid session (not 'initial')
  if (sessionId && sessionId !== 'initial') {
    const updatedTimer = { timer: seconds, timeStamp: timeStamp };

    try {
      await fs.writeFile(
        './data/' + sessionId + '/header-timer.json',
        JSON.stringify(updatedTimer)
      );
      res.status(200).json({ headerTimer: updatedTimer });
    } catch (error) {
      console.error('Error saving timer:', error);
      res.status(500).json({ message: 'Could not save timer' });
    }
  } else {
    res.status(200).json({ message: 'Initial session - timer not saved.' });
  }
});

app.get('/sessions', async (req, res) => {
  try {
    const fileContent = await fs.readFile('./data/sessions.json', 'utf-8');
    const sessionsData = JSON.parse(fileContent);

    res.status(200).json({ sessions: sessionsData });
  } catch (error) {
    console.log('No sessions file found, returning empty array.');
    res.status(200).json({ sessions: [] });
  }
});

app.post('/sessions', async (req, res) => {
  const newSessionId = req.body.sessionId;

  console.log(`POST session ID: ${newSessionId}`);

  if (!newSessionId) {
    return res.status(400).json({ message: 'Session ID missing' });
  }

  try {
    let sessionsData = [];

    try {
      const sessionsFileContent = await fs.readFile('./data/sessions.json', 'utf-8');
      sessionsData = JSON.parse(sessionsFileContent);
    } catch (readError) {
      console.log('Sessions file does not exist yet, creating a new one.');
    }

    let updatedSessions = sessionsData;

    if (!sessionsData.includes(newSessionId)) {
      updatedSessions = [...sessionsData, newSessionId];

      try {
        await fs.mkdir('./data/' + newSessionId, { recursive: true });
        await fs.writeFile('./data/' + newSessionId + '/challenges.json', '[]');
        await fs.writeFile(
          './data/' + newSessionId + '/header-timer.json',
          JSON.stringify({ timer: 0, timeStamp: null })
        );
      } catch (dirError) {
        console.error('Error creating session directory:', dirError);
      }
    }

    await fs.writeFile('./data/sessions.json', JSON.stringify(updatedSessions));

    res.status(200).json({ sessions: updatedSessions });
  } catch (error) {
    console.error('Server Crash prevented:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.delete('/delete-game/:sessionId/:id', async (req, res) => {
  const challengeId = req.params.id;
  const sessionId = req.params.sessionId;
  console.log('DELETE kriegt folgende Daten als challengeId');
  console.log(challengeId);

  const challengesFileContent = await fs.readFile('./data/' + sessionId + '/challenges.json');
  const challengesData = JSON.parse(challengesFileContent);

  const challengeIndex = challengesData.findIndex((chal) => chal.id === challengeId);

  let updatedChallenges = challengesData;

  if (challengeIndex >= 0) {
    updatedChallenges.splice(challengeIndex, 1);
  }

  await fs.writeFile('./data/' + sessionId + '/challenges.json', JSON.stringify(updatedChallenges));

  res.status(200).json({ challenges: updatedChallenges });
});

// 404
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    return next();
  }
  res.status(404).json({ message: '404 - Not Found' });
});

app.listen(3000);
