const ms = require("ms");
module.exports = {
    name: 'mute',
    description: 'Temporarily mute a user.',
    usage: '<user> <time: 10s/10m/1h>',
    guildOnly: true,
    staffOnly: true,
    args: true,
    async execute(client, message, args) {
        let tomute = await message.guild.member(message.mentions.members.first() || message.guild.members.cache.get(args[0]));
        if (!tomute) return message.reply('Couldn\'t find user.');
        if (tomute.hasPermission("MANAGE_MESSAGES")) return message.reply('That user is an admin/mod!');
        let muterole = message.guild.roles.cache.find(role => role.name === "Muted");
        if (!muterole) {
            try {
                muterole = await message.guild.createRole({
                    name: "Muted",
                    color: "#000000",
                    permissions: []

                })
                message.guild.channels.array.forEach(async (channel, id) => {
                    await channel.overwritePermission(muterole, {
                        SEND_MESSAGES: false,
                        ADD_REACTION: false,
                    })
                });
            } catch {
                console.log(e.stack);
            }
        }
        let mutetime = args[1];
        if (!mutetime) message.reply('You didn\'t specify mute time.');

        try {
            await (tomute.roles.add(muterole.id));
            message.channel.send(`${tomute} has been muted for ${ms(ms(mutetime))}`);

            setTimeout(() => {
                tomute.roles.remove(muterole.id);
                message.channel.send(`${tomute} has been unmuted.`);
            }, ms(mutetime));
        } catch {
            client.logger.error(error);
            message.reply('there was an error trying to mute that user.');
        }
    },
};