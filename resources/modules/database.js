/* EXTERNAL MODULES */
const Fs = require("fs");

/* VARIABLES */
const GDatabases = {};
const LDatabases = {};

/* MODULE EXPORTING */
module.exports = {
	// Global databases (Savable)
	["GetGlobalDatabase"]: function(Name = "", Default = {}) {
		if (GDatabases[Name] == null) {
			try {
				GDatabases[Name] = JSON.parse(Fs.readFileSync(`resources/datastore/${Name}.json`, `utf8`));
			} catch {
				GDatabases[Name] = Default;
				Fs.writeFileSync(`resources/datastore/${Name}.json`, JSON.stringify(GDatabases[Name], null, 4), { encoding: "utf8" });
			}
		}

		return GDatabases[Name];
	},

	["SaveGlobalDatabase"]: function(Name = "") {
		if (GDatabases[Name] == null)
			return false;
		Fs.writeFileSync(`resources/datastore/${Name}.json`, JSON.stringify(GDatabases[Name], null, 4), { encoding: "utf8" });
	},

	// Local databases (Unsavable)
	["GetLocalDatabase"]: function(Name = "", Default = {}) {
		if (LDatabases[Name] == null)
			LDatabases[Name] = Default;
		return LDatabases[Name];
	}
};