const { TOKEN } = require('./data/config.js');

const Discord = require('discord.js');
const client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });

client.commands = new Discord.Collection();

client.queue = new Map();

const fs = require('fs');

client.logger = require("./modules/Logger");
require("./modules/functions.js")(client);

const modules = ['general', 'music', 'misc'];

modules.forEach(c => {
	fs.readdir(`./src/commands/${c}/`, (err, files) => { // Here we go through all folders (modules)
		if (err) throw err; // If there is error, throw an error in the console
		console.log(`[Commandlogs] Loaded ${files.length} commands of module ${c}`); // When commands of a module are successfully loaded, you can see it in the console

		files.forEach(f => { // Now we go through all files of a folder (module)
			const props = require(`./commands/${c}/${f}`); // Location of the current command file
			client.commands.set(props.name, props); // Now we add the commmand in the client.commands Collection which we defined in previous code
		});
	});
});

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