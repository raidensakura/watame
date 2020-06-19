const holoquote = require('./holoquote.json');
const item = holoquote[Math.floor(Math.random() * holoquote.length)];
module.exports = {
    name: 'holoquote',
    aliases: ['hq', 'quote'],
    description: 'Obtains a random quote from one of the known Vtubers.',
    guildOnly: true,
    execute(client, message, args) {
        //stuff
        message.channel.send({
            embed: {
                color: 16023551,
                title: item.author,
                description: `*${item.quote}*`,
                footer: {
                    text: `${item.group}`
                }
            }
        });
    },
};