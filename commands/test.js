module.exports = {
    name: 'test',
    description: 'What are you even trying to test?',
    usage: '<what is this>',
    aliases: ['testing'],
    cooldown: 5,
    guildOnly: false,
    DMOnly: false,
    ownerOnly: false,
    staffOnly: false,
    args: false,
    async execute(client, message, args) {
        let response = await client.awaitReply(message, "what are you testing, exactly?");
        if (response) {
            let replies = ["I see...", "Okay then...", "Weird, but okay..."];
            message.channel.send(`${response}? ${replies[Math.floor(Math.random() * replies.length)]}`);
        } else return;
    },
};