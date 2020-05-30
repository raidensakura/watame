//location of your config file
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
//autoresponse entries
const responseObject = {
    "ayy": "lmao",
    "watame wa": "warukunai yo nee",
    "flat": "pettan pettan tsurupettan"
};

client.once('ready', () => {
    client.logger.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', message => {
    if (responseObject[message.content]) {
        message.channel.send(responseObject[message.content]);
    }
    if (!message.content.startsWith(prefix) || message.author.bot) return;
    let args = message.content.slice(prefix.length).split(/ +/);
    let commandName = args.shift().toLowerCase();
    let command = client.commands.get(commandName)
        || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
    if (!command) return;

    if (command.guildOnly && message.channel.type !== 'text') {
        return message.reply('I can\'t execute that command inside DMs!');
    }

    if (command.DMOnly && message.channel.type == 'text') {
        client.logger.warn(`${message.author.tag} denied access to DM only command.`);
        return message.reply('I can\'t execute that command outside DMs!');
    }

    if (command.ownerOnly && message.author.id !== ownerID) {
        return message.reply('Sorry but only my owner can do that.');
    }

    if (command.args && !args.length) {
        let reply = `You didn't provide any arguments, ${message.author}!`;
        if (command.usage) {
            reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
        }
        return message.channel.send(reply);
    }

    //check for cooldowns
    if (!cooldowns.has(command.name)) {
        cooldowns.set(command.name, new Discord.Collection());
    }

    let now = Date.now();
    let timestamps = cooldowns.get(command.name);
    let cooldownAmount = (command.cooldown || 3) * 1000; //in miliseconds

    if (timestamps.has(message.author.id)) {
        let expirationTime = timestamps.get(message.author.id) + cooldownAmount;
        if (now < expirationTime) {
            let timeLeft = (expirationTime - now) / 1000;
            return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
        }
    }

    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

    try {
        command.execute(client, message, args);
    } catch (error) {
        client.logger.error(error);
        message.reply('there was an error trying to execute that command!');
    }
});

client.login(token);