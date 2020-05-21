module.exports = {
    name: 'ping',
    cooldown: 5,
    description: 'Ping!',
    guildOnly: true,
	execute(client, message, args) {
		message.channel.send('pong!');
	},
};