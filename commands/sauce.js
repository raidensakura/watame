const { saucenaoAPIKey } = require('../config.json');
const checkImage = require("is-image-url");
const Sagiri = require("sagiri");
module.exports = {
    name: 'sauce',
    cooldown: 10,
    description: 'Search for the source of an uploaded image.',
    guildOnly: true,
    args: true,
    usage: '<url>',
    async execute(client, message, args) {
        //check node version cuz this module needs v12
        if (Number(process.version.slice(1).split(".")[0]) < 12)
            return message.channel.send("I'm sorry but NodeJS 12 is required to run this command.");
        message.delete({ timeout: 2000 });
        message.channel.send('Give me a moment...');
        client.logger.log(`${message.author.tag} used the sauce command.`);
        args[1] = args[1] == "list" ? 5 : 1;
        const saucenao = Sagiri(saucenaoAPIKey, { "results": args[1] });

        if (!checkImage(args[0])) {
            message.channel.send("The URL you specified is not an image. Please check your URL.");
            return client.logger.log(`${message.author.tag} specified an Invalid URL for sauce.`);
        }

        var results = await saucenao(args[0]);
        message.channel.send({
            "embed": {
                "title": results[0].raw.data.title || `Image from ${results[0].site}`,
                "url": results[0].url,
                "color": 16023551,
                "footer": {
                    "icon_url": "https://i.postimg.cc/RhncfmZ0/64px-Octicons-mark-github-svg.png",
                    "text": "Courtesy of JacenBoy/michelle"
                },
                "image": { "url": results[0].thumbnail },
                "fields": [
                    { "name": "Similarity", "value": `${results[0].similarity}` },
                    { "name": "Artist", "value": `${results[0].raw.data.creator || `${results[0].raw.data.member_name} (${results[0].raw.data.member_id})`}` }
                ]
            }
        });
        client.logger.log(`Result from ${results[0].site} found for ${args[0]}`);
    },
};