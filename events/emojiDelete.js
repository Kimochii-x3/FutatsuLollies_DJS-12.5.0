const Discord = require('discord.js');

module.exports = async (bot, emoji, errorLogs) => {
    const rows = await bot.db.query(`select * from serverInfo where serverID = ${emoji.guild.id}`).catch(err => errorLogs.send(err));
    const botPerms = await emoji.guild.me.hasPermission(['SEND_MESSAGES', 'VIEW_AUDIT_LOG', 'EMBED_LINKS', 'MANAGE_EMOJIS'], { checkAdmin: true, checkOwner: false }).catch(err => errorLogs.send(err));
    const logCHNL = emoji.guild.channels.cache.find(chnl => chnl.id === rows[0].serverClogID);
    if (botPerms) {
        if (rows[0].serverLog === 'Y' && logCHNL) {
            let executor = await emoji.guild.fetchAuditLogs({ type: 'EMOJI_DELETE', limit: 1 }).then(aLog => aLog.entries.first().executor).then(u => { if (u) { return u; } else if (!u) { return executor = 'Unknown'; } } ).catch(err => errorLogs.send(err));
            const embed = new Discord.MessageEmbed()
            .setAuthor('Emoji deleted')
            .setDescription(`By: ${executor}\nName: ${emoji.name}\nID: ${emoji.id}`)
            .setColor('#ff3a28')
            .setTimestamp();
            return logCHNL.send(embed);
        } else if (rows[0].serverLog === 'N' || !logCHNL) { return; }
    } else if (!botPerms) { return; }
};