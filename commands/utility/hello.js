const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('hello')
		.setDescription('Replies with Sunshine hello greeting.'),
	async execute(interaction) {
		await interaction.reply('Hello! Sending you a ray of SUNSHINE');
	},
};