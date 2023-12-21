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
		console.error(error);
		res.render("error/500");
	}
});

module.exports = router;
