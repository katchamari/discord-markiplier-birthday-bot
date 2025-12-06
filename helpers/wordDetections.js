const markSmashes = require("./markSmashes");

module.exports = ({ message }) => {
  return [
    {
      detect: ["box", "boxes"],
      guildIds: [process.env.BOX_JOKE_GUILDS],
      react: () => message.reply("Stephen?"),
    },
    {
      detect: markSmashes,
      react: () => message.reply("Smash."),
    },
    {
      detect: ["kitty"],
      react: () => message.reply("You're so Portuguese!"),
    },
  ];
};
