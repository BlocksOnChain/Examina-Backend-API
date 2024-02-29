const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/User");
var Client = require("mina-signer");
// mainnet or testnet
const signerClient = new Client({ network: "testnet" });
router.get('/register', (req, res) => {
	res.render('register');
});

router.post("/register_with_email", (req, res) => {
	const { email, password, walletAddress } = req.body;
	const newUser = new User({ email, walletAddress });
	User.register(newUser, password, (err, user) => {
		if (err) {
			console.error(err);
			return res.status(500).json({ error: err.message });
		}
		passport.authenticate("local")(req, res, () => {
			req.session.user = user;
			res.json({ success: true, user: req.session.user });
		});
	});
});

router.get("/session/get-message-to-sign/:walletAddress", (req, res) => {
	const { walletAddress } = req.params;
	const token = Math.random().toString(36).substring(7);
	// save token to user's session
	req.session.token = token;
	const message =
		`${req.session.token}${walletAddress}`;
	req.session.message = message;
	console.log(req.session.message);
	res.json({ "message": message });
});

router.post("/", async (req, res) => {
	const { walletAddress, signature } = req.body;
	var signture = typeof signature === "string" ? JSON.parse(signature) : signature;
	const verifyBody = {
		data: req.session.message,
		publicKey: walletAddress,
		signature: signture,
	}
	const verifyResult = signerClient.verifyMessage(verifyBody);
	if (!verifyResult && req.session.token) {
		// Create user if not exists
		const user = await User.find({ walletAddress: walletAddress })
		if (user.length == 0) {
			const newUser = new User({ walletAddress });
				await newUser.save();
				req.session.user = newUser._id;
				return res.json({ success: true, user: req.session.user._id });
		} else {
			req.session.user = newUser._id;
			return res.json({ success: true, user: req.session.user._id });
		}
	} else {
	res.status(401).json({ token: req.session.token, error: "Invalid signature or didn't have session token" });
}
});

router.get("/session/", (req, res) => {
	res.json({ user: req.session.user_id });
});

module.exports = router;
