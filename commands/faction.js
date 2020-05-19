const quiz = require('./quiz.json');
const Sequelize = require('sequelize');
const sequelize = new Sequelize('database', 'user', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    // SQLite only
    storage: 'database.sqlite',
});

module.exports = {
    name: 'faction',
    description: 'Quiz-based role assignment.',
    //DMOnly: true,
    execute(message, args) {
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
        //do stuff here
        var increment = 0;
        var points = 0;

        function askQuestion() {
            const filter = response => {
                return quiz[increment].answers.some(answer => answer.toLowerCase() === response.content.toLowerCase());
            };
    
            message.channel.send(quiz[increment].question).then(() => {
                var answered = 'no';
                message.channel.awaitMessages(filter, { max: 1, time: 30000, errors: ['time'] })
                    .then(collected => {
                        if (collected.first().content === 'abort') {
                            message.channel.send('Aborting...');
                            return;
                        }
                        message.channel.send(`${collected.first().author} got the correct answer!`);

                        var answerIndex = quiz[increment].answers.indexOf(collected.first().content);
                        points = points + quiz[increment].points[answerIndex];

                        console.log("you now have" + points);
                        answered = 'yes';
                        increment++;

                        if (increment == quiz.length) {
                            message.channel.send('Quiz completed.');
                            return;
                        }
                        if (answered == 'yes') askQuestion();
                    })
                    .catch(collected => {
                        message.channel.send('Quiz exited.');
                        console.log(collected);
                        return;
                    });
            });
        }

        
        askQuestion();
        Tags.sync();
    },
};