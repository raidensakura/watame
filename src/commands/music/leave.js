const { canModifyQueue } = require("../../modules/Utils");

module.exports = {
	name: "leave",
	description: "Leave the voice channel",
	execute(client, message) {

		if (!canModifyQueue(message.member)) return;

		const clientVoiceConnection = message.guild.me.voice.channel;
		if (!clientVoiceConnection) return;

		return clientVoiceConnection.leave();
	}
};