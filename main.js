/* EXPRESS.JS */
const Express = require("express");
const App = Express();

/* EXTERNAL MODULES */
const BodyParser = require("body-parser");
const Multer = require("multer");
const Fs = require("fs");

/* INTERNAL MODULES */
const Generator = require("./resources/modules/generator.js");
const DBManager = require("./resources/modules/database.js");
const Options = require("./resources/modules/options.json");

/* INITIALIZATION */
App.disable("x-powered-by");
App.use(BodyParser.urlencoded({ extended: false }));
App.use(BodyParser.json());

/* BACKEND */
App.use("/", require("./public/backend/getResource.js"));
App.get("*/script.js", async (Request, Response) => Response.redirect(`/404`));

/* FRONTEND */
App.use(Express.static(`${__dirname}/public/frontend`, { index: "index.html" }));
App.use("/files", Express.static(`${__dirname}/public/files`));
App.get("*", async (Request, Response) => Response.redirect(`/404`));

/* WEBSERVER STARTUP */
App.listen(Options.Port, async () => {
	console.log(`Server successfully started on port ${Options.Port}`);
});