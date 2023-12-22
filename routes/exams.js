const express = require("express");
const Exam = require("../models/Exam");
const router = express.Router();

router.get("/create", (req, res) => {
	res.render("exams/create");
});

router.post("/", async (req, res) => {
	try {
		req.body.questions.forEach((question) => {
			question.options.forEach((option) => {
				option.isCorrect = option.isCorrect || false;
			});
		});
		await Exam.create(req.body);
		res.redirect("/dashboard");
	} catch (error) {
		console.log(error);
		res.render("error/500");
	}
});

module.exports = router;
