const Discord = require('discord.js');

module.exports = async (bot, oldMember, newMember) => {
    const rows = await bot.db.query('SELECT * FROM serverInfo WHERE serverID = ?', [newMember.guild.id]).catch(bot.errHandle);
    if (rows != undefined) {
        const botPerms = oldMember.guild.me.hasPermission(['SEND_MESSAGES', 'VIEW_AUDIT_LOG', 'EMBED_LINKS'], { checkAdmin: true, checkOwner: false });
        const logCHNL = oldMember.guild.channels.cache.find(chnl => chnl.id === rows[0].serverClogID);
        if (botPerms) {
            if (rows[0].serverLog === 'Y' && logCHNL) {
                setTimeout(async () => {
                    const log = await oldMember.guild.fetchAuditLogs({ limit: 1 }).then(aLog => aLog.entries.first()).catch(bot.errHandle);
                    // console.log(log.changes[0]);
                    if (log.action === 'MEMBER_ROLE_UPDATE') {
                        if (log.executor) {
                            const role = oldMember.guild.roles.cache.find(r => r.id === log.changes[0].new[0].id);
                            const change = log.changes[0].key === '$add' ? true : false;
                            const r$Change = new Discord.MessageEmbed()
                            .setAuthor(change ? 'Role added to member' : 'Role removed from member')
                            .addField('**Executor:**', log.executor || 'Executor not found')
                            .addField('**Target:**', log.target)
                            .addField('**Role:**', role)
                            // .setDescription(`Member: ${log.target}\nRole: ${role}`)
                            .setColor(change ? '#14cdfc' : '#fc2b14')
                            .setTimestamp();
                            return logCHNL.send(r$Change).catch(bot.errHandle);
                        }
                    } else if (log.action === 'MEMBER_UPDATE') {
                        if (log.changes[0].key === 'nick') {
                            let changeDefine;
                            let changeLog;
                            if (!log.changes[0].old) {
                                changeDefine = 'Created nickname';
                                changeLog = `Member: ${oldMember.user}\nFrom: **${log.target.username}**\nTo: **${log.changes[0].new}**`;
                                return embed(changeDefine, changeLog);
                            } else if (log.changes[0].new) {
                                changeDefine = 'Changed nickname';
                                changeLog = `Member: ${oldMember.user}\nFrom: **${log.changes[0].old}**\nTo: **${log.changes[0].new}**`;
                                return embed(changeDefine, changeLog);
                            } else if (!log.changes[0].new) {
                                changeDefine = 'Removed nickname';
                                changeLog = `Member: ${oldMember.user}\nFrom: **${log.changes[0].old}**\nTo: **${log.target.username}**`;
                                return embed(changeDefine, changeLog);
                            } else {
                                changeDefine, changeLog = 'none';
                                return embed(changeDefine, changeLog);
                            }
                            function embed(changeDefine, changeLog) {
                                const nick = new Discord.MessageEmbed()
                                .setAuthor(changeDefine)
                                .setDescription(changeLog)
                                .setColor('GREY')
                                .setTimestamp();
                                return logCHNL.send(nick).catch(bot.errHandle); 
                            }
                        } else if (log.changes[0].key === 'mute') {
                            return;
                        }
                    }
                }, 50);
            }
        }
    } else { return bot.errL.send('Issue occured trying to log member role or nickname change in a server, should it occur commonly check code').catch(bot.errHandle); }
};
module.exports.help = {
  name: ''
};
