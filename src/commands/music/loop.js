module.exports = {
	name: 'loop',
	description: "Toggle music loop",
	aliases: ['repeat', 'l', 'r'],
	cooldown: 5,
	execute(client, message) {
		const serverQueue = message.client.queue.get(message.guild.id);
		if (!serverQueue) return message.channel.send('There is nothing playing.');

		// toggle from false to true and reverse
		serverQueue.loop = !serverQueue.loop;
		return serverQueue.textChannel
			.send(`:repeat: Loop is now ${serverQueue.loop ? "**on**" : "**off**"}`)
			.catch(console.error);
	}
};