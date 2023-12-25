const express = require("express");
const Exam = require("../models/Exam");
const router = express.Router();
const { MerkleTree } = require("merkletreejs");
const crypto = require("crypto");

router.get("/create", (req, res) => {
	res.render("exams/create");
});

const sampleExamData = {
	creator: "0xselim",
	title: "test4",
	questions: [
		{
			questionText: "Byzantine",
			options: [
				{ optionText: "Alexios I" },
				{ optionText: "John II" },
				{ optionText: "Manuel I" },
			],
		},
	],
};

router.post("/", async (req, res) => {
	try {
		await Exam.create(req.body);
		res.redirect("/dashboard");
	} catch (error) {
		console.log(error);
		res.render("error/500");
	}
});

router.get("/", async (req, res) => {
	try {
		const exams = await Exam.find();
		res.json(exams);
	} catch (err) {
		console.error(err);
		res.render("error/500");
	}
});

router.get("/:id", async (req, res) => {
	try {
		const exam = await Exam.findById(req.params.id);
		if (!exam) {
			return res.status(404).render("error/404");
		}
		res.json(exam);
	} catch (err) {
		console.error(err);
		res.render("error/500");
	}
});

router.post("/:id", async (req, res) => {
	try {
		const hashInput = req.body.address + JSON.stringify(req.body.answers);
		const answerHash = crypto
			.createHash("sha256")
			.update(hashInput)
			.digest("hex");

		const newAnswer = await Answer.create({ answerHash });

		const examId = req.params.id;
		const exam = await Exam.findById(examId);

		if (!exam) {
			return res.render("error/404");
		}

		exam.userAnswers.push(newAnswer);

		// Build the Merkle Tree with answerHash values
		const merkleTree = new MerkleTree(
			exam.userAnswers.map((answer) => answer.answerHash),
			crypto.createHash.bind(crypto),
			{ duplicateOdd: true }
		);
		const updatedRootHash = merkleTree.getRoot().toString("hex");

		// Update the Exam document with the new rootHash
		await Exam.findByIdAndUpdate(examId, {
			userAnswers: exam.userAnswers,
			rootHash: updatedRootHash,
		});

		res.redirect("/exams");
	} catch (error) {
		console.log(error);
		res.render("error/500");
	}
});

module.exports = router;
