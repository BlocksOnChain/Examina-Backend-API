const { expect } = require("chai");
const supertest = require("supertest");
const app = require("../app");

describe("Exam Routes", () => {
	it("should create a new exam", async () => {
		const response = await supertest(app)
			.post("/exams")
			.send(sampleExamData);

		expect(response.status).to.equal(302);
	});
	it("should get all exams", async () => {
		const response = await supertest(app).get("/exams");

		expect(response.status).to.equal(200);
		expect(response.body).to.be.an("array");
	});

	it("should get a specific exam by ID", async () => {
		const existingExamId = "your-existing-exam-id";

		const response = await supertest(app).get(`/exams/${existingExamId}`);

		expect(response.status).to.equal(200);
		expect(response.body).to.be.an("object");
	});
});
