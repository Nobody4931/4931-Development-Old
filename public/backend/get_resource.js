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

/* REQUEST MANAGER */
Router.get("/icon.uwu", async (Request, Response) => 
	(Request.query != null && Request.query["type"] == "discord") ?
		Response.sendFile(`${process.cwd()}/resources/files/dis_cord.png`) :
		Response.sendFile(`${process.cwd()}/resources/files/favicon.png`));

Router.get("/video.uwu", async (Request, Response) => {
	if (Request.headers["referer"] != null) {
		if (Request.headers["referer"].match(/4931\.myftp\.org.*\/files\/apply\/sent/) != null)
			return Response.sendFile(`${process.cwd()}/resources/files/music-6.mp4`);
		if (Request.headers["referer"].match(/4931\.myftp\.org.*\/files\/apply\/denied/) != null)
			return Response.sendFile(`${process.cwd()}/resources/files/music-5.mp4`);
		if (Request.headers["referer"].match(/4931\.myftp\.org.*\/files\/apply/) != null)
			return Response.sendFile(`${process.cwd()}/resources/files/music-4.mp4`);
		if (Request.headers["referer"].match(/4931\.myftp\.org.*\/files\/denied/) != null)
			return Response.sendFile(`${process.cwd()}/resources/files/music-3.mp4`);
		if (Request.headers["referer"].match(/4931\.myftp\.org.*\/404/) != null)
			return Response.sendFile(`${process.cwd()}/resources/files/music-2.mp4`);
		if (Request.headers["referer"].match(/4931\.myftp\.org.*/) != null)
			return Response.sendFile(`${process.cwd()}/resources/files/music-1.mp4`);
	}

	Response.status(400).send("no lol");
});

module.exports = Router;