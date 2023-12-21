const mongoose = require("mongoose");

const ExamSchema = new mongoose.Schema({
	creator: {
		type: String,
		required: true,
	},
	title: {
		type: String,
		required: true,
		trim: true,
	},
	question1: {
		type: String,
		required: true,
		trim: true,
	},
	anwer1: {
		type: String,
		enum: ["a", "b", "c", "d"],
	},
	question2: {
		type: String,
		required: true,
		trim: true,
	},
	anwer2: {
		type: String,
		enum: ["a", "b", "c", "d"],
	},
});

module.exports = mongoose.model("Exam", ExamSchema);
