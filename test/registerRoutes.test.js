const request = require("supertest");
const app = require("../app");
const mongoose = require("mongoose");
const connectDB = require("../config/db");

beforeAll(async () => {
	mongoose.connect(process.env.MONGO_URI, {});
});

// afterAll(async () => {
// 	await mongoose.disconnect();
// });

describe("API Endpoint Tests", () => {
	test("GET /register/session/get-message-to-sign/:walletAddress should return a message to sign for a given wallet address", async () => {
		const res = await request(app)
			.get(
				"/register/session/get-message-to-sign/B62qp9PvZH8zQh9sVr53ApUBrtwt8odZ7hXVXguhq6udpUYQVbRnpVJ"
			)
			.query({
				walletAddress:
					"B62qp9PvZH8zQh9sVr53ApUBrtwt8odZ7hXVXguhq6udpUYQVbRnpVJ",
			});

		expect(res.status).toBe(200);
		expect(res.body).toHaveProperty("message");
	});

	// test("POST / should authenticate user and create a new user or find an existing one", async () => {
	// 	const res = await request(app).post("/").send({
	// 		walletAddress: "example_wallet_address",
	// 		signature: "example_signature",
	// 	});

	// 	expect(res.status).toBe(200);
	// 	expect(res.body).toHaveProperty("success", true);
	// 	expect(res.body).toHaveProperty("user");
	// });
});
