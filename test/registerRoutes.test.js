jest.mock("express-session", () => {
	return jest.fn(() => {
		return (req, res, next) => {
			req.session = {
				token: Math.floor(10000 + Math.random() * 90000),
			};
			next();
		};
	});
});

jest.mock("memorystore", () => {
	const session = require("express-session");
	const MemoryStore = require("express-session").MemoryStore;

	return function (options) {
		return new MemoryStore(options);
	};
});

const request = require("supertest");
const app = require("../app");
const mongoose = require("mongoose");
const connectDB = require("../config/db");
var Client = require("mina-signer");
// mainnet or testnet
const signerClient = new Client({ network: "testnet" });

jest.mock("express-session", () => ({
	__esModule: true,
	default: (options) => {
		return (req, res, next) => {
			// Rastgele 5 haneli bir token oluştur
			const generateRandomToken = () => {
				return Math.floor(10000 + Math.random() * 90000);
			};

			// Oturum nesnesini oluştur ve req.session'e ekle
			req.session = {
				token: generateRandomToken(),
			};
			next();
		};
	},
}));

describe("API Endpoint Tests", () => {
	beforeAll(async () => {
		await connectDB();
	});
	afterAll(async () => {
		await mongoose.disconnect();
	});
	test("GET /register/session/get-message-to-sign/:walletAddress should return a message to sign for a given wallet address", async () => {
		const res = await request(app)
			.get(
				"/register/session/get-message-to-sign/B62qmCGGG98iPmNEeFLByG3tPdnR6UvVvrXbkDPAC7DYJUvJVHFm1B3"
			)
			.query({
				walletAddress:
					"B62qmCGGG98iPmNEeFLByG3tPdnR6UvVvrXbkDPAC7DYJUvJVHFm1B3",
			});

		expect(res.status).toBe(200);
		expect(res.body).toHaveProperty("message");
	});

	test("POST / should authenticate user and create a new user or find an existing one", async () => {
		// demo wallet keys
		const keys_demo = {
			publicKey:
				"B62qmCGGG98iPmNEeFLByG3tPdnR6UvVvrXbkDPAC7DYJUvJVHFm1B3",
			privateKey: "EKEjW2PYb6cW5WD26ivv1wqR6AKT3a64zHbCg6VwoinhSQKAUnKQ",
		};

		// get a session message to verify
		const resGet = await request(app)
			.get(
				"/register/session/get-message-to-sign/B62qmCGGG98iPmNEeFLByG3tPdnR6UvVvrXbkDPAC7DYJUvJVHFm1B3"
			)
			.query({
				walletAddress:
					"B62qmCGGG98iPmNEeFLByG3tPdnR6UvVvrXbkDPAC7DYJUvJVHFm1B3",
			});

		// extract the message
		const message = resGet.body.message;
		console.log("Message: ", message);

		const resGetSession = await request(app).get("/register/session");

		console.log("Get Session", resGetSession.body.user);
		// const signMessage_demo =
		// 	"r90autB62qp9PvZH8zQh9sVr53ApUBrtwt8odZ7hXVXguhq6udpUYQVbRnpVJ";

		// wallet signs the message with private key
		const signParams = {
			message: message,
		};
		// const signRes = signTransaction(keys_demo.privateKey, signParams);
		let signResult;
		try {
			// let signClient = getSignClient();
			// let signBody = params.message;
			signResult = signerClient.signMessage(
				signParams,
				keys_demo.privateKey
			);
		} catch (err) {
			signResult = { message: String(err) };
		}

		console.log("Signature: ", signResult);

		const verifyResult = signerClient.verifyMessage(signResult);
		console.log("Verify Result :", verifyResult);

		// send the message to endpoint to verify
		const res = await request(app)
			.post("/register")
			.send({
				walletAddress: signResult.publicKey,
				signature: JSON.parse(JSON.stringify(signResult.signature)),
			});
		if (res.status === 401) {
			console.log(res.body.error);
		}
		expect(res.status).toBe(200);
		expect(res.body).toHaveProperty("success", true);
		expect(res.body).toHaveProperty("user");
	});
});
