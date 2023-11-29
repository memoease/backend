import {
  getSetBySessionId,
  getSetBySetId,
} from "../model/flashcardSet.model.js";
import {
  createSession,
  getSessionById,
  initalizeSessionCards,
  moveCardToLearned,
} from "../model/learnSession.model.js";

export async function createLearnsession(req, res) {
  const { setId } = req.params;
  try {
    const set = await getSetBySetId(setId);
    if (set.session) {
      const session = await getSessionById(set.session._id);
      res.status(200).send(session);
    } else {
      const newSession = {
        user: set.createdBy,
        toLearn: set.flashcards,
      };
      const session = await createSession(newSession);
      set.session = session._id;
      const getSession = await getSessionById(session._id)
      await set.save();
      res.status(201).send(getSession);
    }
  } catch (error) {
    console.error(error);
    res.status(500).end();
  }
};

export async function updateSessionCard(req, res) {
  const { cardId } = req.params;
  try {
    const session = await moveCardToLearned(cardId);
    res.status(200).send(session);
  } catch (error) {
    console.error(error);
    res.status(500).end();
  }
};

export async function refreshSession(req, res) {
  const { sessionId } = req.params;
  try {
    console.log(sessionId);
    const originalSet = await getSetBySessionId(sessionId);
    console.log(originalSet);
    const updatedSession = await initalizeSessionCards(
      sessionId,
      originalSet.flashcards
    );
    res.status(200).send(updatedSession);
  } catch (error) {
    console.error(error);
    res.status(500).end();
  }
};
