const { canModifyQueue } = require("../../modules/Utils");

module.exports = {
	name: "loop",
	aliases: ['l'],
	description: "Toggle music loop",
	execute(client, message) {
		const queue = message.client.queue.get(message.guild.id);
		if (!queue) return message.reply("There is nothing playing.")
			.catch((e) => { client.logger.error(e) });
		if (!canModifyQueue(message.member)) return;

		// toggle from false to true and reverse
		queue.loop = !queue.loop;
		return queue.textChannel
			.send(`🔁 Loop is now ${queue.loop ? "**on**" : "**off**"}`)
			.catch((e) => { client.logger.error(e) });
	}
};