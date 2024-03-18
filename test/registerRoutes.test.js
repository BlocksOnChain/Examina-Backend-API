const request = require("supertest");
const app = require("../app");
const mongoose = require("mongoose");
var Client = require("mina-signer");
// mainnet or testnet
const signerClient = new Client({ network: "testnet" });

function signTransaction(privateKey, params) {
	let signResult;
	try {
		// let signClient = getSignClient();
		let signBody = params.message;
		signResult = signerClient.signTransaction(signBody, privateKey);
	} catch (err) {
		signResult = { message: String(err) };
	}
	return signResult;
}

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

	test("POST / should authenticate user and create a new user or find an existing one", async () => {
		// demo wallet keys
		const keys_demo = {
			publicKey:
				"B62qp9PvZH8zQh9sVr53ApUBrtwt8odZ7hXVXguhq6udpUYQVbRnpVJ",
			privateKey: "EKFQuaBX6N1r7iijmqDKwvuS9fbVgepfZzryCBcTqcgA7kJQtHW8",
		};

		// get a session message to verify
		const resGet = await request(app)
			.get(
				"/register/session/get-message-to-sign/B62qp9PvZH8zQh9sVr53ApUBrtwt8odZ7hXVXguhq6udpUYQVbRnpVJ"
			)
			.query({
				walletAddress:
					"B62qp9PvZH8zQh9sVr53ApUBrtwt8odZ7hXVXguhq6udpUYQVbRnpVJ",
			});

		// extract the message
		const message = resGet.body.message;
		console.log("Message: ", message);
		// const signMessage_demo =
		// 	"r90autB62qp9PvZH8zQh9sVr53ApUBrtwt8odZ7hXVXguhq6udpUYQVbRnpVJ";

		// wallet signs the message with private key
		const signParams = {
			message: message,
		};
		const signRes = signTransaction(keys_demo.privateKey, signParams);

		console.log("Signature: ", signRes);

		// send the message to endpoint to verify
		const res = await request(app).post("/register").send({
			walletAddress: keys_demo.publicKey,
			signature: signRes.signature,
		});

		expect(res.status).toBe(200);
		expect(res.body).toHaveProperty("success", true);
		expect(res.body).toHaveProperty("user");
	});
});
