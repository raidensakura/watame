const Discord = require('discord.js');
const { youtubeAPIKey } = require('../config.js');
const { YouTube } = require('popyt');
const { add } = require('lodash');
const youtube = new YouTube(youtubeAPIKey);
const ms = require("ms");
module.exports = {
	name: 'live',
	description: 'Check channel stats for the hololive Vtubers',
	usage: '<name>',
	aliases: ['hololive'],
	cooldown: 5,
	guildOnly: true,
	args: false,
	async execute(client, message, args) {

		if (!youtubeAPIKey || youtubeAPIKey === 'key_here')
			return message.channel.send("YouTube API Key is missing from config file...");

		let channel;
		if (args[0] === 'watame') channel = await youtube.getChannel('UCqm3BQLlJfvkTsX_hvm0UmA');
		if (args[0] === 'fubuki') channel = await youtube.getChannel('UCdn5BQ06XqgXoAxIhbqw5Rg');
		if (args[0] === 'aqua') channel = await youtube.getChannel('UC1opHUrw8rvnsadT-iGp7Cg');
		if (args[0] === 'haato') channel = await youtube.getChannel('UC1CfXB_kRs3C-zaeTG3oGyg');
		if (args[0] === 'matsuri') channel = await youtube.getChannel('UCQ0UDLQCjY0rmuxCDE38FGg');
		if (args[0] === 'miko') channel = await youtube.getChannel('UC-hM6YJuNYVAmUWxeIr9FeA');
		if (args[0] === 'mio') channel = await youtube.getChannel('UCp-5t9SrOQwXMU7iIjQfARg');
		if (args[0] === 'ayame') channel = await youtube.getChannel('UC7fk0CB07ly8oSl0aqKkqFg');
		if (args[0] === 'sora') channel = await youtube.getChannel('UCp6993wxpyDPHUpavwDFqgg');
		else channel = await youtube.getChannel('UCJFZiqLMntJufDCHc6bQixg');
		// console.log(channel);

		const embed = new Discord.MessageEmbed()
			.setColor('#F47FFF')
			.setThumbnail(channel.profilePictures.medium.url)
			.setAuthor(channel.name, channel.profilePictures.default.url, channel.url)
			.addField('Subscribers', channel.subCount)
			.addField('Views', channel.views)
			.addField('Date Created', `${ms(Date.now() - Date.parse(channel.dateCreated), { long: true })} ago`)
		message.channel.send(embed);
	},
};