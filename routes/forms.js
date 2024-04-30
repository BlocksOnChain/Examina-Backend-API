const express = require("express");
const router = express.Router();
const isAuthenticated = require("../middleware/auth");
const Form = require("../models/Form");
const FormQuestion = require("../models/FormQuestion");
const FormAnswer = require("../models/FormAnswer");
router.use((req, res, next) => {
	isAuthenticated(req, res, next);
});

router.get("/:id", async (req, res) => {
    try {
		const form = await form.findById(req.params.id);
		if (!form) {
			return res.status(404).json({ error: "Form not found" });
		}
		res.json(form);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: err.message });
	}
});

router.post("/create", async (req, res) => {
    try {
        const { title, description, questions } = req.body;
        const form = new Form(req.user.id, title, description);
        form.save().then((form) => {
            let questions = req.body.questions.map((question) => {
                question.form = form._id;
                return question;
            });
            FormQuestion.insertMany(questions).then((resultQs) => {
                res.json({form: form, questions: resultQs});
            });
        });
        
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

router.post("/update/:id", async (req, res) => {
    try {
        const { title, description, questions } = req.body;
        const form = await Form.findById(req.params.id);
        if (!form) {
            return res.status(404).json({ error: "Form not found" });
        }
        form.title = title;
        form.description = description;
        form.save().then(async (form) => {
            await req.body.questions.map(async (newQuestion) => {
                const question = await FormQuestion.findById(newQuestion._id);
                if (!question) {
                    return res.status(404).json({ error: "Question not found" });
                }
                question.question = newQuestion.question; 
                question.options = newQuestion.options;
            });
            res.json({newForm: form, newQuestions: questions});
        })}
        catch (err) {
            console.error(err);
            res.status(500).json({ error: err.message });
        }
});

router.post("/:id/submit_answers", async (req, res) => {
    try {
        const { answers } = req.body;
    const form = await Form.findById(req.params.id);
    if (!form) {
        return res.status(404).json({ error: "Form not found" });
    }
    const formAnswer = new FormAnswer(form._id, req.user.id, answers);
    const newFormAnswer = await formAnswer.save()
    res.status(200).json(newFormAnswer);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

router.get("/:id/answers", async (req, res) => {
    try {
        const form = await Form.findById(req.params.id);
        if (!form) {
            return res.status(404).json({ error: "Form not found" });
        }
        const answers = await FormAnswer.find({form: form._id});
        res.status(200).json(answers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});