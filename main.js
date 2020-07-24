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
App.get("/video.uwu", async (Request, Response) => (Request.headers["referer"] != null) ?
	(Request.headers["referer"].match(/4931\.myftp\.org.*\/404/) != null) ? 
		Response.sendFile(`${__dirname}/resources/files/music-2.mp4`) :
		(Request.headers["referer"].match(/4931\.myftp\.org/) != null) ?
			Response.sendFile(`${__dirname}/resources/files/music-1.mp4`) :
			Response.status(400).send("no u") :
		Response.status(400).send("no u"));
App.get("/icon.uwu", async (Request, Response) => Response.sendFile(`${__dirname}/resources/files/favicon.png`));

/* FRONTEND */
App.use(Express.static(`${__dirname}/public/frontend`, { index: "index.html" }));
App.get("*", async (Request, Response) => Response.redirect(`/404`));

/* WEBSERVER STARTUP */
App.listen(Options.Port, async () => {
	console.log(`Server successfully started on port ${Options.Port}`);
});