const mongoose = require("mongoose");

const ScoreSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    exam: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Exam",
    },
    score: {
        type: Number,
        required: true,
    }
}, autoCreate = true);

module.exports = mongoose.model("Score", ScoreSchema);