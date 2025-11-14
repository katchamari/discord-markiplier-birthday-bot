const { SlashCommandBuilder, bold, codeBlock } = require("discord.js");
const dayjs = require("dayjs");
const customParseFormat = require("dayjs/plugin/customParseFormat");
const fetchData = require("../helpers/fetchData");
const markSmashes = require("../helpers/markSmashes");
dayjs.extend(customParseFormat);

const pokeApiUrl = "https://pokeapi.co/api/v2";
module.exports = {
  data: new SlashCommandBuilder()
    .setName("smash-or-pass")
    .setDescription("Smash or pass pokemon"),
  async execute(interaction) {
    const { count } = await fetchData(`${pokeApiUrl}/pokemon-species/?limit=0`);
    const randomNumber = Math.floor(Math.random() * count);

    const {
      varieties = [],
      name,
      flavor_text_entries = [],
    } = await fetchData(`${pokeApiUrl}/pokemon-species/${randomNumber}`);

    const { sprites } = await fetchData(
      varieties.find(({ is_default }) => is_default).pokemon.url
    );

    const { flavor_text } = flavor_text_entries.filter(
      ({ language }) => language.name === "en"
    )[0];
    const formattedName = name.slice(0, 1).toUpperCase() + name.slice(1);
    const certifiedMarkSmash = markSmashes.find(
      (smashName) => smashName.toLowerCase() === name.toLowerCase()
    );
    await interaction.reply({
      embeds: [
        {
          image: { url: sprites.front_default },
          description: `${bold(formattedName)}
${codeBlock(flavor_text)}
          
This pokemon is ${
            !certifiedMarkSmash ? "not " : ""
          } a certified Markiplier smash!
          `,
        },
      ],
      poll: {
        question: { text: `${formattedName}: Smash or pass?` },
        answers: [
          { text: "Smash", emoji: "🔥" },
          { text: "Pass", emoji: "🚫" },
        ],
        allow_multiselect: true,
        duration: 1,
        layout_type: 1,
      },
    });
  },
};
