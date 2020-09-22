const { SAUCENAO_API } = require('../../data/config.js');
const checkImage = require("is-image-url");
const Sagiri = require("sagiri");
module.exports = {
	name: 'sauce',
	cooldown: 10,
	description: 'Search for the source of an uploaded image.',
	guildOnly: true,
	args: true,
	usage: '<url>',
	async execute(client, message, args) {
		// module needs Node.js 12 to work
		if (Number(process.version.slice(1).split(".")[0]) < 12)
			return message.channel.send("I'm sorry but Node.js 12 is required to run this command.");

		if (!SAUCENAO_API)
			return message.channel.send("SauceNAO API Key is missing from config file...");

		message.delete({ timeout: 2000 });
		message.channel.send('Give me a moment...');

		args[1] = args[1] == "list" ? 5 : 1;
		const saucenao = Sagiri(SAUCENAO_API, { "results": args[1] });

		if (!checkImage(args[0])) {
			return message.channel.send("The URL you specified is not an image. Please check your URL.");
		}

		try {
			let results = await saucenao(args[0]);
			message.channel.send({
				"embed": {
					"title": results[0].raw.data.title || `Image from ${results[0].site}`,
					"url": results[0].url,
					"color": 16023551,
					"footer": {
						"text": "Powered by SauceNAO search"
					},
					"image": { "url": results[0].thumbnail },
					"fields": [
						{ "name": "Similarity", "value": `${results[0].similarity}` },
						{ "name": "Artist", "value": `${results[0].raw.data.creator || `${results[0].raw.data.member_name} (${results[0].raw.data.member_id})`}` }
					]
				}
			});
		} catch(e) {
			client.logger.error(`on sauce.js for ${message.author.tag}: ${e}`);
		}
	},
};