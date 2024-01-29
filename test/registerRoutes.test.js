const { expect } = require("chai");
const supertest = require("supertest");
const app = require("../app");
const User = require("../models/User");

describe("Register Route", () => {
	it("should register a new user", async () => {
		const newUser = {
			email: "test@example.com",
			password: "testpassword",
			walletAddress: "testwalletaddress",
		};

		const response = await supertest(app).post("/register").send(newUser);

		expect(response.status).to.equal(200);
		expect(response.body).to.have.property("success", true);
		expect(response.body).to.have.property("user");

		const registeredUser = await User.findOne({ email: newUser.email });

		expect(registeredUser).to.exist;
		expect(registeredUser.email).to.equal(newUser.email);
		expect(registeredUser.walletAddress).to.equal(newUser.walletAddress);
	});
});
