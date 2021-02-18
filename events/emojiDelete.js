const Discord = require('discord.js');

module.exports = async (bot, emoji) => {
    const rows = await bot.db.query('select * from serverInfo where serverID = ?', [emoji.guild.id]).catch(bot.errHandle);
    if (rows != undefined) {
        const botPerms = emoji.guild.me.hasPermission(['SEND_MESSAGES', 'VIEW_AUDIT_LOG', 'EMBED_LINKS', 'MANAGE_EMOJIS'], { checkAdmin: true, checkOwner: false });
        const logCHNL = emoji.guild.channels.cache.find(chnl => chnl.id === rows[0].serverClogID);
        if (botPerms) {
            if (rows[0].serverLog === 'Y' && logCHNL) {
                let executor = await emoji.guild.fetchAuditLogs({ type: 'EMOJI_DELETE', limit: 1 }).then(aLog => aLog.entries.first().executor).catch(bot.errHandle);
                if (!executor) {
                    const embed = new Discord.MessageEmbed()
                    .setAuthor('Emoji deleted')
                    .setDescription(`By: Unknown\nName: ${emoji.name}\nID: ${emoji.id}`)
                    .setColor('#ff3a28')
                    .setTimestamp();
                    return logCHNL.send(embed).catch(bot.errHandle);
                } else {
                    const embed = new Discord.MessageEmbed()
                    .setAuthor('Emoji deleted')
                    .setDescription(`By: ${executor}\nName: ${emoji.name}\nID: ${emoji.id}`)
                    .setColor('#ff3a28')
                    .setTimestamp();
                    return logCHNL.send(embed).catch(bot.errHandle);
                }
            } 
        }
    } else { return bot.errL.send('Issue occured trying to log emoji deletion in a server, should it occur commonly check code').catch(bot.errHandle); }
};