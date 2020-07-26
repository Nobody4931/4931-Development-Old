/* EXPRESS.JS */
const Express = require("express");
const Router = Express.Router();

/* EXTERNAL MODULES */
const BodyParser = require("body-parser");
const FFmpeg = require("fluent-ffmpeg");
const Multer = require("multer");
const Path = require("path");
const Fs = require("fs");

/* INTERNAL MODULES */
const Generator = require("../../resources/modules/generator.js");
const DBManager = require("../../resources/modules/database.js");
const Options = require("../../resources/modules/options.json");

/* VARIABLES */
const UplWhitelist = DBManager.GetGlobalDatabase("upl_whitelist");
const FileCache = DBManager.GetGlobalDatabase("file_cache");

const ExtSupport = [".png", ".jpg", ".jpeg", ".gif", ".mp4", ".mov", ".avi"];
const FileHndl = Multer({ dest: `${process.cwd()}/public/data/tmp` }).single("uploaded_file");

/* FUNCTIONS */
const Reject = function(UplFile, Response, Rejection) {
	if (UplFile != null) {
		while (Fs.existsSync(UplFile.path))
			try { Fs.unlinkSync(UplFile.path) } catch { };
	}
	Response.status(400).send(Rejection);
}

/* REQUEST MANAGER */
Router.get("/", async (Request, Response, Callback) => {
	var IPAddress = Request.connection.remoteAddress;
	var Client = UplWhitelist.find((C) => (C.ip_address == IPAddress));
	if (Client == null) return Response.redirect("../denied");

	return Callback();
});

Router.post("/", async (Request, Response) => {
	var IPAddress = Request.connection.remoteAddress;
	var Client = UplWhitelist.find((C) => (C.ip_address == IPAddress));
	if (Client == null) return Response.status(400).send({ success: false, error: "access_denied" });

	var Arguments = Request.body;
	var Method = Arguments["method"];

	if (Method == null) return Response.status(400).send({ success: false, error: "invalid_method" });
	if (typeof Method != "string") return Response.status(400).send({ success: false, error: "invalid_method" });

	switch (Method) {
		case "query_files":
			var QryStart = Arguments["start"];
			var QryLimit = Arguments["limit"];

			if (QryStart == null) return Response.status(400).send({ success: false, error: "invalid_parameters" });
			if (QryLimit == null) return Response.status(400).send({ success: false, error: "invalid_parameters" });
			if (typeof QryStart != "number") return Response.status(400).send({ success: false, error: "invalid_parameters" });
			if (typeof QryStart != "number") return Response.status(400).send({ success: false, error: "invalid_parameters" });

			var Payload = [];
			var Files = Object.entries(FileCache);
			for (var i = Files.length - 1 - QryStart; i >= 0 && i >= Files.length - 1 - QryLimit; i--) {
				var [Identifier, Metadata] = Files[i];
				Payload.push({
					["identifier"]: Identifier,
					["uploader"]: Metadata.uploader,
					["deletable"]: (Metadata.protection_level <= Client.permission_level),
					["link"]: Metadata.link,
					["thumbnail"]: Metadata.thumbnail
				});
			}

			return Response.status(200).send({ success: true, data: Payload });
		default:
			return Response.status(400).send({ success: false, error: "invalid_method" });
	}
});

Router.put("/", FileHndl, async (Request, Response) => {
	var IPAddress = Request.connection.remoteAddress;
	var Client = UplWhitelist.find((C) => (C.ip_address == IPAddress));
	if (Client == null) return Reject(Request.file, Response, { success: false, error: "access_denied" });

	var UplFile = Request.file;
	if (UplFile == null) return Reject(UplFile, Response, { success: false, error: "file_missing" });
	var FileExt = Path.extname(UplFile.originalname).toLowerCase();

	if (UplFile.size > 16 * 1024 * 1024) 
		return Reject(UplFile, Response, { success: false, error: "file_size" });
	if (ExtSupport.includes(FileExt) == false)
		return Reject(UplFile, Response, { success: false, error: "file_unsupported" });
	
	// File host process
	var Identifier = Generator.RandomString(32, "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz");
	while (FileCache[Identifier] != null)
		Identifier = Generator.RandomString(32, "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz");
	
	try {
		FileCache[Identifier] = {};
		FileCache[Identifier].original_name = UplFile.originalname;
		FileCache[Identifier].uploader = Client.username;
		FileCache[Identifier].uploader_ip = Client.ip_address;
		FileCache[Identifier].protection_level = Client.permission_level;
		FileCache[Identifier].link = `/files/${Identifier}${FileExt}`;
		FileCache[Identifier].thumbnail = (ExtSupport.indexOf(FileExt) > 3) ? `/files/${Identifier}.png` : `/files/${Identifier}${FileExt}`;

		Fs.renameSync(UplFile.path, `public/data/files/${Identifier}${FileExt}`);
		if (ExtSupport.indexOf(FileExt) > 3) {
			new FFmpeg(`public/data/files/${Identifier}${FileExt}`)
				.setFfmpegPath("/FFmpeg/ffmpeg.exe")
				.takeScreenshots({
					count: 1,
					timemarks: ["25%"],
					folder: `public/data/files/`,
					filename: `${Identifier}.png`
				});
		}

		DBManager.SaveGlobalDatabase("file_cache");
	} catch {
		while (Fs.existsSync(`public/data/files/${Identifier}.png`))
			try { Fs.unlinkSync(`public/data/files/${Identifier}.png`) } catch { };
		return Reject(UplFile, Response, { success: false, error: "internal_error" });
	}

	Response.status(200).send({ success: true });
});

module.exports = Router;