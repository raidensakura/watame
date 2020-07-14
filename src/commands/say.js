module.exports = {
	name: 'say',
	cooldown: 5,
	description: 'Makes the bot say something in chat.',
	guildOnly: true,
	args: true,
	execute(client, message, args) {
		let saytext = args.join(" ");
		client.logger.log(`${message.author.tag} made me say "${saytext}".`);
		message.channel.send(saytext);
		try {
			message.delete();
		} catch (ex) {
			client.logger.error(ex);
		}
	},
};