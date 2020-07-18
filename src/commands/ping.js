const Discord = require('discord.js');
module.exports = {
	name: 'ping',
	cooldown: 5,
	description: 'Ping!',
	guildOnly: true,
	async execute(client, message) {
		const pingUpdate = new Discord.MessageEmbed()
			.setColor('#F47FFF')
			.setTitle('Pinging...')
		message.channel.send(pingUpdate).then(msg => {
			let embed = new Discord.MessageEmbed()
				.setColor('#F47FFF')
				.setTitle('Pong!')
				.setDescription(`${client.user.username}'s ping is \`${Math.round(msg.createdTimestamp - message.createdTimestamp)}ms\`\nWebSocket ping is \`${Math.round(client.ws.ping)}ms\``)
				.setFooter(`${client.user.username} ❤ ${message.author.username}`);
			msg.edit(embed)
		});
	},
};