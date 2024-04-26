const express = require("express");
const dotenv = require("dotenv");
var cors = require("cors");
const morgan = require("morgan");
const exphbs = require("express-handlebars");
const connectDB = require("./config/db");
const compression = require("compression");
const path = require("path");
const session = require("express-session");
var MongoDBStore = require('connect-mongodb-session')(session);
dotenv.config({ path: "./config/config.env" });

connectDB();
var store = new MongoDBStore({
	uri: `${process.env.MONGO_URI}connect_mongodb_session_test`,
	collection: 'mySessions'
});

// Catch errors
store.on('error', function(error) {
	console.log(error);
});

const app = express();

app.use(compression());

app.use(express.static(path.join(__dirname, "public")));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
var sess = {
	secret: "examina the best",
	cookie: { secure: false, maxAge: 1000 * 60 * 60 * 24 },
	resave: false,
	saveUninitialized: true,
};
app.use(
	cors({
		origin: [
			"http://localhost:3001",
			"https://examina.space",
			"https://examina.space/",
			"https://www.examina.space/",
			"https://www.examina.space",
			"https://www.choz.io",
			"https://choz.io",
			"https://choz.io/",
			"https://www.choz.io/"
		],
		credentials: true,
	})
);
app.set("trust proxy", 1); // trust first proxy;

sess.store = store;

app.use(session(sess));
if (process.env.NODE_ENV === "development") {
	app.use(morgan("dev"));
}

app.engine(".hbs", exphbs.engine({ defaultLayout: "main", extname: ".hbs" }));
app.set("view engine", ".hbs");

app.use("/", require("./routes/index"));
app.use("/exams", require("./routes/exams"));
app.use("/register", require("./routes/register"));
app.use("/login", require("./routes/login"));
app.use("/user", require("./routes/user"));
app.use("/questions", require("./routes/questions"));

module.exports = app;
