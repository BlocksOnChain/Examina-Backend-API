import { Router } from "express";
import Exam, { find, findById } from "../models/Exam";
import Answer, { findOne, find as _find, findById as _findById } from "../models/Answer";
import { insertMany, findById as __findById, find as __find } from "../models/Question";
import { findById as ___findById } from "../models/User";
export const exams = Router();
import { createHash } from "crypto";
import Classroom from "../models/Classroom";
import isAuthenticated from "../middleware/auth";

exams.use((req, res, next) => {
	isAuthenticated(req, res, next);
});
exams.get("/create", (req, res) => {
	res.render("exams/create");
});

exams.post("/create", async (req, res) => {
	try {
		const user = await ___findById(req.session.user);
		// console.log("User: ", user._id);
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}
		const newExam = new Exam({
			creator: user._id,
			title: req.body.title,
			description: req.body.description,
			startDate: req.body.startDate,
			duration: req.body.duration,
			rootHash: req.body.rootHash,
			secretKey: req.body.secretKey,
		});

		newExam
			.save()
			.then((result) => {
				console.log(result);
				// Add newExam._id to each question in req.body.questions
				const questions = req.body.questions.map((question) => {
					question.exam = newExam._id;
					return question;
				});
				insertMany(questions)
					.then((result) => {
						console.log("Insterted many questions", result);
					})
					.catch((err) => {
						console.log(err);
					});
				res.status(200).json({
					message: "Exam created successfully",
					newExam: result,
				});
			})
			.catch((err) => {
				console.log(err);
				res.status(500).send({ type: "Error when saving" });
			});
	} catch (err) {
		res.status(500).json({ message: err });
	}
});
exams.get("/", async (req, res) => {
	try {
		const exams = await find();
		res.json(exams);
	} catch (err) {
		console.error(err);
		res.render("error/500");
	}
});

exams.get("/:id", async (req, res) => {
	try {
		const exam = await findById(req.params.id);
		if (!exam) {
			return res.status(404).render("error/404");
		}
		res.json(exam);
		// console.log("REQ.PARAMS.ID: ", req.params.id);
		// console.log("EXAM ID: ", exam.id);
		console.log("EXAM: ", exam);
	} catch (err) {
		console.error(err);
		res.render("error/500");
	}
});

exams.post("/:id/answer/submit", async (req, res) => {
	try {
		const user = await ___findById(req.session.user);
		const hashInput =
			user.walletAddress + JSON.stringify(req.body.answer.selectedOption);
		const answerHash = createHash("sha256")
			.update(hashInput)
			.digest("hex");
		const question = await __findById(req.body.answer.questionId);
		const answer = {
			question: question._id,
			selectedOption: req.body.answer.selectedOption,
			answerHash: answerHash,
		};
		const examId = req.params.id;
		const exam = await findById(examId);

		if (!exam) {
			return res.status(500).json({ message: "Exam not found" });
		}

		// Calculate end time of the exam
		const startTime = new Date(exam.startDate);
		const endTime = new Date(startTime.getTime() + exam.duration * 60000); // Convert duration from minutes to milliseconds

		// Check if the exam has already ended
		const currentDateTime = new Date();

		if (currentDateTime > endTime) {
			return res.status(400).json({
				message: "Exam has already ended. You cannot submit answers.",
			});
		}

		// Find answers by user inside Answer schema
		let userAnswers = await findOne({
			user: user._id,
			exam: examId,
		});

		if (!userAnswers) {
			// If user has not answered before, create a new entry
			userAnswers = new Answer({
				user: req.session.user,
				exam: examId,
				answers: [answer],
			});
			await userAnswers.save();
		} else {
			// If user has already answered, find the specific answer and update it
			const existingAnswerIndex = userAnswers.answers.findIndex(
				(ans) => ans.question.toString() === answer.question.toString()
			);
			if (existingAnswerIndex !== -1) {
				// Update existing answer
				userAnswers.answers[existingAnswerIndex] = answer;
			} else {
				// Add new answer if not already exists
				userAnswers.answers.push(answer);
			}
			await userAnswers.save();
		}
		res.status(200).json({ message: "Answer submitted successfully" });
	} catch (error) {
		console.log(error);
		res.status(500).json({ message: error.message });
	}
});

// exams.delete("/:id", async (req, res) => {
// 	try {
// 		const examId = req.params.id;
// 		const userId = req.user._id;

// 		// Find the exam by ID and check if the logged-in teacher created it
// 		const exam = await Exam.findOne({ _id: examId, creator: userId });
// 		if (!exam) {
// 			return res.status(404).json({
// 				message:
// 					"Exam not found or you are not authorized to delete it",
// 			});
// 		}

// 		// Delete the exam
// 		await Exam.findByIdAndDelete(examId);
// 		res.json({ message: "Exam deleted successfully" });
// 	} catch (error) {
// 		console.error(error);
// 		res.status(500).json({ message: "Internal Server Error" });
// 	}
// });

exams.get("/:id/question/:questionid", async (req, res) => {
	try {
		const exam = await findById(req.params.id);
		if (!exam) {
			return res.status(404).send("exam not found");
		}
		const question = await __findById(req.params.questionid);
		if (!question) {
			return res.status(404).send("question not found");
		}
		res.json(question);
	} catch (err) {
		console.error(err);
		res.render("error/500");
	}
});

exams.get("/:id/questions", async (req, res) => {
	try {
		const exam = await findById(req.params.id);
		if (!exam) {
			return res.status(404).send("exam not found");
		}
		const questions = await __find({ exam: exam._id });
		res.json(questions);
	} catch (err) {
		console.error(err);
		res.render("error/500");
	}
});

exams.get("/:id/answers", async (req, res) => {
	try {
		const exam = await findById(req.params.id);
		if (!exam) {
			return res.status(404).send("exam not found");
		}
		const answers = await _find({
			user: req.session.user,
			exam: exam._id,
		}).populate("answers");
		res.json(answers);
	} catch (err) {
		console.error(err);
		res.render("error/500");
	}
});

exams.get("/:id/answers/:answerid", async (req, res) => {
	try {
		const exam = await findById(req.params.id);
		if (!exam) {
			return res.status(404).send("exam not found");
		}
		const answer = await _findById(req.params.answerid);
		res.json(answer);
	} catch (err) {
		console.error(err);
		res.render("error/500");
	}
});

exams.get("/question/:id", async (req, res) => {
	try {
		const question = await __findById(req.params.id);
		if (!question) {
			return res.status(404).send("question not found");
		}
		res.json(question);
	} catch (err) {
		console.error(err);
		res.render("error/500");
	}
});

export default exams;
