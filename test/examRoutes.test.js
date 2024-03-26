const request = require("supertest");
const app = require("../app");
const Exam = require("../models/Exam");
const Question = require("../models/Question");
const session = require("supertest-session");
const mongoose = require("mongoose");
var Client = require("mina-signer");
const { questions } = require("./testQuestions");

const signerClient = new Client({ network: "testnet" });

describe("Exam Endpoint Tests", () => {
	let testSession;
	beforeAll(async () => {
		testSession = session(app); // Test oturumu oluşturduk
		const keys_demo = {
			publicKey:
				"B62qmCGGG98iPmNEeFLByG3tPdnR6UvVvrXbkDPAC7DYJUvJVHFm1B3",
			privateKey: "EKEjW2PYb6cW5WD26ivv1wqR6AKT3a64zHbCg6VwoinhSQKAUnKQ",
		};

		// get a session message to verify
		const resGet = await testSession
			.get(
				"/register/session/get-message-to-sign/B62qmCGGG98iPmNEeFLByG3tPdnR6UvVvrXbkDPAC7DYJUvJVHFm1B3"
			)
			.query({
				walletAddress:
					"B62qmCGGG98iPmNEeFLByG3tPdnR6UvVvrXbkDPAC7DYJUvJVHFm1B3",
			});

		// extract the message
		const message = resGet.body.message;

		testSession.session = testSession.session || {};
		testSession.session.token = resGet.body.message;
		testSession.session.message = { message: resGet.body.message };
		const signParams = {
			message: message,
		};
		let signResult;
		try {
			signResult = signerClient.signMessage(
				signParams,
				keys_demo.privateKey
			);
		} catch (err) {
			signResult = { message: String(err) };
		}

		// send the message to endpoint to verify
		const res = await testSession.post("/register").send({
			walletAddress: signResult.publicKey,
			signature: JSON.parse(JSON.stringify(signResult.signature)),
		});
	});
	beforeAll(async () => {
		await mongoose.connect(process.env.MONGO_URI, {});
	});
	afterAll(async () => {
		await Exam.deleteMany({});
		await Question.deleteMany({});
		await mongoose.disconnect();
		testSession = null;
	});

	let testExamId;
	let testQuestionId;
	let testAnswerId;

	// Exam oluşturma testi
	test("POST /exams/create should create a new exam and respond with 200 status code and success message", async () => {
		const res = await testSession.post("/exams/create").send({
			title: "Test Exam",
			description: "This is a test exam",
			startDate: "2024-03-26",
			duration: 1440,
			rootHash: "testroot123",
			secretKey: "testsecret123",
			questions: questions,
		});
		expect(res.statusCode).toEqual(200);
		expect(res.body.message).toEqual("Exam created successfully");
		testExamId = res.body.newExam._id;
	});

	// Exam bilgilerini alma testi
	test("GET /exams/:id should respond with 200 status code and the exam details", async () => {
		const res = await testSession.get(`/exams/${testExamId}`);
		expect(res.statusCode).toEqual(200);
		expect(res.body._id).toEqual(testExamId);
	});

	// GET /:id/questions endpoint testi
	test("GET /exams/:id/questions should respond with 200 status code and the questions", async () => {
		const res = await testSession.get(`/exams/${testExamId}/questions`);
		expect(res.statusCode).toEqual(200);
		expect(res.body).toBeDefined();
		console.log("Questions: ", res.body);
	});

	// GET /:id/question/:questionid endpoint testi
	test("GET /exams/:id/question/:questionid should respond with 200 status code and the details of a specific question", async () => {
		const questionsRes = await testSession.get(
			`/exams/${testExamId}/questions`
		);

		testQuestionId = questionsRes.body[0]._id;

		const res = await testSession.get(
			`/exams/${testExamId}/question/${testQuestionId}`
		);
		expect(res.statusCode).toEqual(200);
		expect(res.body._id).toEqual(testQuestionId);
	});

	// Answer gönderme testi
	test("POST /exams/:id/answer/submit should submit an answer and respond with 200 status code", async () => {
		const questionsRes = await testSession.get(
			`/exams/${testExamId}/questions`
		);

		testQuestionId = questionsRes.body[0]._id;

		const res = await testSession
			.post(`/exams/${testExamId}/answer/submit`)
			.send({
				answer: {
					questionId: testQuestionId,
					selectedOption: 0,
				},
			});

		expect(res.statusCode).toEqual(200);
		expect(res.body.message).toEqual("Answer submitted successfully");
	});

	// test("POST /exams/:id/answer/submit should submit an answer and respond with an error after exam duration has passed", async () => {
	// 	const questionsRes = await testSession.get(
	// 		`/exams/${testExamId}/questions`
	// 	);

	// 	testQuestionId = questionsRes.body[1]._id;

	// 	// jest.advanceTimersByTime(1440 * 60 * 1000 + 1000);

	// 	const res = await testSession
	// 		.post(`/exams/${testExamId}/answer/submit`)
	// 		.send({
	// 			answer: {
	// 				questionId: testQuestionId,
	// 				selectedOption: 0,
	// 			},
	// 		});

	// 	expect(res.statusCode).toEqual(400);
	// 	expect(res.body.message).toEqual(
	// 		"Exam has already ended. You cannot submit answers."
	// 	);
	// });

	test("POST /exams/:id/answer/submit should submit an answer and update the answer with status 200", async () => {
		const answersRes = await testSession.get(
			`/exams/${testExamId}/answers`
		);
		testAnswerId = answersRes.body[0]._id;

		console.log(
			"Initial Answer: ",
			answersRes.body[0].answers[0].selectedOption
		);

		const questionsRes = await testSession.get(
			`/exams/${testExamId}/questions`
		);

		testQuestionId = questionsRes.body[0]._id;

		const res = await testSession
			.post(`/exams/${testExamId}/answer/submit`)
			.send({
				answer: {
					questionId: testQuestionId,
					selectedOption: 1,
				},
			});

		expect(res.statusCode).toEqual(200);
		expect(res.body.message).toEqual("Answer submitted successfully");
	});

	// GET /:id/answers endpoint testi
	test("GET /exams/:id/answers should respond with 200 status code and the answers for the exam", async () => {
		const res = await testSession.get(`/exams/${testExamId}/answers`);
		expect(res.statusCode).toEqual(200);
		expect(res.body).toBeDefined();
		console.log("Answers: ", res.body);
	});

	// GET /:id/answers endpoint testi
	test("GET /exams/:id/answers should respond with 200 status code and the answers for the exam", async () => {
		const res = await testSession.get(`/exams/${testExamId}/answers`);
		expect(res.statusCode).toEqual(200);
		expect(res.body).toBeDefined();
		console.log("Answers: ", res.body);
	});

	// GET /:id/answers/:answerid endpoint testi
	test("GET /exams/:id/answers/:answerid should respond with 200 status code and the details of a specific answer", async () => {
		const answersRes = await testSession.get(
			`/exams/${testExamId}/answers`
		);
		testAnswerId = answersRes.body[0]._id;

		const res = await testSession.get(
			`/exams/${testExamId}/answers/${testAnswerId}`
		);
		expect(res.statusCode).toEqual(200);
		expect(res.body._id).toEqual(testAnswerId);
		console.log(
			"Final Answer: ",
			answersRes.body[0].answers[0].selectedOption
		);
	});

	// GET /question/:id endpoint testi
	test("GET /exams/question/:id should respond with 200 status code and the details of a specific question", async () => {
		const questionsRes = await testSession.get(
			`/exams/${testExamId}/questions`
		);

		testQuestionId = questionsRes.body[0]._id;

		const res = await testSession.get(`/exams/question/${testQuestionId}`);
		expect(res.statusCode).toEqual(200);
		expect(res.body._id).toEqual(testQuestionId);
	});
});
