const Discord = require('discord.js');

module.exports = async (bot, guild) => {
    const chnl = bot.channels.cache.get('727205516048203787');
    await chnl.send(`Left ${guild.name} / ${guild.id}, unforknife`).catch(bot.errHandle);
};
