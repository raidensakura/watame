module.exports = (client) => {
    /*
    * SINGLE-LINE AWAITMESSAGE
    ** A simple way to grab a single reply, from the user that initiated
    **the command. Useful to get "precisions" on certain things...
    * USAGE
    ** const response = await client.awaitReply(msg, "Favourite Color?");
    ** msg.reply(`Oh, I really love ${response} too!`);
    */
    client.awaitReply = async (msg, question, limit = 60000) => {
        const filter = m => { m.author.id === msg.author.id; }
        await msg.channel.send(question);
        try {
            const collected = await msg.channel.awaitMessages(filter, { max: 1, time: limit, errors: ["time"] });
            return collected.first().content;
        } catch (e) {
            return false;
        }
    };
}