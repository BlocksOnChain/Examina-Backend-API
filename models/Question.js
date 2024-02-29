const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
    },
    options: [{
        text: {
            type: String,
            required: true,
        },
        isCorrect: {
            type: Boolean,
            required: true,
        },
    }],
}, autoCreate=  true);

module.exports = mongoose.model("Question", QuestionSchema);