const config = require('../../config/config.json');

module.exports = {
	PREFIX: config.botConfig.prefix,
	TOKEN: config.botConfig.token,
	BOT_LOGO: config.botConfig.logo,
	BOT_OWNER: config.userConfig.botOwner,
	SERVER_ADMINS: config.userConfig.serverAdmin,
	SERVER_MODS: config.userConfig.serverMod,
	SERVER_PIXIES: config.userConfig.serverPixie,
	YOUTUBE_API: config.apiKeys.youtube,
	SAUCENAO_API: config.apiKeys.sauceNAO
};