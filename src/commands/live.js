const Discord = require('discord.js');
const { youtubeAPIKey } = require('../config.js');
const { YouTube } = require('popyt');
const { add } = require('lodash');
const youtube = new YouTube(youtubeAPIKey);
const ms = require("ms");
module.exports = {
	name: 'live',
	description: 'Check channel stats for the hololive Vtubers',
	usage: '<name/channel ID>',
	aliases: ['hololive'],
	cooldown: 5,
	guildOnly: true,
	async execute(client, message, args) {

		if (!youtubeAPIKey || youtubeAPIKey === 'key_here')
			return message.channel.send("YouTube API Key is missing from config file...");

		const name = {
			"watame": "UCqm3BQLlJfvkTsX_hvm0UmA",
			"aqua": "UC1opHUrw8rvnsadT-iGp7Cg",
			"haato": "UC1CfXB_kRs3C-zaeTG3oGyg",
			"matsuri": "UCQ0UDLQCjY0rmuxCDE38FGg",
			"miko": "UC-hM6YJuNYVAmUWxeIr9FeA",
			"mio": "UCp-5t9SrOQwXMU7iIjQfARg",
			"ayame": "UC7fk0CB07ly8oSl0aqKkqFg",
			"sora": "UCp6993wxpyDPHUpavwDFqgg",
		};

		if (!args[0]) {
			let response = await client.awaitReply(message, 'Enter the Username, URL or ID of the channel you wish to display');
			return getChannel(response);
		}

		if (args[0] === 'debug') {
			let search = await youtube.searchChannels('PewDiePie', 1);
			console.log(search);
			return message.channel.send('Debug mode.');
		}

		if (name[args[0].toLowerCase()]) {
			return getChannel(name[args[0].toLowerCase()]);
		} else {
			message.reply('There is no hololive channel under that name');
		}

		async function getChannel(id) {
			try {
				let channel = await youtube.getChannel(id);
				sendEmbed(channel);
			} catch {
				message.reply('No channel was found under that ID');
			}
		}

		async function sendEmbed(channel) {
			const embed = new Discord.MessageEmbed()
				.setColor('#F47FFF')
				.setThumbnail(channel.profilePictures.medium.url)
				.setAuthor(channel.name, channel.profilePictures.default.url, channel.url)
				.addField('Subscribers', channel.subCount.toLocaleString())
				.addField('Total Views', channel.views.toLocaleString())
				.addField('Channel Creation', `${ms(Date.now() - Date.parse(channel.dateCreated), { long: true })} ago`)
			await message.channel.send(embed);
		}

		// console.log(channel);
	},
};