const EmbedGenerator = require('../../modules/sendEmbed');

const isURL = require('is-url');

module.exports = {
	name: 'sayembed',
	cooldown: 5,
	description: 'Makes the bot say something in chat with embedding.',
	usage: '<title> | <title URL> | <description>',
	guildOnly: true,
	ownerOnly: true,
	args: true,
	execute(client, message, args) {
		args = args.join(" ");
		let arr = args.split('|');

		if (!arr[0] || !arr[1] || !arr[2]) {
			return message.reply('One on more parameter is missing.');
		}

		if (!isURL(arr[1])) {
			return message.reply('You provided an invalid URL');
		}

		try {
			message.delete();
			message.channel.send(EmbedGenerator.generate(`${arr[0]}`)
				.setURL(arr[1])
				.setDescription(arr[2]));
		} catch (ex) {
			message.reply(`Error sending embed: ${ex}`);
		}
	},
};