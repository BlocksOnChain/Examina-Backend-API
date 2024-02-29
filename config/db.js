const mongoose = require("mongoose");

const connectDB = async () => {
	try {
		const conn = await mongoose.connect(process.env.MONGO_URI, {});

		console.log(`MongoDB connected: to ${conn.connection.host} with url: ${process.env.MONGO_URI}`);
	} catch (error) {
		console.error(error);
		process.exit(1);
	}
};

module.exports = connectDB;
