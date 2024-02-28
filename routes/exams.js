const express = require("express");
const Exam = require("../models/Exam");
const Answer = require("../models/Exam");
const router = express.Router();
const { MerkleTree } = require("merkletreejs");
const crypto = require("crypto");
const Classroom = require("../models/Classroom");
const { isAuthenticated } = require("../middleware/auth");

router.get("/create", isAuthenticated ,(req, res) => {
	res.render("exams/create");
});

const sampleExamData = {
	creator: "0xselim",
	title: "test4",
	questions: [
		{
			questionText: "Byzantine",
			options: [
				{ optionText: "Nikephoros III" },
				{ optionText: "Alexios I" },
				{ optionText: "John II" },
				{ optionText: "Manuel I" },
			],
		},
		{
			questionText: "Ottoman",
			options: [
				{ optionText: "Bayezid I" },
				{ optionText: "Mehmed I" },
				{ optionText: "Murad II" },
				{ optionText: "Mehmed II" },
			],
		},
		{
			questionText: "Mongol",
			options: [
				{ optionText: "Hulugu" },
				{ optionText: "Batu" },
				{ optionText: "Kublai" },
				{ optionText: "Berke" },
			],
		},
	],
	userAnswers: [""],
	rootHash: "",
};

router.post("/", async (req, res) => {
	try {
		// Check if the logged-in user is a teacher
		if (req.user.role !== "teacher") {
			return res.status(403).json({ message: "Unauthorized" });
		}

		// Check if the logged-in teacher is allowed to create the exam for the given classroom
		const classroomId = req.body.classroomId;
		const classroom = await Classroom.findById(classroomId);
		if (
			!classroom ||
			classroom.teacher.toString() !== req.user._id.toString()
		) {
			return res.status(403).json({
				message:
					"You are not allowed to create exams for this classroom",
			});
		}

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

// create an answer and push it to the exam
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
router.delete("/:id", async (req, res) => {
	try {
		const examId = req.params.id;
		const userId = req.user._id;

		// Find the exam by ID and check if the logged-in teacher created it
		const exam = await Exam.findOne({ _id: examId, creator: userId });
		if (!exam) {
			return res.status(404).json({
				message:
					"Exam not found or you are not authorized to delete it",
			});
		}

		// Delete the exam
		await Exam.findByIdAndDelete(examId);
		res.json({ message: "Exam deleted successfully" });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Internal Server Error" });
	}
});

// TODO: answer objects must be reorganize as address => answer[]
// router.get("/:id/student/:address", async (req, res) => {
// 	try {
// 		const examId = req.params.id;
// 		const address = req.params.address;

// 		// Find the exam by ID
// 		const exam = await Exam.findById(examId);
// 		if (!exam) {
// 			return res.status(404).render("error/404");
// 		}

// 		// Find the student's answers in the Exam document
// 		const studentAnswers = exam.userAnswers.find(
// 			(answer) => answer.address === address
// 		);

// 		if (!studentAnswers) {
// 			return res.status(404).json({
// 				error: "Student's answers not found for the given exam and student ID.",
// 			});
// 		}

// 		// Return the student's answers
// 		res.json(studentAnswers);
// 	} catch (err) {
// 		console.error(err);
// 		res.render("error/500");
// 	}
// });

module.exports = router;
