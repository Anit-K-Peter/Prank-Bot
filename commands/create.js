const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('create')
    .setDescription('Create channels')
    .addIntegerOption(option => option.setName('count').setDescription('The number of channels to create').setRequired(true))
    .addStringOption(option => option.setName('name').setDescription('The name of the channels').setRequired(true))
    .addStringOption(option => option.setName('text').setDescription('The text to send to each channel').setRequired(true)),
  async execute(interaction) {
    const count = interaction.options.getInteger('count');
    const name = interaction.options.getString('name');
    const text = interaction.options.getString('text');

    if (count > 75) {
      await interaction.reply({ content: 'Maximum count is 75', ephemeral: true });
      return;
    }

    await interaction.deferReply();

    const channels = [];

    for (let i = 1; i <= count; i++) {
      const channelName = `${name} #${i}`;
      const channel = await interaction.guild.channels.create({
        name: channelName,
        type: 0, // 0 for text channel, 2 for voice channel
      });
      channels.push(channel.id);
      await channel.send(text);
    }

    const channelsJson = JSON.stringify(channels, null, 2);
    fs.writeFileSync('channels.json', channelsJson);

    await interaction.followUp({ content: `Created ${count} channels and sent the text to each channel`, ephemeral: true });
    await interaction.followUp({ content: 'Finished making and sending text!', ephemeral: true });
  }
};