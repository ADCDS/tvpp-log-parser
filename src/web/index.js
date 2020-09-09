// @flow
const express = require("express");

const mainApp = express();

mainApp.set("views", "./src/web/views");
mainApp.set("view engine", "pug");

mainApp.use(express.static("./dist"));

mainApp.get("/", (req, res) => {
	res.render("index");
});

mainApp.get("/charts", (req, res) => {
	res.render("graphs_gen");
});

mainApp.listen(3000, () => {
	console.log("TVPP Log Parser is running on port 3000!");
});
