const Discord = require('discord.js');

module.exports = async (bot, oldEmoji, newEmoji) => {
    const rows = await bot.db.query(`select * from serverInfo where serverID = ${newEmoji.guild.id}`).catch(bot.errHandle);
    if (rows != undefined) {
        const botPerms = newEmoji.guild.me.hasPermission(['SEND_MESSAGES', 'VIEW_AUDIT_LOG', 'EMBED_LINKS'], { checkAdmin: true, checkOwner: false });
        const logCHNL = newEmoji.guild.channels.cache.find(chnl => chnl.id === rows[0].serverClogID);
        if (botPerms) {
            if (rows[0].serverLog === 'Y' && logCHNL) {
                let executor = await newEmoji.guild.fetchAuditLogs({ type: 'EMOJI_UPDATE', limit: 1 }).then(aLog => aLog.entries.first().executor).catch(bot.errHandle);
                if (!executor) {
                    const embed = new Discord.MessageEmbed()
                    .setAuthor('Emoji renamed')
                    .setDescription(`By: Unknown\nFrom: ${oldEmoji.name}\nTo: ${newEmoji.name}`)
                    .setColor('#2381ee')
                    .setTimestamp();
                    return logCHNL.send(embed).catch(bot.errHandle);
                } else {
                    const embed = new Discord.MessageEmbed()
                    .setAuthor('Emoji renamed')
                    .setDescription(`By: ${executor}\nFrom: ${oldEmoji.name}\nTo: ${newEmoji.name}`)
                    .setColor('#2381ee')
                    .setTimestamp();
                    return logCHNL.send(embed).catch(bot.errHandle);
                }
            }
        }
    } else { return bot.errL.send('Issue occured trying to log emoji renaming in a server, should it occur commonly check code').catch(bot.errHandle); }
};