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
        let server, member, increment = 0, points = 0;

        async function fetchServer() {
            try {
                server = await client.guilds.cache.get(serverID);
                member = await server.members.cache.get(message.author.id);
            } catch (error) {
                console.log(error);
                console.log(`There was an error fetching server for ${message.author.tag}.`);
            }
            checkRole();
        }

        async function checkRole() {
            if (member.roles.cache.some(role => role.id === sereGamersID || role.id === sereAxisID)) {
                message.author.send("Seems like you already have a faction role. Reset? `yes`/`no`");
                const collector = new Discord.MessageCollector(message.channel, m => m.author.id === message.author.id, { max: 1, time: 10000 });
                collector.on('collect', message => {
                    if (message.content.toLowerCase() == "yes") {
                        try {
                            member.roles.remove(sereGamersID);
                            member.roles.remove(sereAxisID);
                            message.channel.send("Your faction role was reset.");
                        } catch (error) {
                            console.log(error);
                            console.log(`There was an error removing faction role for ${message.author.tag}.`);
                        }
                        askQuestion();
                    } else if (message.content.toLowerCase() == "no") {
                        console.log(`Quiz cancelled for ${message.author.tag}`);
                        message.channel.send("Role retained, quiz cancelled.");
                        return;
                    }
                })
            } else {
                askQuestion();
            }
        }

        function askQuestion() {
            const filter = response => {
                return quiz[increment].answers.some(answer => (answer.toLowerCase() === response.content.toLowerCase() || response.content.includes('abort')) && response.author.id === message.author.id);
            };

            message.channel.send(quiz[increment].question).then(() => {
                let answered = 'no';
                message.channel.awaitMessages(filter, { max: 1, time: 30000, errors: ['time'] })
                    .then(collected => {
                        if (collected.first().content === 'abort') {
                            message.channel.send('Quiz aborted.');
                            console.log(`${message.author.tag} completed quiz.`);
                            return;
                        }

                        let answerIndex = quiz[increment].answers.indexOf(collected.first().content);
                        points = points + quiz[increment].points[answerIndex];

                        console.log(`${collected.first().author.tag} now have ${points} points.`);
                        answered = 'yes'; increment++;

                        if (increment == quiz.length) {
                            message.channel.send('Quiz completed.');
                            saveScore(collected.first().author, points);
                            return;
                        }
                        if (answered == 'yes') askQuestion();
                    })
                    .catch(collected => {
                        message.channel.send('Quiz timed out.');
                        console.log(`${collected.first().author.tag} timed out from quiz.`);
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
                console.log(`Tag added for ${collected.first().author}.`);
            }
            catch (e) {
                if (e.name === 'SequelizeUniqueConstraintError') {
                    console.log('That tag already exist. Trying to update existing record...');

                    const affectedRows = await Tags.update({ score: points }, { where: { uid: authorUID } });

                    if (affectedRows > 0) {
                        return console.log(`Tag was edited.`);
                    }
                    return console.log(`Could not find a tag with name.`);
                }
            }
            Tags.sync();
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
        fetchServer();
    },
};