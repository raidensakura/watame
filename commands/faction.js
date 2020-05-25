const quiz = require('./quiz.json');
const { serverID, sereGamersID, sereAxisID } = require('../config.json');
const Discord = require('discord.js');
const Sequelize = require('sequelize');
const sequelize = new Sequelize('database', 'user', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'database.sqlite', //sqlite only
});
var server, member;

module.exports = {
    name: 'faction',
    description: 'Quiz-based role assignment.',
    DMOnly: true,
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
        let increment = 0, points = 0, authorUID;

        async function fetchServer() {
            try {
                server = await client.guilds.cache.get(serverID);
                member = await server.members.cache.get(message.author.id);
            } catch (error) {
                console.log(error);
                console.log('There was an error fetching server.');
            }
        }

        async function checkRole() {
            await fetchServer();
            if (member.roles.cache.some(role => role.id === sereGamersID || role.id === sereAxisID)) {
                message.author.send("Seems like you already have a faction role. Reset? `yes/no`");
                const collector = new Discord.MessageCollector(message.channel, m => m.author.id === message.author.id, { max: 1, time: 10000 });
                collector.on('collect', message => {
                    if (message.content.toLowerCase() == "yes") {
                        member.roles.remove(sereGamersID);
                        member.roles.remove(sereAxisID);
                        message.channel.send("Role was reset.");
                        askQuestion();
                    } else if (message.content.toLowerCase == "no") {
                        return message.channel.send("Role retained, quiz cancelled.");
                    }
                })
            }
        }

        function askQuestion() {
            const filter = response => {
                return quiz[increment].answers.some(answer => (answer.toLowerCase() === response.content.toLowerCase() || response.content.includes('abort')) && response.author.id === message.author.id);
            };

            message.channel.send(quiz[increment].question).then(() => {
                var answered = 'no';
                message.channel.awaitMessages(filter, { max: 1, time: 30000, errors: ['time'] })
                    .then(collected => {
                        if (collected.first().content === 'abort') {
                            message.channel.send('Quiz aborted.');
                            return;
                        }

                        var answerIndex = quiz[increment].answers.indexOf(collected.first().content);
                        points = points + quiz[increment].points[answerIndex];

                        console.log(`${collected.first().author.tag} now have ${points} points`);
                        answered = 'yes'; increment++;
                        authorUID = `${collected.first().author}`;

                        if (increment == quiz.length) {
                            message.channel.send('Quiz completed.');
                            saveScore(authorUID, points);
                            return;
                        }
                        if (answered == 'yes') askQuestion();
                    })
                    .catch(collected => {
                        message.channel.send('Quiz exited.');
                        console.log(`${collected.first().author.tag} timed out.`);
                        return;
                    });
            });
        }

        async function saveScore(authorUID, points) {
            giveRole();
            try {
                // equivalent to: INSERT INTO tags (name, description, username) values (?, ?, ?);
                const tag = await Tags.create({
                    uid: authorUID,
                    score: points,
                });
                console.log(`Tag added.`);
            }
            catch (e) {
                if (e.name === 'SequelizeUniqueConstraintError') {
                    console.log('That tag already exists. Trying to update existing record...');

                    const affectedRows = await Tags.update({ score: points }, { where: { uid: authorUID } });

                    if (affectedRows > 0) {
                        return console.log(`Tag was edited.`);
                    }
                    return console.log(`Could not find a tag with name.`);
                }
            }
        }

        async function giveRole() {
            if (points >= 600) {
                try {
                    await member.roles.add(sereGamersID);
                    await message.channel.send('You have been awarded `SereGamers` role.');
                } catch (error) {
                    console.log(error);
                    console.log('There was an error trying to give `SereGamers` role.')
                }
            } else if (points <= 400) {
                try {
                    await member.roles.add(sereAxisID);
                    await message.channel.send('You have been awarded `SereAxis` role.');
                } catch (error) {
                    console.log(error);
                    message.channel.send('There was an error trying to give `SereAxis` role.')

                }
            } else {
                message.channel.send('Seems like you live in between of both factions.\
                \nPerfectly balanced, as all things should be.');
                return;
            }
        }
        checkRole();
        Tags.sync();
    },
};