module.exports = {
	name: 'run',
	description: 'What are you even trying to run?',
	usage: '<what is this>',
	async execute(client, message) {
		let arr = [0];
		while (arr.length <= 5 - 1) {
			var r = Math.floor(Math.random() * (11 - 1)) + 1;
			if (arr.indexOf(r) === -1) arr.push(r);
		}
		console.log(arr);
		message.channel.send(arr);

	},
};