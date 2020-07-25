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
const UplWhitelist = DBManager.GetGlobalDatabase("upl_whitelist");
const FileCache = DBManager.GetGlobalDatabase("file_cache");

/* REQUEST MANAGER */
Router.get("/", async (Request, Response, Callback) => {
	var IPAddress = Request.connection.remoteAddress;
	var Client = UplWhitelist.find((C) => (C.ip_address == IPAddress));
	if (Client == null) return Response.redirect("../denied");

	return Callback();
});

module.exports = Router;