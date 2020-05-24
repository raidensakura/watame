const quiz = require('./quiz.json');
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
        let increment = 0, points = 0, authorUID;

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
                        answered = 'yes';
                        increment++;
                        authorUID = `${collected.first().author}`;
                        console.log(filter);

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
                    const server = await client.guilds.cache.get('616969119685935162');
                    const isMember = await server.members.cache.get(message.author.id);
                    await isMember.roles.add('661176820481261598');
                    await message.channel.send('You have been awarded `SereGamers` role.');
                } catch (error) {
                    console.log(error);
                }
            } else if (points <= 400) {
                try {
                    const server = await client.guilds.cache.get('616969119685935162');
                    const isMember = await server.members.cache.get(message.author.id);
                    await isMember.roles.add('661792409419776006');
                    await message.channel.send('You have been awarded `SereAxis` role.');
                } catch (error) {
                    console.log(error);
                }
            } else {
                message.channel.send('Seems like you live in between of both factions.\
                \nPerfectly balanced, as all things should be.');
                return;
            }
        }
        askQuestion();
        Tags.sync();
    },
};