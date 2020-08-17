/* EXPRESS.JS */
const Express = require("express");
const Router = Express.Router();

/* EXTERNAL MODULES */
const BodyParser = require("body-parser");
const Multer = require("multer");
const Fs = require("fs");

/* INTERNAL MODULES */
const Generator = require("../../resources/modules/generator.js");
const DBManager = require("../../resources/modules/database.js");
const Options = require("../../resources/modules/options.json");

/* VARIABLES */
var VerPayload = {
	["ver"]: Options.NSBS.Version,
	["dls"]: {
		["exe"]: Options.NSBS.Downloads.Executable,
		["bgt"]: Options.NSBS.Downloads.BGTaskHndlr,
		["uni"]: Options.NSBS.Downloads.Uninstaller
	}
};

/* REQUEST MANAGER */
Router.get("/api/nsbs_ver.uwu", async (Request, Response) =>
	Response.status(200).send(VerPayload));

Router.get(Options.NSBS.Downloads.Executable, async (Request, Response) =>
	Response.status(200).sendFile(`${process.cwd()}/resources/files/nsbs.exe`));
Router.get(Options.NSBS.Downloads.BGTaskHndlr, async (Request, Response) =>
	Response.status(200).sendFile(`${process.cwd()}/resources/files/bgt.exe`));
Router.get(Options.NSBS.Downloads.Uninstaller, async (Request, Response) =>
	Response.status(200).sendFile(`${process.cwd()}/resources/files/unins.exe`));

module.exports = Router;