module.exports = {
	name: 'uptime',
	description: 'Shows bot uptime',
	aliases: ['time'],
	async execute(client, message) {
		const ms = require("ms");
		return message.reply(`I have been running for ${ms(client.uptime)}`)
	},
};