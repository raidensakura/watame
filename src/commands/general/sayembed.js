const EmbedGenerator = require('../../modules/sendEmbed');
module.exports = {
	name: 'sayembed',
	cooldown: 5,
	description: 'Makes the bot say something in chat with embedding.',
	guildOnly: true,
	args: true,
	execute(client, message, args) {
		let saytext = args.join(" ");
		message.channel.send(EmbedGenerator.generate(`${saytext}`));
		try {
			message.delete();
		} catch (ex) {
			client.logger.error(ex);
		}
	},
};