# Watame ![Sheep](https://cdn.discordapp.com/emojis/684213920319537195.gif?v=1&size=40)

[![Watame Banner](https://i.postimg.cc/kGjccYP9/watame-banner.jpg)](https://www.youtube.com/channel/UCqm3BQLlJfvkTsX_hvm0UmA)

[![Deploy](https://img.shields.io/github/workflow/status/Raphilia/watame/Deploy/production?logo=github)](https://github.com/Raphilia/watame/actions) [![GitHub Issues](https://img.shields.io/github/issues/raphilia/watame)](https://github.com/Raphilia/watame/issues) ![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/raphilia/watame)

A Discord bot I like to write during my free time. It was originally made for just one purpose: To ask quizzes to users, and then assign specific roles based on the answers, kind of like the sorting hat in Harry Potter.

## Why watame

Because [Tsunomaki Watame](https://www.youtube.com/channel/UCqm3BQLlJfvkTsX_hvm0UmA) is just that cute and something [Raiden](https://github.com/raidensakura) liked when he started making this.

Please [subscribe](https://www.youtube.com/channel/UCqm3BQLlJfvkTsX_hvm0UmA?sub_confirmation=1) to her.

![Watame](https://yt3.ggpht.com/a/AATXAJzqZYR2ukuLZqCDgdsg9eid13borfDPzVBwTIDc=s300-c-k-c0xffffffff-no-rj-mo)

## Requirements

- `git` command line ([Windows](https://git-scm.com/download/win)|[Linux](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)|[MacOS](https://git-scm.com/download/mac)) installed
- `node` [Version 14 or 16 required](https://nodejs.org)
- The node-gyp build tools. This is a pre-requisite for Enmap, but also for a **lot** of other modules. See [The Enmap Guide](https://enmap.evie.codes/install#pre-requisites) for details and requirements for your OS. Just follow what's in the tabbed block only, then come back here!

You also need your bot's token. This is obtained by creating an application in
the [Developer section](https://discord.com/developers) of discord.com. Check the [first section of this page](https://anidiots.guide/getting-started/the-long-version.html) 
for more info.

## Intents

Watame uses intents which are required as of October 7, 2020. 
You can enable privileged intents in your bot page 
(the one you got your token from) under `Privileged Gateway Intents`.

By default Watame needs the Guilds, Guild Messages and Direct Messages intents to work.
For join messages to work you need Guild Members, which is privileged.
User counts that Watame has in places such as in the ready log, and the stats 
command may be incorrect without the Guild Members intent.

Intents are loaded from your config, and will get created by the setup scripts.

For more info about intents checkout the [official Discord.js guide page](https://discordjs.guide/popular-topics/intents.html) and the [official Discord docs page](https://discord.com/developers/docs/topics/gateway#gateway-intents).
## Downloading

In a command prompt in your projects folder (wherever that may be) run the following:

`git clone https://github.com/raidensakura/watame.git`

Once finished: 

- In the folder from where you ran the git command, run `cd watame` and then run `npm install`
- **If you get any error about python or msibuild.exe or binding, read the requirements section again!**

Run `node setup.js` to generate a proper configuration file and settings.

## Starting the bot

To start the bot, in the command prompt, run the following command:
`node index.js`

## Inviting to a guild

To add the bot to your guild, you have to get an oauth link for it. 

You can use this site to help you generate a full OAuth Link, which includes a calculator for the permissions:
[https://finitereality.github.io/permissions-calculator/?v=0](https://finitereality.github.io/permissions-calculator/?v=0)
