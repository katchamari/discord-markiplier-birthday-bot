const { Client, Collection, GatewayIntentBits } = require("discord.js");
require("dotenv").config();
const { TOKEN, MONGO_URI, MY_GUILD } = process.env;
const fs = require("node:fs");
const path = require("node:path");
const mongoose = require("mongoose");
const { startCronJob } = require("./cron");
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessagePolls,
  ],
});
mongoose.set("strictQuery", true);
async function connectToDatabase() {
  const mongoConfig = {};
  if (process.env.FIXIE_SOCKS_HOST) {
    const fixieData = process.env.FIXIE_SOCKS_HOST.split(
      new RegExp("[/(:\\/@/]+")
    );
    mongoConfig.proxyUsername = fixieData[0];
    mongoConfig.proxyPassword = fixieData[1];
    mongoConfig.proxyHost = fixieData[2];
    mongoConfig.proxyPort = fixieData[3];
  }
  mongoose.connect(MONGO_URI, mongoConfig);
}
connectToDatabase().catch((err) => console.log(err));

client.commands = new Collection();
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  if ("data" in command && "execute" in command) {
    client.commands.set(command.data.name, command);
  } else {
    console.log(
      `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
    );
  }
}

client.once("clientReady", async () => {
  console.log("Ready!");
  const guild = client.guilds.cache.get(MY_GUILD);

  if (guild) {
    console.log("Registering commands for guild...");
    await guild.commands.set(client.commands.map((cmd) => cmd.data));
    console.log("Guild commands registered");
  } else {
    console.log("Registering global commands...");
    await client.application.commands.set(
      client.commands.map((cmd) => cmd.data)
    );
    console.log("Global commands registered");
  }
  startCronJob(client);
});

client.on("interactionCreate", async (interaction) => {
  if (interaction.isAutocomplete()) {
    const command = client.commands.get(interaction.commandName);
    if (!command || !command.autocomplete) return;

    try {
      await command.autocomplete(interaction);
    } catch (error) {
      console.error(error);
    }
    return;
  }
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    const unknownErrorAsMarkiplier = `Markplier found an error :(`;
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: `
${unknownErrorAsMarkiplier}
${error.customMessage || error.message}
        `,
      });
    } else {
      await interaction.reply({
        content: `
${unknownErrorAsMarkiplier}
${error.customMessage || error.message}
        `,
      });
    }
  }
});
client.login(TOKEN);
