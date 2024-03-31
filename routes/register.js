import { Router } from "express";
const router = Router();
import User, { find } from "../models/User";
import Client from "mina-signer";
// mainnet or testnet
const signerClient = new Client({ network: "testnet" });

router.get("/session/get-message-to-sign/:walletAddress", (req, res) => {
	const { walletAddress } = req.params;
	const token = Math.random().toString(36).substring(7);
	// save token to user's session
	req.session.token = token;
	const message = `${req.session.token}${walletAddress}`;
	req.session.message = { message: message };
	// console.log("GET req.session.message: ", req.session.message);
	res.json({ message: message });
});

router.post("/", async (req, res) => {
	const { walletAddress, signature } = req.body;
	// console.log("Req.session.message: ", req.session.message);
	var signture =
		typeof signature === "string" ? JSON.parse(signature) : signature;
	const verifyBody = {
		data: req.session.message,
		publicKey: walletAddress,
		signature: signture,
	};
	console.log("Data: ", verifyBody.data);
	console.log("Public Key: ", verifyBody.publicKey);
	console.log("Signature: ", verifyBody.signature);

	const verifyResult = signerClient.verifyMessage(verifyBody);
	// console.log("Req.session.token: ", req.session.token);
	console.log("Verify Result: ", verifyResult);
	if (verifyResult && req.session.token) {
		// Create user if not exists
		try {
			const user = await find({ walletAddress: walletAddress });
			if (user.length == 0) {
				const newUser = new User({
					username: walletAddress,
					walletAddress,
				});
				const saved_user = await newUser.save();
				console.log("Saved user: ", saved_user);
				req.session.user = saved_user._id;
				return res.json({ success: true, user: req.session.user });
			} else {
				req.session.user = user[0]._id;
				console.log("User already exists: ", user[0]);
				return res.json({ success: true, user: req.session.user });
			}
		} catch (err) {
			console.log(err);
		}
	} else {
		res.status(401).json({
			token: req.session.token,
			error: "Invalid signature or didn't have session token",
		});
	}
});

router.get("/session", (req, res) => {
	res.json({ user: req.session.token });
});

export default router;
