const Discord = require('discord.js');

module.exports = async (bot, member, errorLogs) => {
  const rows = await bot.db.query(`SELECT * FROM serverInfo WHERE serverID = '${member.guild.id}'`).catch(err => errorLogs.send(err));
  const botPerms = await member.guild.me.hasPermission(['SEND_MESSAGES', 'EMBED_LINKS'], { checkAdmin: true, checkOwner: false }).catch(err => errorLogs.send(err));
  const logCHNL = member.guild.channels.cache.find(chnl => chnl.id === rows[0].serverClogID);
    if (botPerms) {
        if (rows[0].serverLog === 'Y' && logCHNL) {
            const embed = new Discord.MessageEmbed()
            .setAuthor('User join')
            .setDescription(`Username: **${member.user.tag}**\n ID: **${member.user.id}**`)
            .setColor('GREEN')
            .setTimestamp();  
            return logCHNL.send(embed);
        } else if (rows[0].serverLog === 'N' || !logCHNL) { return; }
    } else if (!botPerms) { return; }
};
module.exports.help = {
  name: ''
};
