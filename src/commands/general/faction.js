/*
 * hey there! this command file is customized for Sleeping Knights server
 * though feel free to modify these values below if you know what you are doing
 */

const { BOT_URL } = require('../../data/config.js');

const quiz = require('../../data/quiz.json');

const EmbedGenerator = require('../../modules/sendEmbed');

const ms = require('ms');

module.exports = {
	name: 'faction',
	description: 'Quiz-based role assignment for Sleeping Knights server.',
	aliases: ['factions', 'quiz', 'quizzes'],
	DMOnly: true,
	cooldown: 5,
	execute(client, message) {
		let server, member;
		async function fetchServer() {
			try {
				server = await client.guilds.cache.get('616969119685935162');
				member = await server.members.cache.get(message.author.id);

				if (!server.member(message.author.id)) {
					return message.channel.send(EmbedGenerator.generate(`Command is for members of the Sleeping Knights server only`)
						.setDescription('Consider joining us at: https://sleepingknights.moe/discord'));
				}

				checkRole();
			} catch (e) {
				return client.logger.error(`Error fetching server for ${message.author.tag}`, e);
			}
		}

		let seregamers, sereaxis;
		async function checkRole() {
			try {
				seregamers = await server.roles.cache.find(role => role.name.toLowerCase() === 'seregamers');
				sereaxis = await server.roles.cache.find(role => role.name.toLowerCase() === 'sereaxis');

				const hasRole = await member.roles.cache.some(role => role.name.toLowerCase() === 'seregamers')
					|| await member.roles.cache.some(role => role.name.toLowerCase() === 'sereaxis');

				const response = await client.awaitReply(message, 'Starting a quiz will reset your previous faction role. Proceed? `Y/N`', true, true)
				if (!response) return;

				if (response.toLowerCase() === 'y') {
					if (hasRole) removeRole();
					askQuestion();
				} else if (response.toLowerCase() === 'n') {
					return message.channel.send('Role retained, quiz cancelled.');
				} else {
					return message.channel.send('Invalid reply, please run the command again.');
				}

			} catch (e) {
				return client.logger.error(`Error trying to fetch role for ${message.author.tag}`, e);
			}
		}

		async function removeRole() {
			try {
				await member.roles.remove(seregamers, 'Faction quiz role removal');
				await member.roles.remove(sereaxis, 'Faction quiz role removal');
			} catch (e) {
				return client.logger.error(`Error removing role for ${message.author.tag}`, e);
			}
		}

		let questionsToAsk = 5;
		if (quiz.length < questionsToAsk) questionsToAsk = quiz.length;

		let i = 0, points = 0;

		function arrayGenerator() {
			let arr = [];
			while (arr.length <= questionsToAsk) {
				let r = Math.floor(Math.random() * quiz.length);
				if (arr.indexOf(r) === -1) arr.push(r);
			}
			return arr;
		}

		let array = arrayGenerator();

		async function askQuestion() {
			try {
				const timeout = '2m';

				let q = await message.channel.send(EmbedGenerator.generate(`${quiz[array[i]].question}`)
					.setURL(BOT_URL)
					.addField('Choose your answer:', quiz[array[i]].description)
					.addField('Awaiting your response...', `This prompt will automatically expire after ${ms(ms(timeout), { long: true })}`)
					.addField('Hint:', 'Abort the quiz anytime with `abort`'));

				const filter = response => {
					return quiz[array[i]].answers.some(answer => (answer.toLowerCase() === response.content.toLowerCase()
						|| (response.content.toLowerCase() === 'abort')) && (response.author.id === message.author.id));
				};

				let answered = false;

				message.channel.awaitMessages(filter, { max: 1, time: ms(timeout), errors: ['time'] })
					.then(async collected => {
						await q.delete();

						if (collected.first().content === 'abort') return message.channel.send('Quiz aborted.');

						const answerIndex = quiz[array[i]].answers.indexOf(collected.first().content.toLowerCase());
						points = points + quiz[array[i]].points[answerIndex];
						answered = true; i++;

						if (i === questionsToAsk) {
							return giveRole();
						}

						if (answered) askQuestion();
					})
					.catch(() => {
						return q.delete();
					});
			} catch (e) {
				return client.logger.error(e);
			}
		}

		async function giveRole() {
			try {
				switch (true) {
					case points >= 50:
						await member.roles.add(seregamers, 'Obtained from Faction quiz');
						await message.channel.send(`Congrats! You have been awarded **${seregamers.name}** role.`);
						break;
					case points <= -50:
						await member.roles.add(sereaxis, 'Obtained from Faction quiz');
						await message.channel.send(`Congrats! You have been awarded **${sereaxis.name}** role.`);
						break;
					case points < 50 && points > -50:
						client.logger.log(`${message.author.tag} is faction neutral`);
						message.channel.send('You prefer to live in both factions, thus no role has been assigned.');
						break;
					default:
						client.logger.error(`There's something wrong with ${message.author.tag}'s points: ${points}`);
						message.channel.send('Something went wrong calculating your score.\nPlease tell my owner about this.');
						break;
				}
			} catch (e) {
				client.logger.error(`Error giving role for ${message.author.tag}`, e);
				return message.channel.send('Error trying to give faction role.');
			}
		}

		fetchServer();
	},
};
