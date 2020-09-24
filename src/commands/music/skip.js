const { canModifyQueue } = require("../../modules/Utils");

module.exports = {
	name: "skip",
	aliases: ["s"],
	description: "Skip the currently playing song",
	execute(client, message) {
		const queue = message.client.queue.get(message.guild.id);
		if (!queue)
			return message.reply("There is nothing playing that I could skip for you.")
				.catch((e) => { client.logger.error(e) });
		if (!canModifyQueue(message.member)) return;

		queue.playing = true;
		queue.connection.dispatcher.end();
		queue.textChannel.send(`${message.author} ⏭ skipped the song`)
			.catch((e) => { client.logger.error(e) });
	}
};