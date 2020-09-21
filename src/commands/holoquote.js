const holoquote = require('../data/holoquote.json');

const EmbedGenerator = require('../modules/sendEmbed');
module.exports = {
	name: 'holoquote',
	aliases: ['hq', 'quote'],
	description: 'Obtains a random quote from one of the known Vtubers.',
	guildOnly: true,
	execute(client, message) {
		const item = holoquote[Math.floor(Math.random() * holoquote.length)];

		message.channel.send(EmbedGenerator.generate()
			.setTitle(`*${item.quote}*`)
			.setURL(item.URL)
			.setDescription(`Quote by [${item.author}](${item.URL})`));
	},
};