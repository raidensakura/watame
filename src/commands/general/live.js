const { YOUTUBE_API } = require('../../data/config.js');

const { YouTube } = require('popyt');

const ms = require("ms");

const EmbedGenerator = require('../../modules/sendEmbed');

module.exports = {
	name: 'live',
	description: 'Check channel stats for YouTube channels',
	usage: '<channel name/ID/URL>',
	aliases: ['hololive'],
	cooldown: 10,
	guildOnly: true,
	args: true,
	async execute(client, message, args) {

		if (!YOUTUBE_API) return message.channel.send('YouTube API Key is missing from config file...');
		const youtube = new YouTube(YOUTUBE_API);

		const name = {
			"watame": "UCqm3BQLlJfvkTsX_hvm0UmA",
			"aqua": "UC1opHUrw8rvnsadT-iGp7Cg",
			"haato": "UC1CfXB_kRs3C-zaeTG3oGyg",
			"matsuri": "UCQ0UDLQCjY0rmuxCDE38FGg",
			"miko": "UC-hM6YJuNYVAmUWxeIr9FeA",
			"mio": "UCp-5t9SrOQwXMU7iIjQfARg",
			"ayame": "UC7fk0CB07ly8oSl0aqKkqFg",
			"sora": "UCp6993wxpyDPHUpavwDFqgg",
			"shion": "UCXTpFs_3PqI41qX2d9tL2Rw",
			"coco": "UCS9uQI-jC3DE0L4IpXyvr6w",
			"fubuki": "UCdn5BQ06XqgXoAxIhbqw5Rg",
			"rushia": "UCl_gCybOJRIgOXw6Qb4qJzQ",
			"pekora": "UC1DCedRgGHBdm81E1llLhOQ",
			"shirayuri": "UCl-3q6t6zdZwgIsFZELb7Zg",
			"lily": "UCl-3q6t6zdZwgIsFZELb7Zg",
			"shoukaku": "UCCirlk5tmz6rKH-ADGstPVA",
		};

		if (name[args[0].toLowerCase()]) {
			return getChannel(name[args[0].toLowerCase()]);
		} else {
			return getChannel(args.join(" "));
		}

		async function getChannel(query) {
			try {
				let channel = await youtube.getChannel(query);
				message.channel.send(EmbedGenerator.generate(`${channel.name}`)
					.setURL(channel.url)
					.setDescription('YouTube Channel Statistics')
					.setThumbnail(channel.profilePictures.medium.url)
					.addField('Subscribers', channel.subCount.toLocaleString())
					.addField('Total Views', channel.views.toLocaleString())
					.addField('Channel Creation', `${ms(Date.now() - Date.parse(channel.dateCreated), { long: true })} ago`));
			} catch (e) {
				message.reply('No channel was found under that username, ID or URL');
				client.logger.error(e);
			}
		}
	},
};