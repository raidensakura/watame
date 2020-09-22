const yts = require('yt-search');

const EmbedGenerator = require('../../modules/sendEmbed');

module.exports = {
	name: 'live',
	description: 'Check channel stats for YouTube channels',
	usage: '<search query/channel name/ID>',
	aliases: ['youtube'],
	guildOnly: true,
	args: true,
	async execute(client, message, args) {
		try {
			let result = await yts(args.join(" "));
			message.channel.send(EmbedGenerator.generate(`${result.channels[0].name}`)
				.setURL(result.channels[0].url)
				.setDescription('YouTube Channel Statistics')
				.setThumbnail(result.channels[0].image)
				.addField('Subscribers', result.channels[0].subCountLabel)
				.addField('Video Count', result.channels[0].videoCount));
		} catch (e) {
			message.reply('No channel was found under that username, ID or URL');
		}
	},
};