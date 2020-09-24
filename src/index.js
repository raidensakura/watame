const Discord = require('discord.js');

const { TOKEN } = require('./data/config.js');

const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });

client.commands = new Discord.Collection();

client.queue = new Map();

client.logger = require("./modules/Logger");
require("./modules/Functions.js")(client);

const fs = require('fs');

const modules = ['general', 'music', 'moderation'];

modules.forEach(c => {
	fs.readdir(`./src/commands/${c}/`, (err, files) => {
		if (err) throw err;
		client.logger.log(`Loaded ${files.length} commands from module: ${c}`);

		files.forEach(f => {
			const props = require(`./commands/${c}/${f}`);
			client.commands.set(props.name, props);
		});
	});
});

client.once('ready', async () => {

	await client.checkForMute();

	client.user.setActivity(`hololive.tv`, { type: 'WATCHING' });
	client.logger.log(`Logged in as ${client.user.tag} in ${client.guilds.cache.size} guilds`);

});

client.on('message', message => require('./events/message').handle(client, message));

const dbConnection = require('./data/database');

dbConnection.authenticate()
	.then(() => client.logger.log('Successfully connected to database'))
	.catch((err) => client.logger.error('Unable to connect to the database', err));

client.login(TOKEN);