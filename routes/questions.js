import { Router } from "express";
import { find } from "../models/Question";
const router = Router();

router.get("/", async (req, res) => {
	try {
		const questions = await find({});
		res.status(200).json(questions);
	} catch (err) {
		console.error(err);
		res.render("error/500");
	}
});

export default router;