import mongoose from "mongoose";

const connectDB = async () => {
	try {
		await mongoose.connect(process.env.MONGO_URI, {});

		const db = connection.db;

		if (!db) {
			console.error("Failed to get MongoDB database.");
			return;
		}

		console.log(
			`MongoDB connected to ${connection.host} with url: ${process.env.MONGO_URI}`
		);

		// Koleksiyonları kontrol et ve gerekiyorsa oluştur
		const collections = await db.collections();

		const existingCollections = collections.map(
			(collection) => collection.collectionName
		);
		const models = Object.keys(mongoose.models);
		const modelNames = models.map((model) => model.toLowerCase() + "s");

		for (const model of modelNames) {
			if (!existingCollections.includes(model)) {
				await db.createCollection(model);
				console.log(`Collection ${model} created.`);
			}
		}
	} catch (error) {
		console.error(error);
		process.exit(1);
	}
};

export default connectDB;
