/* EXPRESS.JS */
const Express = require("express");
const Router = Express.Router();

/* EXTERNAL MODULES */
const BodyParser = require("body-parser");
const FFmpeg = require("fluent-ffmpeg");
const Multer = require("multer");
const Axios = require("axios").default;
const Fs = require("fs");

/* INTERNAL MODULES */
const Generator = require("../../resources/modules/generator.js");
const DBManager = require("../../resources/modules/database.js");
const Options = require("../../resources/modules/options.json");

/* VARIABLES */
const UplWhitelist = DBManager.GetGlobalDatabase("upl_whitelist");
const UplOAuth = DBManager.GetGlobalDatabase("upl_oauth");

const OAuthScope = ["identify", "email"];
const OAuthAcGrt = `http://4931.myftp.org${Options.Port != 80 ? `:${Options.Port}` : ``}/files/apply/auth.uwu`;

/* FUNCTIONS */
const OAuthRedir = function(Response) {
	return Response.redirect(
		`https://discord.com/api/oauth2/authorize` +
		`?client_id=${Options.OAuth.Identifier}` +
		`&redirect_uri=${encodeURIComponent(OAuthAcGrt)}` +
		`&response_type=code` +
		`&scope=${encodeURI(OAuthScope.join(" "))}`
	);
}

/* REQUEST MANAGER */
Router.get("/auth.uwu", async (Request, Response) => {
	var IPAddress = Request.connection.remoteAddress;
	var Client = UplWhitelist.find((C) => (C.ip_address == IPAddress));
	var Appl = UplOAuth.find((A) => (A.ip_address == IPAddress));

	if (Client != null) return Response.redirect("./denied");
	if (Appl != null) return Response.redirect("./denied");

	var Arguments = Request.query;
	var AuthCode = Arguments["code"];
	if (AuthCode == null) return OAuthRedir(Response);

	try {
		var AuthForm = new URLSearchParams();
		AuthForm.append("code", AuthCode);
		AuthForm.append("client_id", Options.OAuth.Identifier);
		AuthForm.append("client_secret", Options.OAuth.Secret);
		AuthForm.append("grant_type", "authorization_code");
		AuthForm.append("redirect_uri", OAuthAcGrt);
		AuthForm.append("scope", OAuthScope.join(" "));

		var Authorization = await Axios({
			method: "POST",
			url: "https://discord.com/api/oauth2/token",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded"
			},
			data: AuthForm
		});

		var RefreshToken = Authorization.data["refresh_token"];
		var AccessToken = Authorization.data["access_token"];
		var Expiration = Authorization.data["expires_in"];
		var TokenType = Authorization.data["token_type"];
		var Scope = Authorization.data["scope"];

		var DClient = await Axios({
			method: "GET",
			url: "https://discord.com/api/v6/users/@me",
			headers: {
				authorization: `${TokenType} ${AccessToken}`
			}
		});

		var Email = DClient.data["email"];
		var Username = DClient.data["username"];
		var Identifier = DClient.data["id"];
		var Discriminator = DClient.data["discriminator"];

		if (RefreshToken == null) return OAuthRedir(Response);
		if (AccessToken == null) return OAuthRedir(Response);
		if (Expiration == null) return OAuthRedir(Response);
		if (TokenType == null) return OAuthRedir(Response);
		if (Scope == null) return OAuthRedir(Response);

		if (Email == null) return OAuthRedir(Response);
		if (Username == null) return OAuthRedir(Response);
		if (Identifier == null) return OAuthRedir(Response);
		if (Discriminator == null) return OAuthRedir(Response);

		UplOAuth.push({
			["ip_address"]: IPAddress,
			["oauth"]: {
				["refresh_token"]: RefreshToken,
				["access_token"]: AccessToken,
				["expiration"]: new Date().getTime() + (Expiration * 1000),
				["token_type"]: TokenType,
				["scope"]: Scope
			},
			["discord"]: {
				["email"]: Email,
				["username"]: Username,
				["discriminator"]: Discriminator,
				["tag"]: `${Username}#${Discriminator}`,
				["id"]: Identifier
			}
		});

		DBManager.SaveGlobalDatabase("upl_oauth");
	}
	catch { return OAuthRedir(Response) };

	return Response.redirect("./sent");
});

module.exports = Router;