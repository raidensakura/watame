const EmbedGenerator = require('../../modules/sendEmbed');

const { play } = require("../../modules/playMusic");

const { YOUTUBE_API } = require("../../data/config.js");

const YouTubeAPI = require("simple-youtube-api");

const youtube = new YouTubeAPI(YOUTUBE_API);

module.exports = {
	name: "playlist",
	aliases: ["pl"],
	description: "Play a playlist from youtube",
	args: true,
	usage: '<YouTube Playlist URL/ Name>',
	async execute(client, message, args) {

		if (!YOUTUBE_API) return message.reply('YouTube API Missing from config file...');

		const { channel } = message.member.voice;

		const serverQueue = message.client.queue.get(message.guild.id);
		if (serverQueue && channel !== message.guild.me.voice.channel)
			return message.reply(`You must be in the same channel as ${message.client.user}`);

		if (!channel) return message.reply("You need to join a voice channel first!");

		const permissions = channel.permissionsFor(message.client.user);
		if (!permissions.has("CONNECT"))
			return message.reply("Cannot connect to voice channel, missing permissions");
		if (!permissions.has("SPEAK"))
			return message.reply("I cannot speak in this voice channel, make sure I have the proper permissions!");

		const search = args.join(" ");
		const pattern = /^.*(youtu.be\/|list=)([^#&?]*).*/gi;
		const url = args[0];
		const urlValid = pattern.test(args[0]);

		const queueConstruct = {
			textChannel: message.channel,
			channel,
			connection: null,
			songs: [],
			loop: false,
			volume: 100,
			playing: true
		};

		let song = null;
		let playlist = null;
		let videos = [];

		if (urlValid) {
			try {
				playlist = await youtube.getPlaylist(url, { part: "snippet" });
				videos = await playlist.getVideos(24, { part: "snippet" });
			} catch (error) {
				client.logger.error(error);
				return message.reply("Playlist not found :(");
			}
		} else {
			try {
				const results = await youtube.searchPlaylists(search, 1, { part: "snippet" });
				playlist = results[0];
				videos = await playlist.getVideos(24, { part: "snippet" });
			} catch (error) {
				client.logger.error(error);
				return message.reply("No playlist was found. Is the playlist private?");
			}
		}

		videos.forEach((video) => {
			song = {
				title: video.title,
				url: video.url,
				duration: video.durationSeconds
			};

			if (serverQueue) {
				serverQueue.songs.push(song);
				message.channel
					.send(`✅ **${song.title}** has been added to the queue by ${message.author}`);
			} else {
				queueConstruct.songs.push(song);
			}
		});

		let playlistEmbed = EmbedGenerator.generate(`${playlist.title}`)
			.setURL(playlist.url)
			.setTimestamp();

		playlistEmbed.setDescription(queueConstruct.songs.map((track, index) => `${index + 1}. ${track.title}`));
		if (playlistEmbed.description.length >= 2048)
			playlistEmbed.description =
				playlistEmbed.description.substr(0, 2007) + "\nPlaylist larger than character limit...";

		message.channel.send(`${message.author} Started a playlist`, playlistEmbed);

		if (!serverQueue) message.client.queue.set(message.guild.id, queueConstruct);

		if (!serverQueue) {
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
	}
};