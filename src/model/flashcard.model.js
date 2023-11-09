import { Schema, model } from "mongoose";

const flashcardSchema = new Schema({
    question: {
        type: String,
        required: true
    },
    answer: {
        type: String,
        required: true
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
});

const Flashcard = model("Flashcard", flashcardSchema);

export default Flashcard;

export async function createNewCard(data) {
    const newCard = new Flashcard(data);
    const entry = await newCard.save();
    return entry;
};

export async function deleteCardByCardId(cardId) {
    const response = Flashcard.deleteOne({ _id: cardId });
    return response;
};

export async function deleteManyCardsById(array) {
    const response = Flashcard.deleteMany({ _id: { $in: array } });
    return response;
};