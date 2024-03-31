import { Schema, model } from "mongoose";

const userAnswerSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    exam: {
        type: Schema.Types.ObjectId,
        ref: 'Exam',
        required: true,
    },
    answers: [{
        question: {
            type: Schema.Types.ObjectId,
            ref: 'Question',
            required: true,
        },
        selectedOption: {
            type: Number,
            required: true,
        },
        answerHash: {
            type: String,
            required: true,
        },    
    }],
}, autoCreate = true,
);

export default model("Answer", userAnswerSchema);