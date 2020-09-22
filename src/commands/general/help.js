const { PREFIX } = require('../../data/config.js');

const EmbedGenerator = require('../../modules/sendEmbed');

const _ = require('lodash');

module.exports = {
	name: 'help',
	description: 'List all of my commands or info about a specific command.',
	aliases: ['support'],
	usage: '[command name]',
	cooldown: 5,
	async execute(client, message, args) {

		const { commands } = message.client;

		if (!args.length) {
			try {
				await message.author.send(EmbedGenerator.generate()
					.setTitle('Click here for official documentation')
					.setURL('https://watame.sleepingknights.moe/')
					.addField('List of my Commands:', `\`${commands.map(command => command.name).join('`, `')}\``)
					.addField('Help Tips:', 'Use `w!help [command]` to get help on specific command'));

				if (message.channel.type === 'dm') return;
				return message.reply('I\'ve sent you a DM with all my commands!');

			} catch (e) {
				client.logger.error(`Could not send help DM to ${message.author.tag}.\n${e}`);
				return message.reply(`It seems like I can't DM you! Do you have DMs disabled?`);
			}
		}

		const name = args[0].toLowerCase();
		const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

		if (!command) {
			return message.reply(`That's not a valid command!`);
		}

		const data = [];
		const field = [];

		if (command.aliases) {
			field.push('Aliases:');
			data.push(`\`${command.aliases.join('`, `')}\``);
		}

		if (command.description) {
			field.push('Description:');
			data.push(command.description);
		}

		if (command.usage) {
			field.push('Usage:');
			data.push(`\`${PREFIX}${command.name} ${command.usage}\``);
		}

		field.push('Cooldown:');
		data.push(`${command.cooldown || 3} second(s)`);

		let embed = EmbedGenerator.generate()
			.setTitle(`${_.capitalize(command.name)} command help`)
			.setURL(`https://watame.sleepingknights.moe/features/all-commands#${command.name}-command`);

		data.forEach((entry, index) => {
			embed.addField(field[index], entry);
		})

		message.channel.send(embed);
	},
};
