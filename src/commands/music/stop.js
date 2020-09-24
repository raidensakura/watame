const { canModifyQueue } = require("../../modules/Utils");

module.exports = {
	name: "stop",
	description: "Stops the music",
	execute(client, message) {
		const queue = message.client.queue.get(message.guild.id);

		if (!queue) return message.reply("There is nothing playing.")
			.catch((e) => { client.logger.error(e) });
		if (!canModifyQueue(message.member)) return;

		queue.songs = [];
		queue.connection.dispatcher.end();
		queue.textChannel.send(`${message.author} ⏹ stopped the music!`)
			.catch((e) => { client.logger.error(e) });
	}
};