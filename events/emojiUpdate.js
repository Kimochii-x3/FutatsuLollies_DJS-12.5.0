const Discord = require('discord.js');

module.exports = async (bot, oldEmoji, newEmoji, errorLogs) => {
    const rows = await bot.db.query(`select * from serverInfo where serverID = ${newEmoji.guild.id}`).catch(err => errorLogs.send(err));
    const botPerms = await newEmoji.guild.me.hasPermission(['SEND_MESSAGES', 'VIEW_AUDIT_LOG', 'EMBED_LINKS'], { checkAdmin: true, checkOwner: false }).catch(err => errorLogs.send(err));
    const logCHNL = newEmoji.guild.channels.cache.find(chnl => chnl.id === rows[0].serverClogID);
    if (botPerms) {
        if (rows[0].serverLog === 'Y' && logCHNL) {
            let executor = await newEmoji.guild.fetchAuditLogs({ type: 'EMOJI_UPDATE', limit: 1 }).then(aLog => aLog.entries.first().executor).then(u => { if (u) { return u; } else if (!u) { return executor = 'Unknown'; } } ).catch(err => errorLogs.send(err));
            const embed = new Discord.MessageEmbed()
            .setAuthor('Emoji renamed')
            .setDescription(`By: ${executor}\nFrom: ${oldEmoji.name}\nTo: ${newEmoji.name}`)
            .setColor('#2381ee')
            .setTimestamp();
            return logCHNL.send(embed);
        } else if (rows[0].serverLog === 'N' || !logCHNL) { return; }
    } else if (!botPerms) { return; }
};