import express from "express";
import { config } from "dotenv";
import cors from "cors";
import morgan from "morgan";
import { engine } from "express-handlebars";
import connectDB from "./config/db.js";
import compression from "compression";
import session from "express-session";
import pkg from 'memorystore';
import index from "./routes/index.js"
import * as exams from "./routes/exams.js";
import register from "./routes/register.js"
import login from "./routes/login.js"
import classroom from "./routes/classroom.js"
import user from "./routes/user.js"
import questions from "./routes/questions.js"
const { session: _session } = pkg;
config({ path: "./config/config.env" });

connectDB();

const app = express();

app.use(compression());


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
var sess = {
	secret: "examina the best",
	cookie: { secure: false },
	resave: false,
	saveUninitialized: true,
};

if (app.get("env") === "production") {
	app.set("trust proxy", 1); // trust first proxy
	sess.store = new MemoryStore({
		checkPeriod: 86400000, // prune expired entries every 24h
	});
	app.use(
		cors({
			origin: [
				"http://localhost:3000/",
				"https://examina.space",
				"https://examina.space/",
				"https://www.examina.space/",
				"https://www.examina.space",
			],
			credentials: true,
		})
	);
}

sess.store = new session.MemoryStore({
	checkPeriod: 86400000, // prune expired entries every 24h
});

app.use(session(sess));
if (process.env.NODE_ENV === "development") {
	app.use(morgan("dev"));
}

app.engine(".hbs", engine({ defaultLayout: "main", extname: ".hbs" }));
app.set("view engine", ".hbs");

app.use("/", index);
app.use("/exams", exams);
app.use("/register", register);
app.use("/login", login);
app.use("/classroom", classroom);
app.use("/user", user);
app.use("/questions", questions);

const PORT = process.env.PORT || 5000;
app.listen(
	PORT,
	console.log(
		`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
	)
);

export default app;
