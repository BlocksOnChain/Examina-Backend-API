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

module.exports = router;
