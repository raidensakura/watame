const genshinModel = require('../../data/models/Genshin.js');

const EmbedGenerator = require('../../modules/sendEmbed');

module.exports = {
	name: 'genshin',
	description: 'A command used to display Genshin Impact player info',
	usage: '<user mention/add/remove> [Genshin UID] [Server] [Name]',
	guildOnly: true,
	args: true,
	async execute(client, message, args) {
		let rowCount, user;
		const servers = ['america', 'europe', 'asia', 'tw']
		switch (args[0]) {
			case 'add':

				if (args[1].length !== 9 && /^\d+$/.test(args[1])) {
					return message.reply('Invalid UID provided, it must be 9 characters and contain numbers only.');
				}

				if (!servers.includes(args[2].toLowerCase())) {
					return message.reply('Invalid server provided, it must be America/Europe/Asia/TW.')
				}

				try {
					const tag = await genshinModel.findOne({ where: { discord_uid: message.author.id } });
					if (tag) {
						await genshinModel.update({ genshin_uid: args[1], server: args[2], name: args[3] }, { where: { discord_uid: message.author.id } });
						return message.channel.send('Player data successfully updated :thumbsup:');
					} else {
						await genshinModel.create({
							discord_uid: message.author.id,
							genshin_uid: args[1],
							server: args[2],
							name: args[3],
						});
						message.channel.send('Player data successfully added :thumbsup:');
					}
				} catch (e) {
					if (e.name === 'SequelizeUniqueConstraintError') {
						return message.reply('That tag already exists.');
					}
					client.logger.error(e.stack);
					message.reply('error trying to add into database.');

				}
				break;
			case 'remove':
				rowCount = await genshinModel.destroy({ where: { discord_uid: message.author.id } });
				if (!rowCount) return client.logger.log('that tag did not exist.');
				else client.logger.log('Tag entry successfully deleted.');
				message.channel.send('Successfully removed your player data :thumbsup:');
				break;
			default:
				user = await message.mentions.users.first();
				if (!user) {
					return message.reply('No user was found under that name.');
				} else {
					const tag = await genshinModel.findOne({ where: { discord_uid: user.id } });
					if (!tag) return message.channel.send('No player data found under that user.');
					message.channel.send(EmbedGenerator.generate(`Genshin Impact Player Profile`)
						.setURL('https://genshin.mihoyo.com/')
						.setDescription(`Displaying info for ${user}`)
						.addField('UID:', tag.genshin_uid)
						.addField('Server:', tag.server[0].toUpperCase() + tag.server.substring(1))
						.addField('Name:', (tag.name) ? tag.name : 'Unspecified')
						.setThumbnail(user.avatarURL()));
				}
				break;
		}
	}

};