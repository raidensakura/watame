module.exports = {
    name: 'ping',
    cooldown: 5,
    description: 'Ping!',
    guildOnly: true,
    execute(client, message, args) {
        const responseTime = Math.round(Date.now() - message.createdTimestamp);
        client.logger.log(`${message.author.tag} pinged me!`);
        message.channel.send({
            embed: {
                color: 16023551,
                title: "Pong!",
                description: `That took ${responseTime}ms`,
                footer: {
                    text: `${client.user.username} ❤ ${message.author.username}`
                }
            }
        });
    },
};