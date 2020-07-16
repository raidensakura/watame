module.exports = {
	name: 'ping',
	cooldown: 5,
	description: 'Ping!',
	guildOnly: true,
	execute(client, message) {
		const latency = Math.round(Date.now() - message.createdTimestamp);
		const apiLatency = Math.round(client.ws.ping);
		client.logger.log(`${message.author.tag} pinged me!`);
		message.channel.send({
			embed: {
				color: 16023551,
				title: "Pong!",
				description: `That took ${latency}ms, and ${client.ws.ping}ms for WebSocket`,
				footer: {
					text: `${client.user.username} ❤ ${message.author.username}`
				}
			}
		});
	},
};