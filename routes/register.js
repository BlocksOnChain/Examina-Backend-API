const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Client = require("mina-signer");

const signerClient = new Client({ network: "mainnet" });

router.get("/session/get-message-to-sign/:walletAddress", (req, res) => {
	const { walletAddress } = req.params;
	const token = Math.random().toString(36).substring(7);
	req.session.token = token;
	const message = `${req.session.token}${walletAddress}`;
	req.session.message = message;
	res.status(200).json({ message: message });
});

router.post("/", async (req, res) => {
	const { walletAddress, signature } = req.body;
	const parsedSignature =
		typeof signature === "string" ? JSON.parse(signature) : signature;
	const verifyBody = {
		data: req.session.message,
		publicKey: walletAddress,
		signature: parsedSignature,
	};

	const verifyResult = signerClient.verifyMessage(verifyBody);

	if (verifyResult && req.session.token) {
		try {
			const user = await User.findOne({ walletAddress: walletAddress });
			if (!user) {
				const newUser = new User({
					username: walletAddress,
					walletAddress,
				});
				const savedUser = await newUser.save();
				req.session.user = {
					userId: savedUser._id,
					walletAddress: savedUser.walletAddress,
				};
				return res
					.status(200)
					.json({ success: true, session: req.session.user });
			} else {
				req.session.user = {
					userId: user._id,
					walletAddress: user.walletAddress,
				};
				return res
					.status(200)
					.json({ success: true, session: req.session.user });
			}
		} catch (err) {
			console.error(err);
			return res.status(500).json({ error: "Internal server error" });
		}
	} else {
		return res.status(401).json({
			success: false,
			error: "Invalid signature or missing session token",
		});
	}
});

if (process.env.NODE_ENV === "development") {
	router.post("/dev", async (req, res) => {
		const { walletAddress } = req.body;
		try {
			const user = await User.findOne({ walletAddress: walletAddress });
			if (!user) {
				const newUser = new User({
					username: walletAddress,
					walletAddress,
				});
				const savedUser = await newUser.save();
				req.session.user = savedUser._id;
				return res
					.status(200)
					.json({ success: true, user: req.session.user });
			} else {
				req.session.user = user._id;
				return res
					.status(200)
					.json({ success: true, user: req.session.user });
			}
		} catch (err) {
			console.error(err);
			return res.status(500).json({ error: "Internal server error" });
		}
	});
}

router.get("/session", (req, res) => {
	if (!req.session.user) {
		return res.status(401).json({ error: "Unauthorized!" });
	}
	return res.status(200).json({ success: true, session: req.session.user });
});

router.get("/logout", (req, res) => {
	req.session.destroy((err) => {
		if (err) {
			console.error(err);
			return res.status(500).json({ error: "Failed to logout!" });
		}
		return res.status(200).json({ success: true, message: "Logged out!" });
	});
});

module.exports = router;
