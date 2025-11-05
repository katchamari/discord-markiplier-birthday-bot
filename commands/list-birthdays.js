const {
  SlashCommandBuilder,
  blockQuote,
  userMention,
  bold,
} = require("discord.js");
const BirthdayService = require("../services/BirthdayService");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("list-birthdays")
    .setDescription("List all user birthdays"),
  async execute(interaction) {
    console.log("sdfdsf");
    const birthdayService = new BirthdayService({
      queryObj: { guildId: interaction.guildId },
    });
    const birthdays = await birthdayService.getResources();
    if (!birthdays.length)
      return interaction.reply(
        blockQuote(
          "I (Markiplier) can't find any birthdays saved. Try setting some with /set-user-birthday!"
        )
      );
    const birthdayList = await Promise.all(
      birthdays.map(async (birthday) => {
        const user = await interaction.client.users.fetch(birthday.userId);
        return `
${bold("User:")} ${user.username} 
${bold("Birthday:")} ${birthday.date.month}/${birthday.date.day}/${
          birthday.date.year
        }
`;
      })
    );
    interaction.reply(blockQuote(birthdayList.join(``)));
  },
};
