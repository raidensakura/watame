module.exports = {
    name: 'ping',
    cooldown: 5,
    description: 'Ping!',
    guildOnly: true,
	execute(message, args) {
		message.channel.send('pong!');
	},
};