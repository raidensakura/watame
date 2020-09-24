const { MessageEmbed, splitMessage, escapeMarkdown } = require("discord.js");

const { BOT_URL } = require('../../data/config.js');

const EmbedGenerator = require('../../modules/sendEmbed');

module.exports = {
	name: "queue",
	aliases: ["q"],
	description: "Show the music queue and now playing.",
	execute(client, message, args) {
		const queue = message.client.queue.get(message.guild.id);
		if (!queue) return message.reply("There is nothing playing.").catch(console.error);

		const description = queue.songs.map((song, index) => `${index + 1}. ${escapeMarkdown(song.title)}`);

		let queueEmbed = EmbedGenerator.generate('Watame Music Queue')
			.setURL(BOT_URL)
			.setDescription(description)
			.setColor("#F8AA2A");

		const splitDescription = splitMessage(description, {
			maxLength: 2048,
			char: "\n",
			prepend: "",
			append: ""
		});

		splitDescription.forEach(async (m) => {
			queueEmbed.setDescription(m);
			message.channel.send(queueEmbed);
		});
	}
};