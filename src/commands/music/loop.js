module.exports = {
	name: 'loop',
	description: "Toggle music loop",
	cooldown: 5,
	execute(client, message) {
		const serverQueue = message.client.queue.get(message.guild.id);
		if (!serverQueue) return message.channel.send('There is nothing playing.');

		// toggle from false to true and reverse
		serverQueue.loop = !serverQueue.loop;
		return serverQueue.textChannel
			.send(`Loop is now ${serverQueue.loop ? "**on**" : "**off**"}`)
			.catch(console.error);
	}
};