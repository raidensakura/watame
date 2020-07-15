module.exports = {
	name: 'args-info',
	aliases: ['args'],
	description: 'Displays argument info',
	args: true,
	usage: '<args>',
	execute(client, message, args) {
		if (args[0] === 'foo') {
			return message.channel.send('bar');
		}

		message.channel.send(`Arguments: ${args}\nArguments length: ${args.length}`);
	},
};