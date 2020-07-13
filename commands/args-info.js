module.exports = {
	name: 'args-info',
	aliases: ['argument', 'args'],
	description: 'Information about the arguments provided.',
    args: true,
    usage: '<user> <role>',
	execute(client, message, args) {
		if (args[0] === 'foo') {
			return message.channel.send('bar');
		}

		message.channel.send(`Arguments: ${args}\nArguments length: ${args.length}`);
	},
};