// location of config file
const { token } = require("./config.js");

const Discord = require('discord.js');
const client = new Discord.Client({ disableMentions: 'all' });

client.commands = new Discord.Collection();

const fs = require('fs');
const ms = require("ms");

// location of logger and function module
client.logger = require("./modules/Logger");
require("./modules/functions.js")(client);

const commandFiles = fs.readdirSync('./src/commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

client.once('ready', async () => {

	await client.checkForMute();

	client.user.setActivity("sleepingknights.moe");
	client.logger.log(`Logged in as ${client.user.tag} in ${client.guilds.cache.size} servers`);

});

client.on('message', message => require('./events/message').handle(client, message));

client.login(token);