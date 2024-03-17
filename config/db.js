const mongoose = require("mongoose");

const connectDB = async () => {
	try {
		const conn = await mongoose.connect(process.env.MONGO_URI, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		});

		console.log(
			`MongoDB connected: to ${conn.connection.host} with url: ${process.env.MONGO_URI}`
		);
		// create collections from models in mongo db if they are not already created
		const collections = await conn.db.listCollections().toArray();
		const models = Object.keys(mongoose.models);
		const modelNames = models.map((model) => model.toLowerCase() + "s");
		modelNames.forEach(async (model) => {
			if (!collections.some((collection) => collection.name === model)) {
				await conn.db.createCollection(model);
			}
		});
	} catch (error) {
		console.error(error);
		process.exit(1);
	}
};

module.exports = connectDB;
