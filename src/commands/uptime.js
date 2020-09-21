const EmbedGenerator = require('../modules/sendEmbed');

const ms = require("ms");

module.exports = {
	name: 'uptime',
	description: 'Shows bot uptime',
	aliases: ['time'],
	async execute(client, message) {
		let uptime = ms(client.uptime, { long: true });
		return message.channel.send(EmbedGenerator.generate(`${client.user.username}'s Uptime`)
			.setColor('#F47FFF')
			.setDescription(`${uptime}`));
	},
};