import { Schema, model } from "mongoose";
//const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
	username: {
		type: String,
		required: true,
	},
	email: {
		type: String
	},
	walletAddress: {
		type: String,
		required: true,
	},
}, autoCreate=  true);

export default model("User", userSchema);
