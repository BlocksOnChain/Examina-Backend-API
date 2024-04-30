const mongoose = require('mongoose');

const FormAnswerSchema = new mongoose.Schema({
    form: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Form',
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    answers: [{
        question: {
            type: String,
            required: true,
        },
        answer: {
            type: String,
            required: true,
        },
    }],
}, autoCreate = true);