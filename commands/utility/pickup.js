const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('pickup')
		.setDescription('Replies with uplifting message.'),
	async execute(interaction) {
		await interaction.reply('Always remember you are braver than you believe, stronger than you seem, smarter than you think and twice as beautiful as you’d ever imagined.');
	},
};