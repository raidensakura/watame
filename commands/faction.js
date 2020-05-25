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
    description: 'Quiz-based role assignment for Sleeping Knights.',
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
            console.log(`${message.author.tag} started quiz command.`);
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
            let TimeoutMessage = 'true';
            if (member.roles.cache.some(role => role.id === sereGamersID || role.id === sereAxisID)) {
                message.author.send("Seems like you already have a faction role. Reset? `yes`/`no`");
                const collector = new Discord.MessageCollector(message.channel, m => m.author.id === message.author.id, { maxMatches: 1, time: 10000 });
                collector.on('collect', message => {
                    if (message.content.toLowerCase() == "yes") {
                        try {
                            member.roles.remove(sereGamersID);
                            member.roles.remove(sereAxisID);
                            console.log(`Removed faction role(s) from ${message.author.tag}`);
                            message.channel.send("Your faction role was reset.");
                            TimeoutMessage = 'false';
                        } catch (error) {
                            console.log(error);
                            console.log(`There was an error removing faction role for ${message.author.tag}.`);
                        }
                        askQuestion();
                    } else if (message.content.toLowerCase() == "no") {
                        console.log(`Quiz cancelled for ${message.author.tag}`);
                        TimeoutMessage = 'false';
                        return message.channel.send("Role retained, quiz cancelled.");
                    }
                })
                collector.on('end', collected => {
                    if (TimeoutMessage == 'true') {
                        console.log(`${message.author.tag} timed out on role removal prompt.`);
                        message.channel.send("Prompt timed out.");
                    }
                });
            } else {
                askQuestion();
            }
        }

        function askQuestion() {
            const filter = response => {
                return quiz[increment].answers.some(answer => (answer.toLowerCase() === response.content.toLowerCase()
                    || (response.content.toLowerCase() === 'abort')) && (response.author.id === message.author.id));
            };

            message.channel.send(quiz[increment].question).then(() => {
                let answered = 'no';
                message.channel.awaitMessages(filter, { max: 1, time: 30000, errors: ['time'] })
                    .then(collected => {
                        if (collected.first().content === 'abort') {
                            message.channel.send('Quiz aborted.');
                            console.log(`${message.author.tag} aborted quiz.`);
                            return;
                        }

                        let answerIndex = quiz[increment].answers.indexOf(collected.first().content.toLowerCase());
                        points = points + quiz[increment].points[answerIndex];

                        console.log(`${collected.first().author.tag} now has ${points} points at Q[${increment}].`);
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
                        return console.log(`${message.author.tag} timed out from quiz.`);
                    });
            });
        }

        async function saveScore(authorUID, points) {
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
                    console.log('Tag already exist. Trying to update existing record...');
                    const affectedRows = await Tags.update({ score: points }, { where: { uid: authorUID } });
                    if (affectedRows > 0) {
                        return console.log(`Tag updated for ${message.author.tag}.`);
                    }
                    return console.log(`Could not find tag for ${message.author.tag}.`);
                }
            }
            Tags.sync(); giveRole();
        }

        async function giveRole() {
            if (points >= 600) {
                try {
                    await member.roles.add(sereGamersID);
                    await message.channel.send('You have been awarded `SereGamers` role.');
                    await console.log(`Gave ${message.author.tag} SereGamers role.`);
                } catch (error) {
                    console.log(error);
                    console.log(`There was an error trying to give SereGamers role to ${message.author.tag}.`);
                    message.channel.send('Error trying to give SereGamers role.');
                }
            } else if (points <= 400) {
                try {
                    await member.roles.add(sereAxisID);
                    await message.channel.send('You have been awarded `SereAxis` role.');
                    await console.log(`Gave ${message.author.tag} SereAxis role.`);
                } catch (error) {
                    console.log(error);
                    console.log(`There was an error trying to give SereAxis role to ${message.author.tag}.`);
                    message.channel.send('Error trying to give SereGamers role.');
                }
            } else {
                return message.channel.send('Seems like you live in between of both factions.\
                \nPerfectly balanced, as all things should be.');
            }
        }
        fetchServer();
    },
};