const Discord = require('discord.js');

module.exports = async (bot, message, errorLogs) => {
    if (message.channel.type !== 'dm') {
        const rows = await bot.db.query(`SELECT * FROM serverInfo WHERE serverID = '${message.guild.id}'`).catch(err => errorLogs.send(err));
        const botPerms = await message.guild.me.hasPermission(['SEND_MESSAGES', 'EMBED_LINKS'], { checkAdmin: true, checkOwner: false }).catch(err => errorLogs.send(err));
        const logCHNL = message.guild.channels.cache.find(chnl => chnl.id === rows[0].serverClogID);
        if (botPerms) {
            if (rows[0].serverLog === 'Y' && logCHNL) {
                const mFiles = await message.attachments.map(a => a.proxyURL);
                if (mFiles.length === 0) {
                  const mDelete = new Discord.MessageEmbed()
                  .setAuthor(message.author.tag, message.author.displayAvatarURL)
                  .setDescription(`**Message sent by **${message.author}** was deleted in **${message.channel}\n${message.content}`)
                  .setColor('#c4150f')
                  .setTimestamp()
                  .setFooter(`Author ID: ${message.author.id} & Message ID: ${message.id}`);
                  return logCHNL.send(mDelete);
                } else if (mFiles.length >= 1) {
                  mFiles.forEach(async (a, index, array) => {
                    a = mFiles[index];
                      if (a.toString().includes('.png') || a.toString().includes('.gif') || a.toString().includes('.jpg') || a.toString().includes('.jpeg') || a.toString().includes('.tiff') || a.toString().includes('.tif') || a.toString().includes('.bmp')) {
                        const mDelete = new Discord.MessageEmbed()
                        .setAuthor(message.author.tag, message.author.displayAvatarURL)
                        .setDescription(`**Message sent by **${message.author}** was deleted in **${message.channel}\n${message.content}`)
                        .setColor('#c4150f')
                        .setTimestamp()
                        .setImage(a.toString())
                        .setFooter(`Author ID: ${message.author.id} & Message ID: ${message.id}`);
        
                        { setTimeout(() => { logCHNL.send(mDelete); }, 1250); }
                        return;
                      } else {
                        const mDelete = new Discord.MessageEmbed()
                        .setAuthor(message.author.tag, message.author.displayAvatarURL)
                        .setDescription(`**Message sent by **${message.author}** was deleted in **${message.channel}\n${message.content}\n**File format not an image: **${a}`)
                        .setColor('#c4150f')
                        .setTimestamp()
                        .setFooter(`Author ID: ${message.author.id} & Message ID: ${message.id}`);
                        return logCHNL.send(mDelete); 
                      }
                  });
                }
            } else if (rows[0].serverLog === 'N' || !logCHNL) { return; }
        } else if (!botPerms) { return; }
    } else { return; }
};
module.exports.help = {
  name: ''
};
