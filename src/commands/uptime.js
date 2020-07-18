const ms = require("ms");
const Discord = require('discord.js')
module.exports = {
	name: 'uptime',
	description: 'Shows bot uptime',
	aliases: ['time'],
	async execute(client, message) {
		const embed = new Discord.MessageEmbed()
			.setColor('#F47FFF')
			.setTitle(`${client.user.username}'s Uptime`)
			.setDescription(`I have been running for ${ms(client.uptime, { long: true })}`);
		return message.channel.send(embed);
	},
};