const createBar = require("string-progressbar");

const EmbedGenerator = require('../../modules/sendEmbed');

module.exports = {
	name: "nowplaying",
	aliases: ["np"],
	description: "Show now playing song",
	execute(client, message) {
		const queue = message.client.queue.get(message.guild.id);

		if (!queue) return message.reply("There is nothing playing.")
			.catch((e) => { client.logger.error(e) });

		const song = queue.songs[0];
		const seek = (queue.connection.dispatcher.streamTime - queue.connection.dispatcher.pausedTime) / 1000;
		const left = song.duration - seek;

		let nowPlaying = EmbedGenerator.generate(`Now playing on ${client.user.username} ♪`)
			.setDescription(`${song.title}\n${song.url}`)
			.addField(
				"\u200b",
				new Date(seek * 1000).toISOString().substr(11, 8) +
				"[" +
				createBar(song.duration === 0 ? seek : song.duration, seek, 20)[0] +
				"]" +
				(song.duration === 0 ? " ◉ LIVE" : new Date(song.duration * 1000).toISOString().substr(11, 8)),
				false
			);

		if (song.duration > 0)
			nowPlaying.addField("Time Remaining: ", `${new Date(left * 1000).toISOString().substr(11, 8)}`);

		return message.channel.send(nowPlaying);
	}
};