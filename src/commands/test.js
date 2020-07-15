// Just a boilerplate command to list all the properties
module.exports = {
	name: 'test',
	description: 'What are you even trying to test?',
	usage: '<this does nothing>',
	aliases: ['testing'],
	cooldown: 5,
	guildOnly: false,
	DMOnly: false,
	ownerOnly: false,
	staffOnly: false,
	requireTag: false,
	args: false,
	async execute(client, message) {
		message.channel.send('This does nothing!');
	},
};