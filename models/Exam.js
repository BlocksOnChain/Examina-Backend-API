const mongoose = require("mongoose");
const QuestionSchema = require("./Question").schema;


const ExamSchema = new mongoose.Schema({
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
	questions: [QuestionSchema],
	rootHash: {
		type: String,
		required: true,
	},
	contract_address: {
		type: String,
		required: true,
	},
});

module.exports = mongoose.model("Exam", ExamSchema);
