const express = require("express");
const router = express.Router();
const passport = require("passport");
// TODO: Create a User Model
const User = require("../models/User");

router.post("/register", (req, res) => {
	const { email, password } = req.body;
	const newUser = new User({ email });
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
