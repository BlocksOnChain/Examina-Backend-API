const request = require("supertest");
const app = require("../app");
const Exam = require("../models/Exam");
const Question = require("../models/Question");

describe("Exam Routes", () => {
	let testExamId;
	let testQuestionId;

	// Exam oluşturma testi
	describe("POST /exams", () => {
		it("should create a new exam and respond with 200 status code and success message", async () => {
			const res = await request(app).post("/exams").send({
				title: "Test Exam",
				description: "This is a test exam",
				startDate: "2024-03-08",
				duration: 60,
				rootHash: "testroot123",
				secretKey: "testsecret123",
			});

			expect(res.statusCode).toEqual(200);
			expect(res.body.message).toEqual("Exam created successfully");
			testExamId = res.body.newExam._id;
		});
	});
});

afterAll(async () => {
	await Exam.deleteMany({});
	await Question.deleteMany({});
});
