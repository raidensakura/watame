// Module to send standardized embed message

'use strict';

const MessageEmbed = require('discord.js').MessageEmbed;

module.exports = {
	generate: (title) => generate(title),
	generateWithImage: (description, imageUrl) => generate(description).setImage(imageUrl),
};

/**
 * * Function to send embed images
 * @param authorTitle, authorImage, authorLink, description
*/
function generate(title) {
	let now = new Date();
	let avatarURL = 'https://cdn.discordapp.com/avatars/617592844978487316/5e95d54cebb98fd7473dc1b26ff8b170.webp?size=32';
	return new MessageEmbed()
		.setAuthor('Watame', avatarURL, 'https://watame.sleepingknights.moe')
		.setTitle(title)
		.setColor('#F47FFF')
		.setFooter(`© ${now.getFullYear()} Watame | Sleeping Knights`);
}