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
	`Click "Sign" to sign in. No password needed!
	This request will not trigger a blockchain transaction or cost any gas fees.
    I accept the Auro Test zkApp Terms of Service: https://test-zkapp.aurowallet.com
	data: ${req.session.token}
	wallet: ${walletAddress}`;
	req.message = message;
	res.send(message);
});

router.post("/", (req, res) => {
	const { walletAddress, signature } = req.body;
	const verifyBody = {
		data: req.message,
		wallet: walletAddress,
		signature: signature,
	};
	const verifyResult = signerClient.verifyMessage(verifyBody);
	if (verifyResult && req.session.token) {
	// Create user if not exists
		User.findOne
		({ walletAddress: walletAddress }, (err, user) => {
			if (err) {
				console.error(err);
				return res.status(500).json({ error: err.message });
			}
			if (!user) {
				const newUser = new User({ walletAddress });
				newUser.save((err, user) => {
					if (err) {
						console.error(err);
						return res.status(500).json({ error: err.message });
					}
					req.session.user = user;
					return res.json({ success: true, user: req.session.user });
				});
			} else {
				req.session.user = user;
				return res.json({ success: true, user: req.session.user });
			}
		});
	} else {
		res.status(401).json({ error: "Invalid signature or didn't have session token" });
	}
});


module.exports = router;
