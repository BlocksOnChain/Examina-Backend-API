const express = require("express");
const router = express.Router();
const Classroom = require("../models/Classroom");

router.post("/", async (req, res) => {
	try {
		const { name, teacherId, studentIds } = req.body;
		const classroom = await Classroom.create({
			name,
			teacher: teacherId,
			students: studentIds,
		});
		res.json(classroom);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Internal Server Error" });
	}
});

router.get("/user/:userId", async (req, res) => {
	try {
		const userId = req.params.userId;
		const classrooms = await Classroom.find({ teacher: userId }).populate(
			"students",
			"name email"
		);
		res.json(classrooms);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Internal Server Error" });
	}
});

router.get("/student/:studentId", async (req, res) => {
	try {
		const studentId = req.params.studentId;
		const classrooms = await Classroom.find({
			students: studentId,
		}).populate("teacher", "name email");
		res.json(classrooms);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Internal Server Error" });
	}
});

module.exports = router;
