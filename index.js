//location of config file
const { prefix, token, ownerID } = require('./config.json');
const fs = require('fs');
const Discord = require('discord.js');
const client = new Discord.Client({ disableEveryone: true });
const cooldowns = new Discord.Collection();
client.commands = new Discord.Collection();
client.logger = require("./modules/Logger");
require("./modules/functions.js")(client);

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}
/** 
* * List of autoresponses
* * part of server easter egg
**/
const responseObject = {
    "ayy": "lmao",
    "watame wa": "warukunai yo nee",
    "sheep": "somebody called?"
};

client.once('ready', () => {
    client.logger.log(`Logged in as ${client.user.tag}! in ${client.guilds.cache.size} server(s).`);
});

client.on('message', async message => {
    //react and log when bot is pinged
    if (message.mentions.has(client.user)) {
        await message.react('🐑');
        let content = message.content.substring(message.content.indexOf(' ') + 1);
        if (content === `<@>${client.user.id}` || content === `<@!${client.user.id}>`) {
            return client.logger.log(`${message.author.tag} mentioned ${client.user.tag}`);
        } else {
            return client.logger.log(`${message.author.tag} said: ${content}`);
        }
    }

    //check for easter egg lines
    if (responseObject[message.content.toLowerCase()]) {
        message.channel.send(responseObject[message.content.toLowerCase()]);
    }

    //check if message contains prefix or if author is a bot
    if (!message.content.startsWith(prefix) || message.author.bot) return;
    //split message into array or args
    let args = message.content.slice(prefix.length).split(/ +/);
    //convert command to lowercase
    let commandName = args.shift().toLowerCase();
    //check if command exist
    let command = client.commands.get(commandName)
        || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
    if (!command) return;
    //check if command is guild only
    if (command.guildOnly && message.channel.type !== 'text') {
        return message.reply('you can only use that command inside servers.');
    }
    //check if command is dm only
    if (command.DMOnly && message.channel.type == 'text') {
        return message.reply('I can\'t execute that command outside DM.');
    }
    //check if command is owner only
    if (command.ownerOnly && message.author.id !== ownerID) {
        return message.reply('this command is for my owner only.');
    }
    //check if command is staff only
    if (command.staffOnly && !message.member.hasPermission("MANAGE_MESSAGES")) {
        return message.reply('you don\'t have permission to do that.');
    }
    //check if command require arguments
    if (command.args && !args.length) {
        let reply = `You didn't provide any argument, ${message.author}.`;
        if (command.usage) {
            reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
        }
        return message.channel.send(reply);
    }

    //check for cooldowns
    if (!cooldowns.has(command.name)) cooldowns.set(command.name, new Discord.Collection());
    let now = Date.now();
    let timestamps = cooldowns.get(command.name);
    let cooldownAmount = (command.cooldown || 3) * 1000; //in miliseconds
    //check if command is coming from the same author
    if (timestamps.has(message.author.id)) {
        let expirationTime = timestamps.get(message.author.id) + cooldownAmount;
        if (now < expirationTime) {
            let timeLeft = (expirationTime - now) / 1000;
            return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before \
            reusing the \`${command.name}\` command.`);
        }
    }
    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

    //execute command
    try {
        command.execute(client, message, args);
    } catch (error) {
        client.logger.error(error);
        message.reply('there was an error trying to execute that command!');
    }
});

client.login(token);