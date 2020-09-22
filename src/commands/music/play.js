const { Util } = require('discord.js');

const ytdl = require('ytdl-core-discord');

const { YOUTUBE_API } = require('../../data/config.js');

const { YouTube } = require('popyt')

module.exports = {
	name: 'play',
	description: 'Play a music in the current voice channel',
	usage: '<song name>',
	args: true,
	cooldown: 5,
	guildOnly: true,
	async execute(client, message, args) {

		const youtube = new YouTube(YOUTUBE_API);

		const { channel } = message.member.voice;
		if (!channel) return message.channel.send('I\'m sorry but you need to be in a voice channel to play music!');
		const permissions = channel.permissionsFor(message.client.user);
		if (!permissions.has('CONNECT')) return message.channel.send('I cannot connect to your voice channel, make sure I have the proper permissions!');
		if (!permissions.has('SPEAK')) return message.channel.send('I cannot speak in this voice channel, make sure I have the proper permissions!');

		const serverQueue = message.client.queue.get(message.guild.id);

		const videoPattern = /^(https?:\/\/)?(www\.)?(m\.)?(youtube\.com|youtu\.?be)\/.+$/gi;
		const urlValid = videoPattern.test(args[0]);

		let songInfo = null;
		let song = null;

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
				client.logger.log(error);
				return message.reply(error.message).catch(console.error);
			}

		} else {
			try {
				const search = args.join(" ");
				const YTsearch = await youtube.searchVideos(search, 1);
				songInfo = await ytdl.getInfo(YTsearch.results[0].url);
				song = {
					title: songInfo.videoDetails.title,
					url: songInfo.videoDetails.video_url,
					duration: songInfo.videoDetails.lengthSeconds
				};
			} catch (error) {
				client.logger.log(error);
				return message.reply("No video was found with a matching title").catch(console.error);
			}
		}

		if (serverQueue) {
			serverQueue.songs.push(song);
			console.log(serverQueue.songs);
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
			if (!song) {
				queue.voiceChannel.leave();
				message.client.queue.delete(message.guild.id);
				return;
			}

			const dispatcher = queue.connection.play(await ytdl(song.url), { type: 'opus' })
				.on('finish', () => {
					if (queue.loop) {
						// if loop is on, push the song back at the end of the queue
						// so it can repeat endlessly
						let lastSong = queue.songs.shift();
						queue.songs.push(lastSong);
						play(queue.songs[0]);
					} else {
						// Recursively play the next song
						queue.songs.shift();
						play(queue.songs[0]);
					}
				})
				.on('error', error => console.error(error));
			dispatcher.setVolumeLogarithmic(queue.volume / 5);
			queue.textChannel.send(`🎶 Start playing: **${song.title}**`);
		};

		try {
			const connection = await channel.join();
			queueConstruct.connection = connection;
			play(queueConstruct.songs[0]);
		} catch (error) {
			console.error(`I could not join the voice channel: ${error}`);
			message.client.queue.delete(message.guild.id);
			await channel.leave();
			return message.channel.send(`I could not join the voice channel: ${error}`);
		}
	}
};