module.exports = {
	name: 'reload',
	description: 'Reloads a command',
	ownerOnly: true,
	args: true,
	execute(client, message, args) {
		const commandName = args[0].toLowerCase();
		const command = message.client.commands.get(commandName)
			|| message.client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
		if (!command) return message.channel.send(`There is no command with name or alias \`${commandName}\`, ${message.author}!`);

		// reload quiz file if command is faction
		if (command.name === 'faction') {
			delete require.cache[require.resolve(`../data/quiz.json`)];
		}
		// reload quiz file if command is holoquote
		if (command.name === 'holoquote') {
			delete require.cache[require.resolve(`../data/holoquote.json`)];
		}

		delete require.cache[require.resolve(`./${command.name}.js`)];

		try {
			const newCommand = require(`./${command.name}.js`);
			message.client.commands.set(newCommand.name, newCommand);
			message.channel.send(`Command \`${command.name}\` was reloaded!`);
		} catch (error) {
			client.logger.error(error);
			message.channel.send(`There was an error while reloading a command \`${command.name}\`:\n\`${error.message}\``);
		}
	},
};