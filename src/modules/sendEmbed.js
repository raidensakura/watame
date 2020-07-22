// Module to send standardized embed message

'use strict';

const MessageEmbed = require('discord.js').MessageEmbed;

module.exports = {
	generate: (description) => generate(description),
	generateWithImage: (description, imageUrl) => generate(description).setImage(imageUrl),
};

/**
 * * Function to send embed images
 * @param authorTitle, authorImage, authorLink, description
*/
function generate(description) {
	let now = new Date();
	return new MessageEmbed()
		.setColor('#F47FFF')
		.setFooter(`© ${now.getFullYear()} Watame`)
		.setDescription(description);
}