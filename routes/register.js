const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/User");

router.get('/register', (req, res) => {
    res.render('register');
});

router.post("/register", (req, res) => {
	const { email, password, walletAddress } = req.body;
	const newUser = new User({ email, walletAddress });
	User.register(newUser, password, (err, user) => {
		if (err) {
			console.error(err);
			return res.status(500).json({ error: err.message });
		}
		passport.authenticate("local")(req, res, () => {
			res.json({ success: true, user });
		});
	});
});

module.exports = router;
