const Discord = require('discord.js');

module.exports = async (bot, member) => {
    const rows = await bot.db.query('SELECT * FROM serverInfo WHERE serverID = ?', [member.guild.id]).catch(bot.errHandle);
    if (rows != undefined) {
        const botPerms = member.guild.me.hasPermission(['SEND_MESSAGES', 'VIEW_AUDIT_LOG', 'EMBED_LINKS'], { checkAdmin: true, checkOwner: false });
        const logCHNL = member.guild.channels.cache.find(chnl => chnl.id === rows[0].serverClogID);
        if (botPerms) {
            if (rows[0].serverLog === 'Y' && logCHNL) {
                const tempTimestamp = Date.now();
                const aLogFound = await member.guild.fetchAuditLogs({ type: 'MEMBER_KICK', limit: 1 }).then(aLog => aLog.entries.first()).catch(bot.errHandle);
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
                            if (userRole) { userRole.delete(`Member ${member.user.tag} left the server'`).catch(bot.errHandle); }
                            return logCHNL.send(embedLeave).catch(bot.errHandle);
                        } else {
                            const executor = aLogFound.executor.user.id;
                            const embedKick = new Discord.MessageEmbed()
                            .setAuthor('User kicked')
                            .setDescription(`Moderator: <@${executor}>\n Member: **${member.user.tag}**`)
                            .setColor('#c4150f')
                            .setTimestamp();
                            if (userRole) { userRole.delete(`Member ${member.user.tag} was kicked from the server`).catch(bot.errHandle); }
                            return logCHNL.send(embedKick).catch(bot.errHandle);
                        }
                    } else {
                        if (userRole) { userRole.delete(`Member ${member.user.tag} left the server`).catch(bot.errHandle); }
                        return logCHNL.send(embedLeave).catch(bot.errHandle);
                    }
                } else {
                    const embedLeave = new Discord.MessageEmbed()
                    .setAuthor('User leave')
                    .setDescription(`Username: **${member.user.tag}**`)
                    .setColor('#c4150f')
                    .setTimestamp();
                    return logCHNL.send(embedLeave);
                    }
            }
        }
    } else { return bot.errL.send('Issue occured trying to log member leaving in a server, should it occur commonly check code').catch(bot.errHandle); }
};
module.exports.help = {
  name: ''
};
