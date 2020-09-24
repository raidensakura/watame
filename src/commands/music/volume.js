const { canModifyQueue } = require("../../modules/Utils");

module.exports = {
	name: "volume",
	aliases: ["v"],
	description: "Change volume of currently playing music",
	execute(client, message, args) {
		const queue = message.client.queue.get(message.guild.id);

		if (!queue) return message.reply("There is nothing playing.")
			.catch((e) => { client.logger.error(e) });
		if (!canModifyQueue(message.member))
			return message.reply("You need to join a voice channel first!")
				.catch((e) => { client.logger.error(e) });

		if (!args[0]) return message.reply(`🔊 The current volume is: **${queue.volume}%**`)
			.catch((e) => { client.logger.error(e) });
		if (isNaN(args[0])) return message.reply("Please use a number to set volume.")
			.catch((e) => { client.logger.error(e) });
		if (parseInt(args[0], 10) > 100 || parseInt(args[0], 10) < 0)
			return message.reply("Please use a number between 0 - 100.")
				.catch((e) => { client.logger.error(e) });

		queue.volume = args[0];
		queue.connection.dispatcher.setVolumeLogarithmic(args[0] / 100);

		return queue.textChannel.send(`Volume set to: **${args[0]}%**`)
			.catch((e) => { client.logger.error(e) });
	}
};