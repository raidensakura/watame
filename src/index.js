const { TOKEN } = require('./data/config.js');

const Discord = require('discord.js');
const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });

client.commands = new Discord.Collection();

const fs = require('fs');

client.logger = require("./modules/Logger");
require("./modules/functions.js")(client);

const commandFiles = fs.readdirSync('./src/commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

client.once('ready', async () => {

	await client.checkForMute();

	client.user.setActivity(`Watame's Stream`, { type: 'WATCHING' });
	client.logger.log(`Logged in as ${client.user.tag} in ${client.guilds.cache.size} guilds`);

});

client.on('message', message => require('./events/message').handle(client, message));

const dbConnection = require('./data/database');

dbConnection.authenticate()
	.then(() => client.logger.log('Connection has been established to the database'))
	.catch((err) => client.logger.error('Unable to connect to the database', err));

client.login(TOKEN);