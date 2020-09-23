const { BOT_URL } = require('../../data/config.js');

const os = require('os');

const prettysize = require('prettysize');

const EmbedGenerator = require('../../modules/sendEmbed');

module.exports = {
	name: 'resource',
	description: 'Displays resource usage for current shard',
	aliases: ['res'],
	guildOnly: true,
	async execute(client, message) {
		const cpus = os.cpus();

		console.log(prettysize(os.totalmem()));
		console.log(prettysize(os.freemem()));

		message.channel.send(EmbedGenerator.generate(`Resource Monitor`)
			.setURL(BOT_URL)
			.addField('CPU Model', cpus[0].model)
			.addField('Available RAM', prettysize(os.totalmem()))
			.addField('Free RAM', prettysize(os.freemem())));
	},
};