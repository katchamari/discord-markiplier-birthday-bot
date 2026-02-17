const { MessageMentions } = require("discord.js");

function isUrl(str) {
  try {
    new URL(str);
    return true;
  } catch (e) {
    return false;
  }
}
function isMention(str) {
  return /<@!*&*[0-9]+>/.test(str);
}
function isChannelMention(str) {
  return /<#[0-9]+>/.test(str);
}
function isEmote(str) {
  return /<:\w+:[0-9]+>/.test(str);
}
function isPlainWord(str) {
  const tests = [isUrl, isMention, isChannelMention, isEmote];
  for (let test of tests) {
    if (test(str)) return false;
  }
  return true;
}
module.exports = {
  isPlainWord,
};
