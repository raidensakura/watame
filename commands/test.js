module.exports = {
	name: 'test',
	description: 'What are you even trying to test?',
	usage: '<what is this>',
	aliases: ['testing'],
	// cooldown amount in seconds
	cooldown: 5,
	// if command is server-only
	guildOnly: false,
	// if command is DM only
	DMOnly: false,
	// if command is for bot owner only
	ownerOnly: false,
	// if command is for guild staff only
	staffOnly: false,
	// if command require database
	requireTag: false,
	// if command require argument
	args: false,
	async execute(client, message) {
		let response = await client.awaitReply(message, "what are you testing, exactly?");
		if (response) {
			let replies = ["I see...", "Okay then...", "Weird, but okay..."];
			message.channel.send(`${response}? ${replies[Math.floor(Math.random() * replies.length)]}`);
		} else return;
	},
};