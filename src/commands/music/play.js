const { play } = require("../../modules/playMusic");

const yts = require('yt-search');

const ytdl = require("ytdl-core");

module.exports = {
	name: "play",
	aliases: ["p"],
	description: "Plays audio from YouTube",
	args: true,
	usage: '<YouTube URL | Video Title>',
	async execute(client, message, args) {
		const { channel } = message.member.voice;

		const serverQueue = message.client.queue.get(message.guild.id);
		if (!channel) return message.reply("You need to join a voice channel first!");
		if (serverQueue && channel !== message.guild.me.voice.channel)
			return message.reply(`You must be in the same channel as ${message.client.user}`);

		const permissions = channel.permissionsFor(message.client.user);
		if (!permissions.has("CONNECT"))
			return message.reply("Cannot connect to voice channel, missing permissions.");
		if (!permissions.has("SPEAK"))
			return message.reply("I cannot speak in this voice channel, make sure I have the proper permissions!");

		const search = args.join(" ");
		const videoPattern = /^(https?:\/\/)?(www\.)?(m\.)?(youtube\.com|youtu\.?be)\/.+$/gi;
		const playlistPattern = /^.*(list=)([^#&?]*).*/gi;
		const url = args[0];
		const urlValid = videoPattern.test(args[0]);

		// Start the playlist if playlist url was provided
		if (!videoPattern.test(args[0]) && playlistPattern.test(args[0])) {
			return message.client.commands.get("playlist").execute(client, message, args);
		}

		const queueConstruct = {
			textChannel: message.channel,
			channel,
			connection: null,
			songs: [],
			loop: false,
			volume: 100,
			playing: true
		};

		let songInfo = null;
		let song = null;

		if (urlValid) {
			try {
				songInfo = await ytdl.getInfo(url);
				song = {
					title: songInfo.videoDetails.title,
					url: songInfo.videoDetails.video_url,
					duration: songInfo.videoDetails.lengthSeconds
				};
			} catch (error) {
				client.logger.error(error);
				return message.reply('There was an error getting info for that link.');
			}
		} else {
			try {
				const result = await yts(search);
				const video = result.videos.slice(0, 1);
				songInfo = await ytdl.getInfo(video[0].url);
				song = {
					title: songInfo.videoDetails.title,
					url: songInfo.videoDetails.video_url,
					duration: songInfo.videoDetails.lengthSeconds
				};
			} catch (error) {
				client.logger.error(error);
				return message.reply("No video was found with a matching title");
			}
		}

		if (serverQueue) {
			serverQueue.songs.push(song);
			return serverQueue.textChannel
				.send(`✅ **${song.title}** has been added to the queue by ${message.author}`);
		}

		queueConstruct.songs.push(song);
		message.client.queue.set(message.guild.id, queueConstruct);

		try {
			queueConstruct.connection = await channel.join();
			await queueConstruct.connection.voice.setSelfDeaf(true);
			play(client, queueConstruct.songs[0], message);
		} catch (error) {
			client.logger.error(error);
			message.client.queue.delete(message.guild.id);
			await channel.leave();
			return message.channel.send(`Could not join the channel: ${error}`);
		}
	}
};