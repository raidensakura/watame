const ms = require("ms");

const { BOT_URL } = require('../data/config');

const EmbedGenerator = require('./sendEmbed');

module.exports = (client) => {

	/*
	* SINGLE-LINE AWAITMESSAGE
	** A simple way to grab a single reply, from the user that initiated
	**the command. Useful to get "precisions" on certain things...
	* USAGE
	** const response = await client.awaitReply(msg, "Favourite Color?");
	** msg.reply(`Oh, I really love ${response} too!`);
	*/
	client.awaitReply = async (msg, question, limit = 60000) => {
		const filter = m => m.author.id === msg.author.id;
		let prompt = await msg.channel.send(question);
		try {
			const collected = await msg.channel.awaitMessages(filter, { max: 1, time: limit, errors: ["time"] });
			await prompt.delete();
			return collected.first().content;
		} catch (e) {
			await prompt.delete();
			return false;
		}
	};

	client.awaitReplyEmbed = async (msg, question, limit = 60000) => {
		const filter = m => m.author.id === msg.author.id;
		let prompt = await msg.author.send(EmbedGenerator.generate(question)
			.setURL(BOT_URL)
			.addField('Awaiting your response...', 'This prompt will automatically expire after 1 minute'));
		try {
			const collected = await msg.channel.awaitMessages(filter, { max: 1, time: limit, errors: ["time"] });
			await prompt.delete();
			return collected.first().content;
		} catch (e) {
			await prompt.delete();
			return false;
		}
	};

	/*
	* CHECK FOR EXPIRED MUTES
	** A function that checks if a user mute expired when bot was offline
	*/
	client.checkForMute = async () => {

		const muteModel = require('../data/models/Mute.js');

		const users = await muteModel.findAll();

		if (users) {
			users.forEach(async (user) => {
				let server = await client.guilds.cache.get(user.serverid);
				let unmute = await server.members.cache.get(user.uid);
				let muterole = server.roles.cache.find(role => role.name === "Muted");
				let now = Date.now();
				try {
					if (now >= user.mutefinish) {
						removeMute();
					} else {
						let timeout = ms(user.mutefinish) - now;
						client.logger.log(`Unmuting ${unmute.user.tag} after ${ms(timeout)} in ${server.name}`);

						setTimeout(async () => {
							removeMute();
						}, timeout);
					}
				} catch (e) {
					client.logger.error(e);
				}

				async function removeMute() {
					await unmute.roles.remove(muterole);
					client.logger.log(`Removed expired Mute for ${unmute.user.tag}`);
					const rowCount = await muteModel.destroy({ where: { id: user.id } });
					if (!rowCount) return client.logger.log('Error trying to remove tag!');
				}
			});
		}
	}
};