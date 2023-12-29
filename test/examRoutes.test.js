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
});
