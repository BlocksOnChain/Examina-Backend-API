const request = require("supertest");
const app = require("../app");
const mongoose = require("mongoose");
var Client = require("mina-signer");
const session = require("supertest-session");
// mainnet or testnet
const signerClient = new Client({ network: "testnet" });

describe("API Endpoint Tests", () => {
	let testSession;
	beforeEach(() => {
		testSession = session(app); // Test oturumu oluşturduk
	});
	beforeAll(async () => {
		await mongoose.connect(process.env.MONGO_URI, {});
	});
	afterAll(async () => {
		await mongoose.disconnect();
	});
	test("GET /register/session/get-message-to-sign/:walletAddress should return a message to sign for a given wallet address", async () => {
		const res = await testSession
			.get(
				"/register/session/get-message-to-sign/B62qmCGGG98iPmNEeFLByG3tPdnR6UvVvrXbkDPAC7DYJUvJVHFm1B3"
			)
			.query({
				walletAddress:
					"B62qmCGGG98iPmNEeFLByG3tPdnR6UvVvrXbkDPAC7DYJUvJVHFm1B3",
			});

		expect(res.status).toBe(200);
		expect(res.body).toHaveProperty("message");

		testSession.session = testSession.session || {};
		testSession.session.token = res.body.message;
		testSession.session.message = res.body.message;

		const resGetSession = await testSession.get("/register/session");
		console.log("Get Session", resGetSession.body.user);
	});

	test("POST / should authenticate user and create a new user or find an existing one", async () => {
		// demo wallet keys
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
		console.log("Message: ", message);

		testSession.session = testSession.session || {};
		testSession.session.token = resGet.body.message;
		testSession.session.message = { message: resGet.body.message };

		const resGetSession = await testSession.get("/register/session");

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

		const verifyBody = {
			data: { message: signParams.message },
			publicKey: keys_demo.publicKey,
			signature: signResult.signature,
		};
		console.log("Verify Body: ", verifyBody);

		const verifyResult = signerClient.verifyMessage(verifyBody);
		console.log("Test Verify Result :", verifyResult);

		// send the message to endpoint to verify
		const res = await testSession.post("/register").send({
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
