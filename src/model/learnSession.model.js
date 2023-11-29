import { Schema, model } from "mongoose";

const LearnSessionSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    toLearn: [
        {
            type: Schema.Types.ObjectId,
            ref: "Flashcard",
        },
    ],
    isLearned: [
        {
            type: Schema.Types.ObjectId,
            ref: "Flashcard",
        },
    ],
});

const LearnSession = model("Learnsession", LearnSessionSchema);
export default LearnSession;

export async function createSession(data) {
    const newSession = new LearnSession(data);
    const entry = await newSession.save();
    return entry;
}

export async function getSessionById(sessionId) {
    const session = await LearnSession.findById(sessionId).populate("toLearn");
    return session;
};

export async function moveCardToLearned(cardId) {
    const session = await LearnSession.findOneAndUpdate(
        { toLearn: cardId },
        { $pull: { toLearn: cardId } }, { new: true, populate: { path: "toLearn" } }
    );
    session.isLearned = session.isLearned.concat(cardId);
    const result = await session.save();
    return result;
};

export async function initalizeSessionCards(sessionId, cards) {
    const updatedSession = await LearnSession.findOneAndUpdate(
        { _id: sessionId },
        { $set: { toLearn: cards, isLearned: [] } },
        { new: true, populate: { path: "toLearn" } }
    );
    return updatedSession;
};

export async function deleteSessionsByUserId(userId) {
    const response = await LearnSession.deleteMany({ user: userId });
    return response;
};
