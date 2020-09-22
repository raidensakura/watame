const muteModel = require('../../data/models/Mute.js');

module.exports = {
	name: 'unmute',
	description: 'Unmute a user.',
	usage: '<user>',
	guildOnly: true,
	staffOnly: true,
	args: true,
	async execute(client, message, args) {
		let muterole = message.guild.roles.cache.find(role => role.name === "Muted");

		if (!muterole) {
			try {
				muterole = await message.guild.roles.create({
					data: {
						name: 'Muted',
						permissions: []
					},
					reason: 'Mute role creation'
				});
				client.logger.log(`Created "${muterole.name}" role in ${message.guild.name} server`);
				message.guild.channels.cache.forEach(async (channel, id) => {
					await channel.updateOverwrite(muterole, {
						SEND_MESSAGES: false,
						ADD_REACTION: false,
					});
				});
				client.logger.log(`Updated all channel overrides for the role.`);
			} catch (error) {
				client.logger.error(`Error creating Mute role: ${error.stack}`);
				return message.reply('there was an error trying to create mute role for this server.');
			}
		}

		let toUnmute = await message.guild.member(message.mentions.members.first()
			|| message.guild.members.cache.get(args[0]));

		if (!toUnmute) return message.reply('No user was found.');

		if (toUnmute.roles.cache.some(role => role.name === 'Muted')) {
			toUnmute.roles.remove(muterole.id);
			message.channel.send(`${toUnmute} has been unmuted.`)

			let rowCount = await muteModel.destroy({ where: { uid: toUnmute.id, serverid: message.guild.id } });
			if (!rowCount) return client.logger.log('that tag did not exist.');
			else return client.logger.log('Tag entry successfully deleted.');
		} else {
			return message.reply(`That user isn't muted.`)
		}
	}
}