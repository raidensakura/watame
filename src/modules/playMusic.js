const ytdl = require("ytdl-core-discord");

const { canModifyQueue } = require("./Utils");

module.exports = {
	async play(client, song, message) {
		const queue = message.client.queue.get(message.guild.id);

		if (queue.channel.members.size === 1 || !song) {
			song = null;
			queue.channel.leave();
			message.client.queue.delete(message.guild.id);
			return queue.textChannel.send("⏏ Music queue ended.");
		}

		let stream = null;
		let streamType = song.url.includes("youtube.com") ? "opus" : "ogg/opus";

		try {
			if (song.url.includes("youtube.com")) {
				stream = await ytdl(song.url, { highWaterMark: 5 << 20 });
			}
		} catch (error) {
			if (queue) {
				queue.songs.shift();
				module.exports.play(client, queue.songs[0], message);
			}

			client.logger.error(error);
			return message.channel.send(`Error: ${error.message ? error.message : error}`);
		}

		queue.connection.on("disconnect", () => message.client.queue.delete(message.guild.id));

		if (queue.connection._events.disconnect.length < 2) {
			queue.connection.on("disconnect", async () => {
				try {
					if (collector && !collector.ended) await collector.stop();
				} catch (error) {
					client.logger.error(error);
				}
				return await message.client.queue.delete(message.guild.id)
			});
		}

		const dispatcher = queue.connection
			.play(stream, { type: streamType })
			.on("finish", () => {
				if (collector && !collector.ended) collector.stop();

				if (queue.loop) {
					// if loop is on, push the song back at the end of the queue
					// so it can repeat endlessly
					let lastSong = queue.songs.shift();
					queue.songs.push(lastSong);
					module.exports.play(client, queue.songs[0], message);
				} else {
					// Recursively play the next song
					queue.songs.shift();
					module.exports.play(client, queue.songs[0], message);
				}
			})
			.on("error", (err) => {
				client.logger.error(err);
				queue.songs.shift();
				module.exports.play(client, queue.songs[0], message);
			});
		dispatcher.setVolumeLogarithmic(queue.volume / 100);

		let playingMessage = null;
		try {
			playingMessage = await queue.textChannel.send(`🎶 Started playing: **${song.title}** ${song.url}`);
			await playingMessage.react("⏭");
			await playingMessage.react("⏯");
			await playingMessage.react("🔇");
			await playingMessage.react("🔉");
			await playingMessage.react("🔊");
			await playingMessage.react("🔁");
			await playingMessage.react("⏹");
		} catch (error) {
			client.logger.error(error);
		}

		const filter = (reaction, user) => user.id !== message.client.user.id;
		let collector = playingMessage.createReactionCollector(filter, {
			time: song.duration > 0 ? song.duration * 1000 : 600000
		});

		collector.on("collect", (reaction, user) => {
			if (!queue) return;
			const member = message.guild.member(user);

			switch (reaction.emoji.name) {
				case "⏭":
					queue.playing = true;
					reaction.users.remove(user)
						.catch((e) => { client.logger.error(e) });
					if (!canModifyQueue(member)) return;
					queue.connection.dispatcher.end();
					queue.textChannel.send(`${user} ⏩ skipped the song`)
						.catch((e) => { client.logger.error(e) });
					collector.stop();
					break;

				case "⏯":
					reaction.users.remove(user)
						.catch((e) => { client.logger.error(e) });
					if (!canModifyQueue(member)) return;
					if (queue.playing) {
						queue.playing = !queue.playing;
						queue.connection.dispatcher.pause(true);
						queue.textChannel.send(`${user} ⏸ paused the music.`)
							.catch((e) => { client.logger.error(e) });
					} else {
						queue.playing = !queue.playing;
						queue.connection.dispatcher.resume();
						queue.textChannel.send(`${user} ▶ resumed the music!`)
							.catch((e) => { client.logger.error(e) });
					}
					break;

				case "🔇":
					reaction.users.remove(user)
						.catch((e) => { client.logger.error(e) });
					if (!canModifyQueue(member)) return;
					if (queue.volume <= 0) {
						queue.volume = 100;
						queue.connection.dispatcher.setVolumeLogarithmic(100 / 100);
						queue.textChannel.send(`${user} 🔊 unmuted the music!`)
							.catch((e) => { client.logger.error(e) });
					} else {
						queue.volume = 0;
						queue.connection.dispatcher.setVolumeLogarithmic(0);
						queue.textChannel.send(`${user} 🔇 muted the music!`)
							.catch((e) => { client.logger.error(e) });
					}
					break;

				case "🔉":
					reaction.users.remove(user)
						.catch((e) => { client.logger.error(e) });
					if (!canModifyQueue(member)) return;
					if (queue.volume - 10 <= 0) queue.volume = 0;
					else queue.volume = queue.volume - 10;
					queue.connection.dispatcher.setVolumeLogarithmic(queue.volume / 100);
					queue.textChannel
						.send(`${user} 🔉 decreased the volume, the volume is now ${queue.volume}%`)
						.catch((e) => { client.logger.error(e) });
					break;

				case "🔊":
					reaction.users.remove(user)
						.catch((e) => { client.logger.error(e) });
					if (!canModifyQueue(member)) return;
					if (queue.volume + 10 >= 100) queue.volume = 100;
					else queue.volume = queue.volume + 10;
					queue.connection.dispatcher.setVolumeLogarithmic(queue.volume / 100);
					queue.textChannel
						.send(`${user} 🔊 increased the volume, the volume is now ${queue.volume}%`)
						.catch((e) => { client.logger.error(e) });
					break;

				case "🔁":
					reaction.users.remove(user)
						.catch((e) => { client.logger.error(e) });
					if (!canModifyQueue(member)) return;
					queue.loop = !queue.loop;
					queue.textChannel.send(`🔁 Loop is now ${queue.loop ? "**on**" : "**off**"}`)
						.catch((e) => { client.logger.error(e) });
					break;

				case "⏹":
					reaction.users.remove(user)
						.catch((e) => { client.logger.error(e) });
					if (!canModifyQueue(member)) return;
					queue.songs = [];
					queue.textChannel.send(`${user} ⏹ stopped the music!`)
						.catch((e) => { client.logger.error(e) });
					try {
						queue.connection.dispatcher.end();
					} catch (error) {
						client.logger.error(error);
						queue.connection.disconnect();
					}
					collector.stop();
					break;

				default:
					reaction.users.remove(user)
						.catch((e) => { client.logger.error(e) });
					break;
			}
		});

		collector.on("end", () => {
			playingMessage.reactions.removeAll()
				.catch((e) => { client.logger.error(e) });
			if (playingMessage && !playingMessage.deleted) {
				playingMessage.delete({ timeout: 3000 })
					.catch((e) => { client.logger.error(e) });
			}
		});
	}
};
