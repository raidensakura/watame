const Discord = require('discord.js');

const { BOT_URL } = require('../../data/config.js');

const EmbedGenerator = require('../../modules/sendEmbed');
module.exports = {
	name: 'ping',
	cooldown: 5,
	description: 'Ping!',
	guildOnly: true,
	async execute(client, message) {
		const pingUpdate = EmbedGenerator.generate('Pinging...').setFooter('Gathering all membersheep...')
		message.channel.send(pingUpdate).then(msg => {
			let embed = EmbedGenerator.generate()
				.setTitle('Pong!')
				.setURL(BOT_URL)
				.addField(`${client.user.username}'s latency:`, `${Math.round(msg.createdTimestamp - message.createdTimestamp)}ms`)
				.addField(`Websocket ping:`, `${Math.round(client.ws.ping)}ms`)
			msg.edit(embed)
		});
	},
};