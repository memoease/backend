import { Schema, model } from "mongoose";

const flashcardSetSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    flashcards: [{
        type: Schema.Types.ObjectId,
        ref: "Flashcard"
    }],
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    isPublic: {
        type: Boolean,
        default: false
    },
});

const FlashcardSet = model("FlashcardSet", flashcardSetSchema);

export default FlashcardSet;

export async function createNewSet(data) {
    const newSet = new FlashcardSet(data);
    const entry = await newSet.save();
    return entry;
};

export async function getSetsByUserId(userId) {
    const sets = await FlashcardSet.find({ createdBy: userId });
    return sets;
};

export async function getSetBySetId(setId) {
    const set = await FlashcardSet.findOne({ _id: setId }).populate("flashcards");
    return set;
};
export async function deleteCardFromSet(cardId) {
    const set = await FlashcardSet.findOneAndUpdate({ flashcards: cardId }, { $pull: { flashcards: cardId } }, { new: true });
    return set;
};

export async function getPublicSets() {
    const publicSets = await FlashcardSet.find({ isPublic: true });
    return publicSets;
};

export async function updateSetBySetId(setId, data) {
    const updatedSet = await FlashcardSet.findByIdAndUpdate(setId, data, { new: true });
    return updatedSet;
};

export async function findPublicSets() {
    const publicSets = await FlashcardSet.aggregate([
        { $match: { isPublic: true } },
        { $sample: { size: 6 } }
    ]);
    return publicSets;
};