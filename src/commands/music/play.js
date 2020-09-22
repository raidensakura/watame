const ytdl = require('ytdl-core-discord');

const yts = require('yt-search');

module.exports = {
	name: 'play',
	description: 'Play a music in the current voice channel',
	usage: '<search query/URL>',
	args: true,
	cooldown: 5,
	guildOnly: true,
	async execute(client, message, args) {

		const { channel } = message.member.voice;
		if (!channel) return message.reply(`You need to be in a voice channel to play music.`);

		const permissions = channel.permissionsFor(message.client.user);
		if (!permissions.has('CONNECT')) return message.reply('I lack permission to connect to your voice channel!');
		if (!permissions.has('SPEAK')) return message.reply('I lack permission to speak in your voice channel!');

		const serverQueue = message.client.queue.get(message.guild.id);

		const videoPattern = /^(https?:\/\/)?(www\.)?(m\.)?(youtube\.com|youtu\.?be)\/.+$/gi;
		const urlValid = videoPattern.test(args[0]);

		let songInfo, song;

		if (urlValid) {
			try {
				const url = args[0];
				songInfo = await ytdl.getInfo(url);
				song = {
					title: songInfo.videoDetails.title,
					url: songInfo.videoDetails.video_url,
					duration: songInfo.videoDetails.lengthSeconds
				};
			} catch (error) {
				client.logger.error(error);
				return message.reply(`There was an error trying to play music.`);
			}

		} else {
			try {
				const search = args.join(" ");

				const result = await yts(search);
				const video = result.videos.slice(0, 1);

				songInfo = await ytdl.getInfo(video[0].url);
				song = {
					title: songInfo.videoDetails.title,
					url: songInfo.videoDetails.video_url,
					duration: songInfo.videoDetails.lengthSeconds
				};
			} catch (error) {
				return message.reply("No video was found with a matching title.");
			}
		}

		if (serverQueue) {
			serverQueue.songs.push(song);
			return message.channel.send(`✅ **${song.title}** has been added to the queue!`);
		}

		const queueConstruct = {
			textChannel: message.channel,
			voiceChannel: channel,
			connection: null,
			songs: [],
			loop: false,
			volume: 2,
			playing: true
		};
		message.client.queue.set(message.guild.id, queueConstruct);
		queueConstruct.songs.push(song);

		// eslint-disable-next-line no-shadow
		const play = async song => {
			const queue = message.client.queue.get(message.guild.id);
			if (!song || channel.members.size === 1) {
				queue.voiceChannel.leave();
				message.client.queue.delete(message.guild.id);
				return;
			}

			const dispatcher = queue.connection.play(await ytdl(song.url, { quality: 'highestaudio' }), { type: 'opus' })
				.on('finish', () => {
					if (queue.loop) {
						let lastSong = queue.songs.shift();
						queue.songs.push(lastSong);
					} else {
						queue.songs.shift();
					}
					play(queue.songs[0]);
				})
				.on('error', error => client.logger.error(error));
			dispatcher.setVolumeLogarithmic(queue.volume / 5);
			queue.textChannel.send(`🎶 Playing: **${song.title}**`);
		};

		try {
			const connection = await channel.join();
			queueConstruct.connection = connection;
			await queueConstruct.connection.voice.setSelfDeaf(true);
			play(queueConstruct.songs[0]);
		} catch (error) {
			client.logger.error(`I could not join the voice channel: ${error}`);
			message.client.queue.delete(message.guild.id);
			await channel.leave();
			return message.reply(`There was an error trying to join voice channel.`);
		}
	}
};