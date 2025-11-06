const { ActivityType } = require("discord-api-types/v10");
const ErrorClass = require("./ErrorClass");

class Activity {
  constructor([type, name, status = "online", url]) {
    const allowedTypes = [
      "Playing",
      "Streaming",
      "Listening",
      "Watching",
      "Competing",
      "Custom",
    ];
    const allowedStatuses = ["online", "idle", "dnd", "invisible"];
    if (!allowedTypes.includes(type))
      throw new ErrorClass(`${type} is not an allowed activity type`);
    if (!allowedStatuses.includes(status))
      throw new ErrorClass(`${status} is not an allowed status`);
    const activity = {
      name,
      type: ActivityType[type],
    };
    if (url) activity.url = url;
    this.activities = [activity];
    this.status = status;
  }
}

const activities = [
  ["Playing", "Five Nights at Freddy's"],
  ["Playing", "Five Nights at Freddy's 2"],
  ["Playing", "Five Nights at Freddy's 3"],
  ["Playing", "Five Nights at Freddy's 4"],
  ["Playing", "Five Nights at Freddy's: Sister Location"],
  ["Playing", "Freddy Fazbear's Pizzeria Simulator"],
  ["Playing", "Ultimate Custom Night"],
  ["Playing", "Five Nights at Freddy's: Help Wanted"],
  ["Playing", "Five Nights at Freddy's: Security Breach"],
  ["Custom", "Petting Chica"],
  ["Custom", "Playing with Chica"],
  ["Custom", "Adoring Chica"],
  ["Custom", "Talking to Chica"],
  ["Custom", "Feeding Chica"],
  ["Custom", "Loving on Chica"],
  ["Watching", "Iron Lung"],
  ["Playing", "Iron Lung"],
  ["Custom", "Recording Distractible"],
  ["Custom", "Recording Powerwash Pals"],
  ["Custom", "Recording Go! My Favorite Sports Team!"],
  ["Listening", "Edge of Sleep"],
  ["Custom", "Filming Iron Lung"],
];

module.exports = {
  Activity,
  activities,
};
