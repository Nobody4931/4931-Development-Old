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

DBManager.GetGlobalDatabase("upl_whitelist", [{ username: "Nobody4931", ip_address: "::ffff:192.168.1.1", permission_level: 4931 }]);
DBManager.GetGlobalDatabase("upl_oauth", []);
DBManager.GetGlobalDatabase("file_cache", {});

/* BACKEND */
App.use("/", require("./public/backend/get_resource.js"));
App.use("/", require("./public/backend/nsbs_manager.js"));
App.use("/files/apply", require("./public/backend/uplapp_manager.js"));
App.use("/files/upload", require("./public/backend/upload_manager.js"));
App.get("*/script.js", async (Request, Response) => Response.redirect(`/404`));
App.get("/discord.uwu", async (Request, Response) => Response.sendFile(`${__dirname}/resources/files/dis_cord.html`));

/* FRONTEND */
App.use(Express.static(`${__dirname}/public/frontend`, { index: "index.html" }));
App.use("/files", Express.static(`${__dirname}/public/data/files`));
App.get("*", async (Request, Response) => Response.redirect(`/404`));

/* WEBSERVER STARTUP */
App.listen(Options.Port, async () => {
	console.log(`Server successfully started on port ${Options.Port}`);
});