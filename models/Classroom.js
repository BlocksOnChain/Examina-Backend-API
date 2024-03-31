import { Schema, model } from "mongoose";

const ClassroomSchema = new Schema({
	name: {
		type: String,
		required: true,
	},
	students: [
		{
			type: Schema.Types.ObjectId,
			ref: "User",
		},
	],
	teacher: {
		type: Schema.Types.ObjectId,
		ref: "User",
	},
}, autoCreate=  true);

export default model("Classroom", ClassroomSchema);
