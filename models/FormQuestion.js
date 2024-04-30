const mongoose = require('mongoose');

const FormQuestionSchema = new mongoose.Schema({
    form: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Form',
    },
    question: {
        type: String,
        required: true,
    },
    options: [{
        type: String,
        required: false,
    }],
}, autoCreate = true);

module.exports = mongoose.model('FormQuestion', FormQuestionSchema);