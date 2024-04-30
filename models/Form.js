const mongoose = require("mongoose");

const FormSchema = new mongoose.Schema({
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: false,
    },
}, autoCreate = true);

module.exports = mongoose.model("Form", FormSchema);