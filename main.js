/* EXPRESS.JS */
const Express = require("express");
const App = Express();
App.disable("x-powered-by");

/* EXTERNAL MODULES */
const BodyParser = require("body-parser");
const Multer = require("multer");
const Fs = require("fs");

/* INTERNAL MODULES */
const Generator = require("./resources/modules/generator.js");
const DBManager = require("./resources/modules/database.js");
const Options = require("./resources/modules/options.json");

/* BACKEND */
// None so far!

/* FRONTEND */
App.use(Express.static(`${__dirname}/public/frontend`, { index: "index.html" }));
App.get("/icon.uwu", async (Request, Response) => Response.sendFile(`${__dirname}/resources/files/favicon.png`));
App.get("*", async (Request, Response) => Response.redirect(`/404`));

/* WEBSERVER STARTUP */
App.listen(Options.Port, async () => {
	console.log(`Server successfully started on port ${Options.Port}`);
});