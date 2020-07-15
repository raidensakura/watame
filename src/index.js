// location of config file
const { prefix, token, ownerID } = require("./config.js");

const fs = require('fs');
const Discord = require('discord.js');
const client = new Discord.Client({ disableEveryone: true });
const cooldowns = new Discord.Collection();
client.commands = new Discord.Collection();

// location of logger and function module
client.logger = require("./modules/Logger");
require("./modules/functions.js")(client);

const commandFiles = fs.readdirSync('./src/commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

const Sequelize = require('sequelize');
const ms = require("ms");
const sequelize = new Sequelize('database', 'user', 'password', {
	host: 'localhost',
	dialect: 'sqlite',
	logging: false,
	// sqlite only
	storage: 'database.sqlite',
});

const muteDB = sequelize.define('mute', {
	uid: Sequelize.STRING,
	serverid: Sequelize.STRING,
	mutestart: Sequelize.STRING,
	mutefinish: Sequelize.STRING,
});

const factionDB = sequelize.define('faction', {
	uid: {
		type: Sequelize.STRING,
		unique: true,
	},
	score: {
		type: Sequelize.INTEGER,
		defaultValue: 0,
		allowNull: false,
	},
});


// List of autoresponses, part of easter egg
const responseObject = {
	// argument needs to be lowercase
	"ayy": "lmao",
	"watame wa": "warukunai yo nee",
	"watame": "somebody called?"
};

client.once('ready', async () => {
	client.user.setActivity("sleepingknights.moe");
	client.logger.log(`Logged in as ${client.user.tag}! in ${client.guilds.cache.size} servers`);
	// sync databases
	await sequelize.sync();

	// check for mutes that expired when bot is offline
	const users = await muteDB.findAll();

	if (users) {
		users.forEach(async (user) => {
			let server = await client.guilds.cache.get(user.serverid);
			let unmute = await server.members.cache.get(user.uid);
			let muterole = server.roles.cache.find(role => role.name === "Muted");
			let now = Date.now();
			if (now >= user.mutefinish) {
				removeMute();
				client.logger.log(`Unmuted ${unmute.user.tag} in ${server.name}`);
			} else {
				let timeout = ms(user.mutefinish) - now;
				client.logger.log(`Unmuting ${unmute.user.tag} after ${ms(timeout)} in ${server.name}`);

				setTimeout(async () => {
					removeMute();
				}, timeout);
			}

			async function removeMute() {
				await unmute.roles.remove(muterole);
				client.logger.log(`Removed expired Mute for ${unmute.user.tag}`);
				const rowCount = await muteDB.destroy({ where: { id: user.id } });
				if (!rowCount) return client.logger.log('Error trying to remove tag!');
			}
		});
	}

});

client.on('message', async message => {
	// check for easter egg lines
	if (responseObject[message.content.toLowerCase()]) {
		message.channel.send(responseObject[message.content.toLowerCase()]);
	}

	// react and log when bot is mentioned
	if (message.mentions.has(client.user)) {
		await message.react('🐑');
		// regex for bot mention, which is <@xxxxx>
		let mention = /<@(.*?)>/;
		// replace matched string with bot tag
		let content = message.content.replace(mention, client.user.tag);
		client.logger.log(`${message.author.tag} in ${message.guild.name}: ${content}`);
	}

	// cancel if message does not start with prefix or if author is a bot
	if (!message.content.startsWith(prefix) || message.author.bot) return;
	// split message into array or args
	let args = message.content.slice(prefix.length).split(/ +/);
	// convert command to lowercase
	let commandName = args.shift().toLowerCase();
	// check if command or alias exist
	let command = client.commands.get(commandName)
		|| client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
	if (!command) return;
	// check if command is guild only
	if (command.guildOnly && message.channel.type !== 'text') {
		return message.reply('you can only use that command inside servers.');
	}
	// check if command is dm only
	if (command.DMOnly && message.channel.type == 'text') {
		return message.reply('I can\'t execute that command outside DM.');
	}
	// check if command is owner only
	if (command.ownerOnly && message.author.id !== ownerID) {
		return message.reply('this command is for my owner only.');
	}
	// check if command is staff only
	if (command.staffOnly && !message.member.hasPermission("MANAGE_MESSAGES")) {
		return message.reply('you don\'t have permission to do that.');
	}
	// check if command require arguments
	if (command.args && !args.length) {
		let reply = `You didn't provide any argument, ${message.author}.`;
		if (command.usage) {
			reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
		}
		return message.channel.send(reply);
	}

	// check for cooldowns
	if (!cooldowns.has(command.name)) cooldowns.set(command.name, new Discord.Collection());
	let now = Date.now();
	let timestamps = cooldowns.get(command.name);
	// in miliseconds
	let cooldownAmount = (command.cooldown || 3) * 1000;
	// check if command is coming from the same author
	if (timestamps.has(message.author.id)) {
		let expirationTime = timestamps.get(message.author.id) + cooldownAmount;
		if (now < expirationTime) {
			let timeLeft = (expirationTime - now) / 1000;
			return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
		}
	}
	timestamps.set(message.author.id, now);
	setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

	// execute command
	try {

		if (command.requireTag) {
			command.name === 'faction' && command.execute(client, message, args, factionDB);
			command.name === 'mute' && command.execute(client, message, args, muteDB);
		} else {
			command.execute(client, message, args);
		}

	} catch (error) {
		client.logger.error(error);
		message.reply('there was an error trying to execute that command!');
	}
});

client.login(token);