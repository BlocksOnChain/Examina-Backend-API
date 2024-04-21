const app = require("./app");


const PORT = process.env.PORT || 3005;

app.listen(
	PORT,
	console.log(
		`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
	)
);