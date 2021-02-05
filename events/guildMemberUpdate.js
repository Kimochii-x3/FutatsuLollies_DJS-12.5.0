const Discord = require('discord.js');

module.exports = async (bot, oldMember, newMember, errorLogs) => {
    const rows = await bot.db.query(`SELECT * FROM serverInfo WHERE serverID = '${newMember.guild.id}'`).catch(err => errorLogs.send(err));
    const botPerms = await oldMember.guild.me.hasPermission(['SEND_MESSAGES', 'VIEW_AUDIT_LOG', 'EMBED_LINKS'], { checkAdmin: true, checkOwner: false }).catch(err => errorLogs.send(err));
    const logCHNL = oldMember.guild.channels.cache.find(chnl => chnl.id === rows[0].serverClogID);
    if (botPerms) {
        if (rows[0].serverLog === 'Y' && logCHNL) {
            setTimeout(async () => {
                const log = await oldMember.guild.fetchAuditLogs({ limit: 1 }).then(aLog => aLog.entries.first());
                // console.log(log.changes[0]);
                if (log.action === 'MEMBER_ROLE_UPDATE') {
                    if (log.executor) {
                        if (log.changes[0].key === '$add') {
                            const role = oldMember.guild.roles.find(r => r.id === log.changes[0].new[0].id);
                            const r$Add = new Discord.MessageEmbed()
                            .setAuthor('Role added to member')
                            .addField('**Executor:**', log.executor)
                            .addField('**Target:**', log.target)
                            .addField('**Role:**', role)
                            // .setDescription(`Member: ${log.target}\nRole: ${role}`)
                            .setColor('#14cdfc')
                            .setTimestamp();
                            return logCHNL.send(r$Add);
                        } else if (log.changes[0].key === '$remove') {
                            const role = oldMember.guild.roles.find(r => r.id === log.changes[0].new[0].id);
                            const r$Remove = new Discord.MessageEmbed()
                            .setAuthor('Role removed from member')
                            .addField('**Executor:**', log.executor)
                            .addField('**Target:**', log.target)
                            .addField('**Role:**', role)
                            // .setDescription(`Member: ${log.target}\nRole: ${role}`)
                            .setColor('#fc2b14')
                            .setTimestamp();
                            return logCHNL.send(r$Remove);
                        }
                    } else if (!log.executor) {
                        if (log.changes[0].key === '$add') {
                            const role = oldMember.guild.roles.find(r => r.id === log.changes[0].new[0].id);
                            const r$Add = new Discord.MessageEmbed()
                            .setAuthor('Role added to member')
                            .addField('**Executor:**', 'Executor not found')
                            .addField('**Target:**', log.target)
                            .addField('**Role:**', role)
                            // .setDescription(`Member: ${log.target}\nRole: ${role}`)
                            .setColor('#14cdfc')
                            .setTimestamp();
                            return logCHNL.send(r$Add);
                        } else if (log.changes[0].key === '$remove') {
                            const role = oldMember.guild.roles.find(r => r.id === log.changes[0].new[0].id);
                            const r$Remove = new Discord.MessageEmbed()
                            .setAuthor('Role removed from member')
                            .addField('**Executor:**', 'Executor not found')
                            .addField('**Target:**', log.target)
                            .addField('**Role:**', role)
                            // .setDescription(`Member: ${log.target}\nRole: ${role}`)
                            .setColor('#fc2b14')
                            .setTimestamp();
                            return logCHNL.send(r$Remove);
                        }
                    }
                } else if (log.action === 'MEMBER_UPDATE') {
                    if (log.changes[0].key === 'nick') {
                        if (log.changes[0].old === undefined) {
                        const nick = new Discord.MessageEmbed()
                            .setAuthor('Changed nickname')
                            .setDescription(`Member: ${oldMember.user}\nFrom: **${log.target.username}**\nTo: **${log.changes[0].new}**`)
                            .setColor('GREY')
                            .setTimestamp();
                            return logCHNL.send(nick);
                        } else if (log.changes[0].new !== undefined) {
                            const nick = new Discord.MessageEmbed()
                            .setAuthor('Changed nickname')
                            .setDescription(`Member: ${oldMember.user}\nFrom: **${log.changes[0].old}**\nTo: **${log.changes[0].new}**`)
                            .setColor('GREY')
                            .setTimestamp();
                            return logCHNL.send(nick);
                        } else if (log.changes[0].new === undefined) {
                            const nick = new Discord.MessageEmbed()
                            .setAuthor('Removed nickname')
                            .setDescription(`Member: ${oldMember.user}\nFrom: **${log.changes[0].old}**\nTo: **${log.target.username}**`)
                            .setColor('GREY')
                            .setTimestamp();
                            return logCHNL.send(nick);
                        }
                    } else if (log.changes[0].key === 'mute') {
                        return;
                    }
                }
            }, 50);
        } else if (rows[0].serverLog === 'N' || !logCHNL) { return; }
    } else if (!botPerms) { return; }
};
module.exports.help = {
  name: ''
};
