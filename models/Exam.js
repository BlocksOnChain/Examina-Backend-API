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
	questions: [
		{
			questionText: {
				type: String,
				required: true,
				trim: true,
			},
			options: [
				{
					optionText: {
						type: String,
						required: true,
						trim: true,
					},
					isCorrect: {
						type: Boolean,
						required: true,
					},
				},
			],
		},
	],
});

module.exports = mongoose.model("Exam", ExamSchema);
