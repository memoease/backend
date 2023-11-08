import { Schema, model } from "mongoose";

const LearnSessionSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    toLearn: [{
        type: Schema.Types.ObjectId,
        ref: "Flashcard"
    }],
    isLearned: [{
        type: Schema.Types.ObjectId,
        ref: "Flashcard"
    }],
});

const LearnSession = model("Learnsession", LearnSessionSchema);
export default LearnSession;