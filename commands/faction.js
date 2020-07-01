/*
 * hey there! this command file is customized for Sleeping Knights server
 * though feel free to modify these values below if you know what you are doing
 */

//Sleeping Knights server ID
const serverID = '616969119685935162';

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
    //DMOnly: true,
    cooldown: 15,
    execute(client, message, args) {
        const Tags = sequelize.define('faction', {
            uid: {
                type: Sequelize.STRING,
                unique: true,
            },
            score: {
                type: Sequelize.INTEGER,
                defaultValue: 0,
                allowNull: false,
            },
        });

        //for debugging purposes
        if (args[0] === 'debug') {
            return message.channel.send('Debug mode on.');
        }

        let server, member;
        async function fetchServer() {
            try {
                server = await client.guilds.cache.get(serverID);
                member = await server.members.cache.get(message.author.id);

                //cancel operation if user is not inside the server
                if (!server.member(message.author.id)) {
                    let msg = 'This command is for members of the Sleeping Knights server only.\nConsider joining us at: https://discord.com/invite/htn3D8p';
                    return message.channel.send(msg);
                }

            } catch (error) {
                client.logger.error(`Error fetching server for ${message.author.tag}: ${error}`);
                return message.channel.send('Error trying to fetch server info.');
            }
            checkRole();
        }

        let seregamers, sereaxis;
        async function checkRole() {
            try {
                seregamers = await server.roles.cache.find(role => role.name.toLowerCase() === 'seregamers');
                sereaxis = await server.roles.cache.find(role => role.name.toLowerCase() === 'sereaxis');

                let hasRole = await member.roles.cache.some(role => role.name.toLowerCase() === 'seregamers')
                    || await member.roles.cache.some(role => role.name.toLowerCase() === 'sereaxis');
                let removedRole = 1;
                if (hasRole) removedRole = await removeRole();

                if (removedRole) askQuestion();

            } catch (error) {
                client.logger.log(`Error on function checkRole() for ${message.author.tag}: ${error}`);
            }
        }

        async function removeRole() {
            let response = await client.awaitReply(message, 'Seems like you already have a faction role. Reset? `yes` or `no`');
            if (!response) return message.channel.send('Command timed out.');
            if (response.toLowerCase() === 'yes') {
                try {
                    if (seregamers) await member.roles.remove(seregamers, 'Faction quiz role removal');
                    if (sereaxis) await member.roles.remove(sereaxis, 'Faction quiz role removal');
                    message.channel.send('Your faction role was reset.');
                    return 1;
                } catch (error) {
                    client.logger.error(`Error removing faction role for ${message.author.tag}: ${error}`);
                    message.channel.send('Error trying to remove your role.');
                }
            } else if (response.toLowerCase() === 'no') {
                message.channel.send('Role retained, quiz cancelled.');
            } else {
                message.channel.send('Invalid reply, please run the command again.');
            }
        }

        //generate an array of unique number for the question indexes
        function uniqueRandom(questionAmount, quizLength) {
            var arr = [0]; //0 is the first question which is a prompt
            while (arr.length <= questionAmount - 1) {
                var r = Math.floor(Math.random() * (quizLength - 1)) + 1;
                if (arr.indexOf(r) === -1) arr.push(r);
            }
            return arr;
        }

        let i = 0, points = 0;
        length = 6; //how many questions will be asked, including the first prompt

        //if quiz.json has less questions than the amount that'll be asked, fix
        if (quiz.length < length) length = quiz.length - 1;

        let indexArray = uniqueRandom(length, quiz.length);

        client.logger.log(`${message.author.tag} started quiz command`);

        async function askQuestion() {
            const filter = response => {
                return quiz[indexArray[i]].answers.some(answer => (answer.toLowerCase() === response.content.toLowerCase()
                    || (response.content.toLowerCase() === 'abort')) && (response.author.id === message.author.id));
            };

            await message.channel.send(quiz[indexArray[i]].question).then(() => {
                let answered = 0;
                message.channel.awaitMessages(filter, { max: 1, time: 120000, errors: ['time'] })
                    .then(async collected => {
                        if (collected.first().content === 'abort') return message.channel.send('Quiz aborted.');

                        let answerIndex = quiz[indexArray[i]].answers.indexOf(collected.first().content.toLowerCase());
                        points = points + quiz[indexArray[i]].points[answerIndex];

                        client.logger.log(`${collected.first().author.tag} now has ${points} points at Q[${i}].`);
                        answered = 1; i++;
                        if (i === length) {
                            client.logger.log(`${collected.first().author.tag} completed quiz.`);
                            await giveRole();
                            return saveScore(message.author.id, points);
                        }
                        if (answered === 1) askQuestion();
                    })
                    .catch(collected => {
                        client.logger.log(`${message.author.tag} timed out.`);
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
            try {
                switch (true) {
                    case points >= 50:
                        await member.roles.add(seregamers, 'Obtained from Faction quiz');
                        await message.channel.send('Congrats! You have been awarded `SereGamers` role.');
                        client.logger.log(`${message.author.tag} obtained SereGamers role.`);
                        break;
                    case points <= -50:
                        await member.roles.add(sereaxis, 'Obtained from Faction quiz');
                        await message.channel.send('Congrats! You have been awarded `SereAxis` role.');
                        client.logger.log(`${message.author.tag} obtained SereAxis role.`);
                        break;
                    case points < 50 && points > -50:
                        client.logger.log(`${message.author.tag} is faction neutral.`);
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