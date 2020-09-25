const { canModifyQueue } = require("../../modules/Utils");

module.exports = {
	name: "resume",
	aliases: ["r"],
	description: "Resume currently playing music",
	execute(client, message) {
		const queue = message.client.queue.get(message.guild.id);
		if (!queue) return message.reply("There is nothing playing.");
		if (!canModifyQueue(message.member)) return;

		if (!queue.playing) {
			queue.playing = true;
			queue.connection.dispatcher.resume();
			return queue.textChannel.send(`${message.author} ▶ resumed the music!`);
		}

		return message.reply("The queue is not paused.");
	}
};