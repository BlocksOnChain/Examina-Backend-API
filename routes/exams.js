const express = require("express");
const Exam = require("../models/Exam");
const router = express.Router();

router.get("/create", (req, res) => {
	res.render("exams/create");
});

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
		// res.render("exams/index", {
		// 	exams,
		// });
		res.json(exams);
	} catch (err) {
		console.error(err);
		res.render("error/500");
	}
});

module.exports = router;
