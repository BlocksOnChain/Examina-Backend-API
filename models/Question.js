import { Schema, model } from "mongoose";

const QuestionSchema = new Schema({
    exam: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Exam",
    },
    number: {
        type: Number,
        required: true,
    },
    text: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: false
    },
    options: [{
        number: {
            type: Number,
            required: true,
        },
        text: {
            type: String,
            required: true,
        },
    }],
    correctAnswer: {
        type: Number,
        required: true,
    },
}, autoCreate = true);

export default model("Question", QuestionSchema);