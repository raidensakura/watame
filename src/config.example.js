const config = {

	// Change prefix to your liking, defaults to "w!" if unset
	"prefix": "",

	// Obtain bot token here: https://discord.com/developers/applications/
	"token": "",

	// Obtain your ID by enabling developer mode on Discord
	"ownerID": "",

	// (Optional) Obtain sauceNAO API key here: https://saucenao.com/user.php
	"saucenaoAPIkey": "",

	// (Optional) Obtain YouTube API key here: https://developers.google.com/youtube/v3
	"youtubeAPIkey": "",

	// Database server config
	"db": {
		"dialect": "mariadb",
		"host": "",
		"username": "",
		"password": "",
		"database": "",
		"enableLogging": false,
		"charset": "utf8mb4"
	}


	// Rename file to config.js

};

module.exports = config;