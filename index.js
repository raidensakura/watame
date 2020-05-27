//location of your config file
const { prefix, token, ownerID } = require('./config.json');
const fs = require('fs');
const Discord = require('discord.js');
const client = new Discord.Client();
const cooldowns = new Discord.Collection();
client.commands = new Discord.Collection();
require('./commands/faction.js');
require('log-timestamp');

if (!prefix || !token || !ownerID) {
    prefix = process.env.prefix;
    token = process.env.token;
    ownerID = process.env.ownerID;
}

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', message => {
    //cancel message if it doesn't start with the prefix or coming from a bot
    if (message.content.toLowerCase() === 'ayy') return message.channel.send('lmao');
    if (message.content.toLowerCase() === 'watame wa') return message.channel.send('waruku nai yo nee');
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    //slices off the prefix and the argument
    const args = message.content.slice(prefix.length).split(/ +/);
    //create a command variable 
    const commandName = args.shift().toLowerCase();
    //cancel if command has an aliases
    const command = client.commands.get(commandName)
        || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command) return;

    //check if command is guild only
    if (command.guildOnly && message.channel.type !== 'text') {
        return message.reply('I can\'t execute that command inside DMs!');
    }

    //check if command is DM only
    if (command.DMOnly && message.channel.type == 'text') {
        message.reply('I can\'t execute that command outside DMs!');
        return;
    }

    //check if command is owner only
    if (command.ownerOnly && message.author.id !== ownerID) {
        message.reply('Sorry but only my owner can do that.');
        return;
    }

    //check if command contains any argument
    if (command.args && !args.length) {
        let reply = `You didn't provide any arguments, ${message.author}!`;

        if (command.usage) {
            reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
        }

        return message.channel.send(reply);
    }

    //check for cooldown
    if (!cooldowns.has(command.name)) {
        cooldowns.set(command.name, new Discord.Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || 3) * 1000;

    if (timestamps.has(message.author.id)) {
        const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

        if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000;
            return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
        }
    }

    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

    try {
        command.execute(client, message, args);
        module.exports = {client};
    } catch (error) {
        console.error(error);
        message.reply('there was an error trying to execute that command!');
    }
});

client.login(token);