/*
 * hey there! this command file is customized for Sleeping Knights server
 * though feel free to modify these values below if you know what you are doing
 */

// Sleeping Knights server ID
const serverID = '616969119685935162';
const quiz = require('../data/quiz.json');

module.exports = {
	name: 'faction',
	description: 'Quiz-based role assignment for Sleeping Knights server.',
	aliases: ['factions', 'quiz', 'quizzes'],
	DMOnly: true,
	requireTag: true,
	cooldown: 15,
	execute(client, message, args, Tag) {
		// for debugging purposes
		if (args[0] === 'debug') {
			return message.channel.send('Debug mode on.');
		}

		let server, member;
		async function fetchServer() {
			try {
				server = await client.guilds.cache.get(serverID);
				member = await server.members.cache.get(message.author.id);

				// cancel operation if user is not inside the server
				if (!server.member(message.author.id)) {
					let msg = 'This command is for members of the Sleeping Knights server only.\nConsider joining us at: https://discord.com/invite/htn3D8p';
					return message.channel.send(msg);
				}

				checkRole();
			} catch (error) {
				client.logger.error(`On fetchServer() for ${message.author.tag}: ${error}`);
				message.channel.send('Error trying to fetch server info.');
			}
		}

		let seregamers, sereaxis;
		async function checkRole() {
			try {
				seregamers = await server.roles.cache.find(role => role.name.toLowerCase() === 'seregamers');
				sereaxis = await server.roles.cache.find(role => role.name.toLowerCase() === 'sereaxis');

				let hasRole = await member.roles.cache.some(role => role.name.toLowerCase() === 'seregamers')
					|| await member.roles.cache.some(role => role.name.toLowerCase() === 'sereaxis');

				if (hasRole) {
					let response = await client.awaitReply(message, 'Seems like you already have a faction role. Reset? `Y/N`');
					if (!response) return message.channel.send('Command timed out.');
					if (response.toLowerCase() === 'y') {
						let removed = await removeRole();
						if (removed) askQuestion();
					} else if (response.toLowerCase() === 'n') {
						return message.channel.send('Role retained, quiz cancelled.');
					} else {
						return message.channel.send('Invalid reply, please run the command again.');
					}
				} else askQuestion();

			} catch (error) {
				client.logger.error(`On CheckRole() for ${message.author.tag}: ${error}`);
			}
		}

		async function removeRole() {
			try {
				await member.roles.remove(seregamers, 'Faction quiz role removal');
				await member.roles.remove(sereaxis, 'Faction quiz role removal');
				return message.channel.send('Your faction role was reset.');
			} catch (error) {
				client.logger.error(`On removeRole() for ${message.author.tag}: ${error}`);
				message.channel.send('Error trying to remove your role.');
			}
		}

		// generate an array of unique number for the question indexes
		function uniqueRandom(questionAmount, quizLength) {
			// 0 is the first question which is a prompt
			let arr = [0];
			while (arr.length <= questionAmount - 1) {
				let r = Math.floor(Math.random() * (quizLength - 1)) + 1;
				if (arr.indexOf(r) === -1) arr.push(r);
			}
			return arr;
		}

		let i = 0, points = 0;
		// how many questions will be asked, including the first prompt
		let length = 6;

		// if quiz.json has less questions than the amount that'll be asked, fix
		if (quiz.length < length) length = quiz.length - 1;

		let array = uniqueRandom(length, quiz.length);

		async function askQuestion() {
			const filter = response => {
				return quiz[array[i]].answers.some(answer => (answer.toLowerCase() === response.content.toLowerCase()
					|| (response.content.toLowerCase() === 'abort')) && (response.author.id === message.author.id));
			};

			let q = await message.channel.send(quiz[array[i]].question);
			let answered;
			message.channel.awaitMessages(filter, { max: 1, time: 120000, errors: ['time'] })
				.then(async collected => {
					if (collected.first().content === 'abort') return message.channel.send('Quiz aborted.');

					let answerIndex = quiz[array[i]].answers.indexOf(collected.first().content.toLowerCase());
					points = points + quiz[array[i]].points[answerIndex];
					answered = true; i++;

					await q.delete();

					if (i === length) {
						return saveScore(message.author.id, points);
					}

					if (answered) askQuestion();
				})
				.catch(collected => {
					return message.channel.send('Quiz timed out.');
				});
		}

		async function saveScore(authorUID, score) {
			try {
				// equivalent to: INSERT INTO tags (uid, score) values (?, ?);
				await Tag.create({
					uid: authorUID,
					score: score,
				});
				client.logger.log(`Tag with ${score}p added for ${message.author.tag}`);
			} catch (e) {
				if (e.name === 'SequelizeUniqueConstraintError') {
					let affectedRows = await Tag.update({ score: points }, { where: { uid: authorUID } });
					if (affectedRows > 0) {
						client.logger.log(`Tag with ${score} points updated for ${message.author.tag}`);
					} else {
						client.logger.error(`Could not find tag for ${message.author.tag}`);
					}
				}
			}
			giveRole();
		}

		async function giveRole() {
			try {
				switch (true) {
					case points >= 50:
						await member.roles.add(seregamers, 'Obtained from Faction quiz');
						await message.channel.send('Congrats! You have been awarded `SereGamers` role.');
						client.logger.log(`${message.author.tag} obtained SereGamers role`);
						break;
					case points <= -50:
						await member.roles.add(sereaxis, 'Obtained from Faction quiz');
						await message.channel.send('Congrats! You have been awarded `SereAxis` role.');
						client.logger.log(`${message.author.tag} obtained SereAxis role`);
						break;
					case points < 50 && points > -50:
						client.logger.log(`${message.author.tag} is faction neutral`);
						message.channel.send('Seems like you live in between of both factions.\nPerfectly balanced, as all things should be.');
						break;
					default:
						client.logger.error(`There's something wrong with ${message.author.tag}'s points: ${points}`);
						message.channel.send('Something went wrong calculating your score.\nPlease tell my owner about this.');
						break;
				}
			} catch (error) {
				client.logger.error(`Error executing giveRole() for ${message.author.tag}: ${error}`);
				message.channel.send('Error trying to give faction role.');
			}
		}

		fetchServer();
	},
};
