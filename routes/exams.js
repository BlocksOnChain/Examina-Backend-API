const express = require("express");
const Exam = require("../models/Exam");
const Answer = require("../models/Answer");
const Question = require("../models/Question");
const User = require("../models/User");
const Score = require("../models/Score");
const router = express.Router();
const crypto = require("crypto");
const Classroom = require("../models/Classroom");
const isAuthenticated = require("../middleware/auth");
const createExam = require("../middleware/protokit");
const submitAnswer = require("../middleware/protokit");
const publishCorrectAnswers = require("../middleware/protokit");
const checkScore = require("../middleware/protokit");
const isMochaRunning = require("../middleware/isMochaRunning");
router.use((req, res, next) => {
	isAuthenticated(req, res, next);
});
router.get("/create", (req, res) => {
	res.render("exams/create");
});

router.post("/create", async (req, res) => {
	try {
		const user = await User.findById(req.session.user);
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
				let questions = req.body.questions.map((question) => {
					question.exam = newExam._id;
					return question;
				});
				Question.insertMany(questions)
					.then((resultQs) => {
						console.log("Insterted many questions", result);
						createExam(
							newExam._id,
							resultQs.map((q) => {
								return {
									questionID: q._id.toString("hex"),
									question: q.text,
									correct_answer: q.correctAnswer,
								};
							})
						);
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
router.get("/", async (req, res) => {
	try {
		const exams = await Exam.find();
		res.json(exams);
	} catch (err) {
		console.error(err);
		res.render("error/500");
	}
});

router.post("/create/mock_exam", async (req, res) => {
	try {
		if (!isMochaRunning) {
			const result = await fetch(
				`${process.env.PROTOKIT_URL}/create/mock_exam`
			);
			console.log("Result: ", result);
			res.json(result);
		}
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Internal Server Error" });
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

router.post("/:id/answer/submit", async (req, res) => {
	try {
		const user = await User.findById(req.session.user);
		const hashInput =
			user.walletAddress + JSON.stringify(req.body.answer.selectedOption);
		const answerHash = crypto
			.createHash("sha256")
			.update(hashInput)
			.digest("hex");
		const question = await Question.findById(req.body.answer.questionId);
		const answer = {
			question: question._id,
			selectedOption: req.body.answer.selectedOption,
			answerHash: answerHash,
		};
		const examId = req.params.id;
		const exam = await Exam.findById(examId);

		if (!exam) {
			return res.status(500).json({ message: "Exam not found" });
		}

		// Calculate end time of the exam
		const startTime = exam.startDate;
		console.log("Start time: ", startTime);
		const endTime = new Date(startTime.getTime() + exam.duration * 60000); // Convert duration from minutes to milliseconds

		// Check if the exam has already ended
		const currentDateTime = new Date();
		if(currentDateTime < startTime) {
			return res.status(400).json({
				message: "Exam has not started yet. You cannot submit answers.",
			});
		}
		if (currentDateTime > endTime + 60000) {
			return res.status(400).json({
				message: "Exam has already ended. You cannot submit answers.",
			});
		}

		// Find answers by user inside Answer schema
		let userAnswers = await Answer.findOne({
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
			submitAnswer(examId, user._id, question._id, answer.selectedOption);
		} else {
			// If user has already answered, find the specific answer and update it
			const existingAnswerIndex = userAnswers.answers.findIndex(
				(ans) => ans.question.toString() === answer.question.toString()
			);
			if (existingAnswerIndex !== -1) {
				// Update existing answer
				userAnswers.answers[existingAnswerIndex] = answer;
				console.log("Existed answer");
				submitAnswer(examId, user._id, question._id, answer.selectedOption);
			} else {
				// Add new answer if not already exists
				userAnswers.answers.push(answer);
				submitAnswer(examId, user._id, question._id, answer.selectedOption);
				console.log("User answers: ", userAnswers.answers ? userAnswers.answers : "Undefined");
				console.log("Exam questions: ", exam.questions ? exam.questions : "Undefined");
				const questions = await Question.find({ exam: exam._id });
				if (userAnswers.answers?.length == questions?.length) {
					const score = checkScore(exam._id, user._id);
					console.log("Score: ", score);
					const userScore = new Score({
						user: user._id,
						exam: exam._id,
						score: score,
					});
					await userScore.save();
				}
			}
			await userAnswers.save();
		}
		res.status(200).json({ message: "Answer submitted successfully" });
	} catch (error) {
		console.log(error);
		res.status(500).json({ message: error.message });
	}
});

/* 
router.get("/tryEnd", async (req, res) => {
	try {
		const exams = await Exam.find({ isCompleted: false });
		if (!exams) {
			return res.status(404).json({ message: "Exams not found that are not completed" });
		}
		exams.forEach(async (exam) => {
			const startTime = exam.startDate;
			const endTime = new Date(startTime.getTime() + exam.duration * 60000); // Convert duration from minutes to milliseconds
			if (new Date() >= endTime) {
				exam.isCompleted = true;
				await exam.save();
				const questions = await Question.find({ exam: exam._id });
				publishCorrectAnswers(
					req.params.id,
					questions.map((q) => {
						return {
							question_id: q._id,
							question: q.text,
							correctAnswer: q.correctAnswer,
						};
					})
				);
				const usersJoinedExam = await Answer.find({ exam: req.params.id }).populate("user");
				usersJoinedExam.foreach(async (user) => {
					const score = checkScore(exam._id, user._id);
					console.log("Score: ", score);
					const userScore = new Score({
						user: user._id,
						exam: exam._id,
						score: score,
					});
					await userScore.save();
				});
			}
		});
		res.status(200).json({ message: "Exam ended successfully" });
	} catch (error) {
		console.log(error);
		res.status(500).json({ message: error.message });
	}
}); */

router.get("/:id/question/:questionid", async (req, res) => {
	try {
		const exam = await Exam.findById(req.params.id);
		if (!exam) {
			return res.status(404).send("exam not found");
		}
		const question = await Question.findById(req.params.questionid);
		if (!question) {
			return res.status(404).send("question not found");
		}
		res.json(question);
	} catch (err) {
		console.error(err);
		res.render("error/500");
	}
});

router.get("/:id/questions", async (req, res) => {
	try {
		const exam = await Exam.findById(req.params.id);
		if(exam.startDate > new Date()) {
			return res.status(400).json({ message: "Exam has not started yet" });
		}
		if (!exam) {
			return res.status(404).send("exam not found");
		}
		const questions = await Question.find({ exam: exam._id });
		res.json(questions);
	} catch (err) {
		console.error(err);
		res.render("error/500");
	}
});

router.get("/:id/answers", async (req, res) => {
	try {
		const exam = await Exam.findById(req.params.id);
		if(exam.startDate > new Date()) {
			return res.status(400).json({ message: "Exam has not started yet" });
		}
		if (!exam) {
			return res.status(404).send("exam not found");
		}
		const answers = await Answer.find({
			user: req.session.user,
			exam: exam._id,
		}).populate("answers");
		res.json(answers);
	} catch (err) {
		console.error(err);
		res.render("error/500");
	}
});

router.get("/:id/answers/:answerid", async (req, res) => {
	try {
		const exam = await Exam.findById(req.params.id);
		if(exam.startDate > new Date()) {
			return res.status(400).json({ message: "Exam has not started yet" });
		}
		if (!exam) {
			return res.status(404).send("exam not found");
		}
		const answer = await Answer.findById(req.params.answerid);
		res.json(answer);
	} catch (err) {
		console.error(err);
		res.render("error/500");
	}
});

router.get("/question/:id", async (req, res) => {
	try {
		const question = await Question.findById(req.params.id);
		const exam = await Exam.findById(question.exam);
		if(exam.startDate > new Date()) {
			return res.status(400).json({ message: "Exam has not started yet" });
		}
		if (!question) {
			return res.status(404).send("question not found");
		}
		res.json(question);
	} catch (err) {
		console.error(err);
		res.status(500).json("error finding question");
	}
});

router.get("/scores/:examID", async (req, res) => {
	try {
		const user = await User.findById(req.session.user);
		if (!user) {
			return res.status(401).json("Unauthorized");
		}
		const userId = user._id;
		const examID = req.params.examID;

		const exam = await Exam.findById(examID);
		if(exam.startDate > new Date()) {
			return res.status(400).json({ message: "Exam has not started yet" });
		}
		if (!exam) {
			return res.status(404).json("Exam not found");
		}

		const creatorId = exam.creator.toString();
		if (userId === creatorId) {
			const scores = await Score.find({ exam: examID });
			return res.json(scores);
		} else {
			return res.status(403).json("Unauthorized access");
		}
	} catch (err) {
		console.error(err);
		res.status(500).json("Error finding scores");
	}
});

router.get("/scores/get_user_score/:examID", async (req, res) => {
	try {
		const user = await User.findById(req.session.user);
		if (!user) {
			return res.status(401).json("Unauthorized");
		}

		const userId = user._id;
		const examID = req.params.examID;

		const exam = await Exam.findById(examID);
		if (!exam) {
			return res.status(404).json("Exam not found");
		}

		const score = await Score.findOne({ exam: examID, user: userId });
		if (!score) {
			return res.status(404).json("Score not found for this user");
		}

		res.json(score);
	} catch (err) {
		console.error(err);
		res.status(500).json("Error finding user score");
	}
});

module.exports = router;
