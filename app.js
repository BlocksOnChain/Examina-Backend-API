const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const exphbs = require("express-handlebars");
const connectDB = require("./config/db");
const compression = require("compression");
var Client = require("mina-signer");
var session = require('express-session');

dotenv.config({ path: "./config/config.env" });

connectDB();

const app = express();

app.use(compression());

app.use(express.static(path.join(__dirname, "public")));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === "development") {
	app.use(morgan("dev"));
}

app.engine(".hbs", exphbs.engine({ defaultLayout: "main", extname: ".hbs" }));
app.set("view engine", ".hbs");

app.use("/", require("./routes/index"));
app.use("/exams", require("./routes/exams"));
app.use("/register", require("./routes/register"));
app.use("/login", require("./routes/login"));
app.use("/classroom", require("./routes/classroom"));

var sess = {
	secret: 'keyboard cat',
	cookie: {}
}

if (app.get('env') === 'production') {
	app.set('trust proxy', 1) // trust first proxy
	sess.cookie.secure = true // serve secure cookies
	sess.cookie.maxAge = 60000 * 60 * 24 // 1 day
}

app.use(session(sess));
const PORT = process.env.PORT || 5000;
// mainnet or testnet
export const signerClient = new Client({ network: "testnet" });
app.listen(
	PORT,
	console.log(
		`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
	)
);
