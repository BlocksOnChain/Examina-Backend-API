const mongoose = require("mongoose");

// const AnswerSchema = new mongoose.Schema({
// 	answerHash: {
// 		type: String,
// 		// required: true,
// 	},
// });

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
				},
			],
		},
	],
	userAnswers: [],
	rootHash: {
		type: String,
		required: true,
	},
});

module.exports = mongoose.model("Exam", ExamSchema);
// module.exports = mongoose.model("Answer", AnswerSchema);
