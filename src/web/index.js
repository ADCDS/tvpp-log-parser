// @flow
const express = require("express");

const app = express();

app.set("views", "./src/web/views");
app.set("view engine", "pug");

app.use(express.static("./dist"));

app.get("/", (req, res) => {
	res.render("index", { title: "Hey", message: "Hello there!" });
});

app.listen(3000, () => {
	console.log("TVPP log parser is running on port 80!");
});
