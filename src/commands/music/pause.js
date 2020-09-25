const { canModifyQueue } = require("../../modules/Utils");

module.exports = {
	name: "pause",
	description: "Pause the currently playing music",
	execute(client, message,) {
		const queue = message.client.queue.get(message.guild.id);
		if (!queue) return message.reply("There is nothing playing.");
		if (!canModifyQueue(message.member)) return;

		if (queue.playing) {
			queue.playing = false;
			queue.connection.dispatcher.pause(true);
			return queue.textChannel.send(`${message.author} ⏸ paused the music.`);
		}
	}
};