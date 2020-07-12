module.exports = {
    name: 'test',
    description: 'What are you even trying to test?',
    usage: '<what is this>',
    aliases: ['testing'],
    cooldown: 5, //cooldown amount in seconds
    guildOnly: false, //if command is server-only
    DMOnly: false, //if command is DM only
    ownerOnly: false, //if command is for bot owner only
    staffOnly: false, //if command is for guild staff only
    requireTag: false, //if command require database
    args: false, //if command require argument
    async execute(client, message, args) {
        let response = await client.awaitReply(message, "what are you testing, exactly?");
        if (response) {
            let replies = ["I see...", "Okay then...", "Weird, but okay..."];
            message.channel.send(`${response}? ${replies[Math.floor(Math.random() * replies.length)]}`);
        } else return;
    },
};