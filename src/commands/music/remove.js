const { canModifyQueue } = require("../../modules/Utils");

module.exports = {
	name: "remove",
	args: true,
	usage: '<Queue Number>',
	description: "Remove song from the queue",
	execute(client, message, args) {
		const queue = message.client.queue.get(message.guild.id);
		if (!queue) return message.channel.send("There is no queue.");
		if (!canModifyQueue(message.member)) return;

		if (isNaN(args[0])) return message.reply(`Input must be a number.`);

		const song = queue.songs.splice(args[0] - 1, 1);
		queue.textChannel.send(`${message.author} ❌ removed **${song[0].title}** from the queue.`);
	}
};