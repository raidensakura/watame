/**
 * * hey there! this command file is customized for Sleeping Knights server
 * * though feel free to modify these values below if you know what you are doing
 * * otherwise just discard it and use the rest of the bot features
 */
const serverID = '616969119685935162'; //Sleeping Knights server ID
const quiz = require('../data/quiz.json');
const Sequelize = require('sequelize');
const sequelize = new Sequelize('database', 'user', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'database.sqlite', //sqlite only
});

module.exports = {
    name: 'faction',
    description: 'Quiz-based role assignment for Sleeping Knights server.',
    aliases: ['factions', 'quiz', 'quizzes'],
    DMOnly: true,
    cooldown: 15,
    execute(client, message, args) {
        const Tags = sequelize.define('faction', {
            uid: {
                type: Sequelize.STRING,
                unique: true,
            },
            score: {
                type: Sequelize.INTEGER,
                defaultValue: 500,
                allowNull: false,
            },
        });

        let server, member;
        async function fetchServer() {
            client.logger.log(`${message.author.tag} started quiz command.`);
            try {
                server = await client.guilds.cache.get(serverID);
                member = await server.members.cache.get(message.author.id);

                //cancel operation if user is not inside the server
                if (!server.member(message.author.id)) {
                    let msg = 'This command is for members of the Sleeping Knights server only.\
                    \nConsider joining us at: <https://sleepingknights.moe/discord>';
                    return message.channel.send(msg);
                }

            } catch (error) {
                client.logger.error(error);
                client.logger.error(`There was an error fetching server for ${message.author.tag}.`);
                return message.channel.send('Error trying to fetch Sleeping Knights server info.');
            }
            checkRole();
        }

        let seregamers, sereaxis;
        async function checkRole() {
            seregamers = await message.guild.roles.cache.find(role => role.name.toLowerCase() === 'seregamers');
            sereaxis = await message.guild.roles.cache.find(role => role.name.toLowerCase() === 'sereaxis');
            let hasRole = member.roles.cache.some(role => role.name.toLowerCase() === 'seregamers')
            || member.roles.cache.some(role => role.name.toLowerCase() === 'sereaxis');

            if (hasRole) {
                let response = await client.awaitReply(message, "Seems like you already have a faction role. Reset? `yes` or `no`");
                if (!response) return message.channel.send('Command timed out.');
                if (response.toLowerCase() === 'yes') {
                    try {
                        await member.roles.remove(seregamers);
                        await member.roles.remove(sereaxis);
                        client.logger.log(`Removed faction role from ${message.author.tag}.`);
                        message.channel.send('Your faction role was reset.');
                    } catch (error) {
                        client.logger.error(error);
                        client.logger.error(`There was an error removing faction role for ${message.author.tag}.`);
                        message.channel.send('Error trying to remove your role.');
                    }
                } else if (response.toLowerCase() === 'no') {
                    client.logger.log(`Quiz cancelled for ${message.author.tag}`);
                    return message.channel.send('Role retained, quiz cancelled.');
                } else {
                    client.logger.log(`Quiz cancelled for ${message.author.tag} due to invalid reply.`);
                    return message.channel.send('Invalid reply, please run the command again.');
                }
            }
            askQuestion();
        }

        let increment = 0, points = 0;
        function askQuestion() {
            const filter = response => {
                return quiz[increment].answers.some(answer => (answer.toLowerCase() === response.content.toLowerCase()
                    || (response.content.toLowerCase() === 'abort')) && (response.author.id === message.author.id));
            };

            message.channel.send(quiz[increment].question).then(() => {
                let answered = 'no';
                message.channel.awaitMessages(filter, { max: 1, time: 120000, errors: ['time'] })
                    .then(async collected => {
                        if (collected.first().content === 'abort') {
                            client.logger.log(`${message.author.tag} aborted quiz.`);
                            return message.channel.send('Quiz aborted.');
                        }

                        let answerIndex = quiz[increment].answers.indexOf(collected.first().content.toLowerCase());
                        points = points + quiz[increment].points[answerIndex];

                        client.logger.log(`${collected.first().author.tag} now has ${points} points at Q[${increment}].`);
                        answered = 'yes'; increment++;
                        if (increment === quiz.length) {
                            answered = 'finished';
                            client.logger.log(`${collected.first().author.tag} answered all questions.`);
                            message.channel.send('Quiz completed.');
                            await giveRole();
                            return saveScore(message.author.id, points);
                        }
                        if (answered === 'yes') askQuestion();
                    })
                    .catch(collected => {
                        client.logger.log(`${message.author.tag} timed out from quiz.`);
                        return message.channel.send('Quiz timed out.');
                    });
            });
        }

        async function saveScore(authorUID, points) {
            try {
                // equivalent to: INSERT INTO tags (uid, score) values (?, ?);
                let tag = await Tags.create({
                    uid: authorUID,
                    score: points,
                });
                client.logger.log(`Tag added for ${collected.first().author}.`);
            }
            catch (e) {
                if (e.name === 'SequelizeUniqueConstraintError') {
                    client.logger.log('Tag already exist. Updating existing record...');
                    let affectedRows = await Tags.update({ score: points }, { where: { uid: authorUID } });
                    if (affectedRows > 0) {
                        client.logger.log(`Tag updated for ${message.author.tag}.`);
                    } else {
                        client.logger.error(`Could not find tag for ${message.author.tag}.`);
                    }
                }
            }
            Tags.sync();
        }

        async function giveRole() {
            if (points >= sereGamersPoints) {
                try {
                    await member.roles.add(seregamers);
                    await message.channel.send('You have been awarded `SereGamers` role.');
                    await client.logger.log(`Gave ${message.author.tag} SereGamers role.`);
                } catch (error) {
                    client.logger.error(error);
                    client.logger.error(`There was an error trying to give SereGamers role to ${message.author.tag}.`);
                    message.channel.send('Error trying to give SereGamers role.');
                }
            } else if (points <= sereAxisPoints) {
                try {
                    await member.roles.add(sereaxis);
                    await message.channel.send('You have been awarded `SereAxis` role.');
                    await client.logger.log(`Gave ${message.author.tag} SereAxis role.`);
                } catch (error) {
                    client.logger.error(error);
                    client.logger.error(`There was an error trying to give SereAxis role to ${message.author.tag}.`);
                    message.channel.send('Error trying to give SereGamers role.');
                }
            } else if (points > sereAxisPoints && points < sereGamersPoints) {
                client.logger.log(`${message.author.tag} ended up being neutral.`);
                message.channel.send('Seems like you live in between of both factions.\
                \nPerfectly balanced, as all things should be.');
            } else {
                client.logger.error(`There's something wrong with ${message.author.tag}'s points: ${points}`);
                message.channel.send('Something went wrong calculating your score.\
                \nPlease tell my owner about this, thank you!');
            }
        }
        fetchServer();
    },
};