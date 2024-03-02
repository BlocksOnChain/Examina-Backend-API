const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
    exam: {
        type: mongoose.Schema.Types.ObjectId,
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
    options: [{
        number: {
            type: Number,
            required: true,
        },
        text: {
            type: String,
            required: true,
        },
        isCorrect: {
            type: Boolean,
            required: true
        },
    }],
    
}, autoCreate = true);

module.exports = mongoose.model("Question", QuestionSchema);