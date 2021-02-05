const Discord = require('discord.js');

module.exports = async (bot, member, errorLogs) => {
    const rows = await bot.db.query(`SELECT * FROM serverInfo WHERE serverID = '${member.guild.id}'`).catch(err => errorLogs.send(err));
    const botPerms = await member.guild.me.hasPermission(['SEND_MESSAGES', 'VIEW_AUDIT_LOG', 'EMBED_LINKS'], { checkAdmin: true, checkOwner: false }).catch(err => errorLogs.send(err));
    const logCHNL = member.guild.channels.cache.find(chnl => chnl.id === rows[0].serverClogID);
    if (botPerms) {
        if (rows[0].serverLog === 'Y' && logCHNL) {
            const tempTimestamp = Date.now();
            const aLogFound = await member.guild.fetchAuditLogs({ type: 'MEMBER_KICK', limit: 1 }).then(aLog => aLog.entries.first()).catch(err => errorLogs.send(err));
            if (aLogFound) {
                const uTarget = aLogFound.target;
                const aLogTimestamp = aLogFound.createdTimestamp;
                const userRole = member.guild.roles.cache.find(role => role.name === `USER-${member.id}`);
    
                const embedLeave = new Discord.MessageEmbed()
                .setAuthor('User leave')
                .setDescription(`Username: **${member.user.tag}**`)
                .setColor('#c4150f')
                .setTimestamp();
    
                if (tempTimestamp <= aLogTimestamp + 10000) {
                    if (uTarget.id !== member.id) {
                        if (userRole) { userRole.delete(`Member ${member.user.tag} left the server'`); }
                        return logCHNL.send(embedLeave);
                    } else if (uTarget.id === member.id) {
                        const executor = await member.guild.fetchAuditLogs({ type: 'MEMBER_KICK', limit: 1 }).then(aLog => aLog.entries.first().executor).then(user => user.id).catch(err => errorLogs.send(err));
                        const embedKick = new Discord.MessageEmbed()
                        .setAuthor('User kicked')
                        .setDescription(`Moderator: <@${executor}>\n Member: **${member.user.tag}**`)
                        .setColor('#c4150f')
                        .setTimestamp();
                        if (userRole) { userRole.delete(`Member ${member.user.tag} was kicked from the server`); }
                        return logCHNL.send(embedKick);
                    }
                } else if (tempTimestamp >= aLogTimestamp + 10000) {
                    if (userRole) { userRole.delete(`Member ${member.user.tag} left the server`); }
                    return logCHNL.send(embedLeave);
                }
            } else {
                const embedLeave = new Discord.MessageEmbed()
                .setAuthor('User leave')
                .setDescription(`Username: **${member.user.tag}**`)
                .setColor('#c4150f')
                .setTimestamp();
                return logCHNL.send(embedLeave);
                }
        } else if (rows[0].serverLog === 'N' || !logCHNL) { return; }
    } else if (!botPerms) { return; }
};
module.exports.help = {
  name: ''
};
