const express = require("express");
const router = express.Router();
const passport = require("passport");

// Login route
router.post("/login", (req, res, next) => {
	passport.authenticate("local", (err, user, info) => {
		if (err) {
			console.error(err);
			return res.status(500).json({ error: err.message });
		}
		if (!user) {
			return res.status(401).json({ error: "Invalid email or password" });
		}
		req.logIn(user, (err) => {
			if (err) {
				console.error(err);
				return res.status(500).json({ error: err.message });
			}
			return res.json({ success: true, user });
		});
	})(req, res, next);
});

module.exports = router;
