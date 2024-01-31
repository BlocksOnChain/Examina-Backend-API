const { expect } = require("chai");
const supertest = require("supertest");
const app = require("../app");
const User = require("../models/User");

describe("Login Route", () => {
	it("should log in a user with valid credentials", async () => {
		const testUser = {
			email: "test@example.com",
			password: "testpassword",
		};

		await User.create(testUser);

		const response = await supertest(app).post("/login").send(testUser);

		expect(response.status).to.equal(200);
		expect(response.body).to.have.property("success", true);
		expect(response.body).to.have.property("user");
	});
});
