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

	// Exam bilgilerini alma testi
	describe("GET /exams/:id", () => {
		it("should respond with 200 status code and the exam details", async () => {
			const res = await request(app).get(`/exams/${testExamId}`);
			expect(res.statusCode).toEqual(200);
			expect(res.body._id).toEqual(testExamId);
		});
	});

	// Soru ekleme testi
	describe("POST /exams/:id/questions", () => {
		it("should add a new question to the exam and respond with 200 status code", async () => {
			const res = await request(app)
				.post(`/exams/${testExamId}/questions`)
				.send({
					text: "Test Question",
					options: ["Option 1", "Option 2", "Option 3"],
					correctOptionIndex: 0,
				});

			expect(res.statusCode).toEqual(200);
			testQuestionId = res.body._id;
		});
	});

	// Answer gönderme testi
	describe("POST /exams/:id/answer/submit", () => {
		it("should submit an answer and respond with 200 status code", async () => {
			const res = await request(app)
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
	});
	
	// Exam silme testi
	describe("DELETE /exams/:id", () => {
		it("should delete the exam and respond with 200 status code", async () => {
			const res = await request(app).delete(`/exams/${testExamId}`);
			expect(res.statusCode).toEqual(200);
			expect(res.body.message).toEqual("Exam deleted successfully");
		});
	});
});

afterAll(async () => {
	await Exam.deleteMany({});
	await Question.deleteMany({});
});
