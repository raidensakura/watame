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
        if (tomute.hasPermission("MANAGE_MESSAGES")) return message.reply('that user is an admin/mod!');
        let muterole = message.guild.roles.cache.find(role => role.name === "Muted");
        if (!muterole) {
            try {
                muterole = await message.guild.roles.create({
                    data: {
                        name: 'Muted',
                        permissions: []
                      },
                      reason: 'Mute role creation'
                });
                client.logger.log(`Created "${muterole.name}" role in ${message.guild.name} server`);
                message.guild.channels.cache.forEach(async (channel, id) => {
                    await channel.updateOverwrite(muterole, {
                        SEND_MESSAGES: false,
                        ADD_REACTION: false,
                    })
                });
                client.logger.log(`Updated all channel overrides for the role.`);
            } catch(e) {
                client.logger.error(e.stack);
                message.reply('there was an error trying to create role for this server.');
            }
        }
        let mutetime = args[1];
        if (!mutetime) message.reply('you didn\'t specify mute time.');

        try {
            await (tomute.roles.add(muterole.id));
            message.channel.send(`${tomute} has been muted for ${ms(ms(mutetime))}`);

            setTimeout(() => {
                tomute.roles.remove(muterole.id);
                message.channel.send(`${tomute} has been unmuted.`);
            }, ms(mutetime));
        } catch(e) {
            client.logger.error(e.stack);
            message.reply('there was an error trying to mute that user.');
        }
    },
};