const mongoose = require("mongoose");

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
	rootHash: {
		type: String,
		required: true,
	},
	contract_address: {
		type: String,
		required: false,
	},
	secretKey: {
		type: String,
		required: true,
	},
}, autoCreate = true);

module.exports = mongoose.model("Exam", ExamSchema);
