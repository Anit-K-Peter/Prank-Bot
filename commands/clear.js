const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Clear channels'),
  async execute(interaction) {
    const channelsJson = fs.readFileSync('channels.json', 'utf8');
    const channelIds = JSON.parse(channelsJson);

    if (channelIds.length === 0) {
      await interaction.reply({ content: 'No channels to clear', ephemeral: true });
      return;
    }

    await interaction.deferReply();

    const confirmationMessage = await interaction.followUp({
      content: `Are you sure you want to delete ${channelIds.length} channels?`,
      components: [
        {
          type: 1,
          components: [
            {
              type: 2,
              label: 'Yes',
              style: 3,
              customId: 'yes',
            },
            {
              type: 2,
              label: 'No',
              style: 4,
              customId: 'no',
            },
          ],
        },
      ],
    });

    const filter = (i) => i.customId === 'yes' || i.customId === 'no';
    const collector = confirmationMessage.createMessageComponentCollector({ filter, time: 30000 });

    collector.on('collect', async (i) => {
      if (i.customId === 'yes') {
        for (const channelId of channelIds) {
          const channel = interaction.guild.channels.cache.get(channelId);
          if (channel) {
            await channel.delete();
          }
        }

        fs.writeFileSync('channels.json', '[]');

        await confirmationMessage.edit({ content: 'Channels cleared', components: [] });
      } else if (i.customId === 'no') {
        await confirmationMessage.edit({ content: 'Clearing cancelled', components: [] });
      }
    });
  }
};