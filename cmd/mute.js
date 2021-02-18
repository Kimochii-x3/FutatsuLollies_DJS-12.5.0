const Discord = require('discord.js');
const ms = require('ms');
const mute = require('../Archive update from/cmd/mute');
// mute command, lotsa code stuff, sorting permissions for channels, saving mute role to database and uhh idk what else more info in later on commenting

// 1st - bot check self perm
// 1st.A - MANAGE_CHANNELS ADD_REACTIONS MUTE_MEMBERS MANAGE_ROLES SEND_MESSAGES EMBED_LINKS
// 2nd - muterole setup by -set option
// 2nd.A - without need of perms above
// 2nd.B - when creating the mute role, possible to try and adjust it above any other role to successfully mute
// 3rd - external function to check channel perms followed by muting instead of having to write the command twice
// 3rd.A - first check category perms followed by which channels don't inherit perms from category and adjust them too
// 3rd.B - run a function to mute the member
// 4th - option to mute multiple members
// 4th.A - could use 3rd.B external function for muting
// 5th - setup to be flexible with time input
// 5th.A - make sure u adjust 3rd.B for the flexible time
// bonus1 - update option to update category and channel perms manually
module.exports = {
    name: 'mute',
    description: 'mutes a member from chat (and voice if they\'re in it), if a muted member joins voice they\'ll be muted, you need Administrator or Manage Roles permission',
    usage: 'fl.mute @<someone> / fl.mute @<someone> 5m (time is optional, cap may be 24 days)',
    cd: 0,
    guildOnly: true,
    args: true,
    async execute (bot, message, args, option, commands, prefix) {
        const botPerms = message.guild.me.hasPermission(['MANAGE_CHANNELS', 'ADD_REACTIONS', 'MUTE_MEMBERS', 'MANAGE_ROLES', 'SEND_MESSAGES', 'EMBED_LINKS'], { checkAdmin: true, checkOwner: false });
        if (option[1] && option[1].trim() === 'set') {
            const foundMuterole = message.mentions.roles.first() || message.guild.roles.cache.get(option[0]);
            if (foundMuterole) {
                await bot.db.query('update serverInfo set muteRoleID = ? where serverID = ?', [foundMuterole.id, message.guild.id]).catch(bot.errHandle);
                return message.channel.send(`Successfully changed the mute role's ID to ${foundMuterole} in the database`).catch(bot.errHandle);
                // let checkedChannelsEmbed = new Discord.MessageEmbed()
                // .setAuthor(`Checking all ${message.guild.channels.cache.size} channels for permissions`)
                // get array of channels, chunk it down, limit chunks to 10, output chunks to fields for discord embed, not necessary to do it now, can be for future update, after that is done
                // let it work on permissions for muterole, till then ppl do the perms themselves.
            } else if (!foundMuterole) {
                return message.channel.send('No role mentioned or no role id provided').catch(bot.errHandle);
            }
        } else {
            return message.channel.send('You didn\'t use `-set` option to set the mute role').catch(bot.errHandle);
        }
        if (!option[1]) {
            if (!botPerms) {
                return message.channel.send('I don\'t have either one or all of:\n`Manage Channels; Add Reactions; Mute Members; Manage Roles; Send Messages; Embed Links;`').catch(bot.errHandle);
            } else if (botPerms) {
                const rows = await bot.db.query('select * from serverInfo where serverID = ?', [message.guild.id]).catch(bot.errHandle);
                const muteRole = message.guild.roles.cache.find(role => role.id === rows[0].muteRoleID);
                const botRole = message.guild.roles.cache.find(role => role.name === 'FutatsuLollies');
                const arrMentionMembers = message.mentions.members;
                const muteTime = args.filter(arg => !arg.startsWith('<') && /\d+/g.test(arg))[0];
                if (!muteRole) {
                    await message.guild.roles.create({ data: { name: 'Axe\'d', color: 'black', permission: [], position: botRole.position-1 } }).then(async role => {
                        await bot.db.query('update serverInfo set muteRoleID = ? where serverID = ?', [role.id, role.guild.id]).catch(bot.errHandle);
                        for (const [id, channel] of message.guild.channels.cache) {
                            if (channel.type === 'category') {
                                await channel.updateOverwrite(role, { SEND_MESSAGES: false, ADD_REACTIONS: false, SPEAK: false }, 'Updating perms for the mute role' ).catch(bot.errHandle);
                            } else if (channel.type === 'text') {
                                if (!channel.permissionsLocked()) {
                                    await channel.updateOverwrite(role, { SEND_MESSAGES: false, ADD_REACTIONS: false }, 'Updating the perms for the mute role' ).catch(bot.errHandle);
                                } else if (channel.permissionsLocked() === null) {
                                    await channel.updateOverwrite(role, { SEND_MESSAGES: false, ADD_REACTIONS: false }, 'Updating the perms for the mute role' ).catch(bot.errHandle);
                                }
                            } if (channel.type === 'voice') {
                                if (!channel.permissionsLocked()) {
                                    await channel.updateOverwrite(role, { SPEAK: false }, 'Updating the perms for the mute role' ).catch(bot.errHandle);
                                } else if (channel.permissionsLocked() === null) {
                                    await channel.updateOverwrite(role, { SPEAK: false }, 'Updating the perms for the mute role' ).catch(bot.errHandle);
                                }
                            }
                        }
                        muteMember();
                    }).catch(bot.errHandle);
                } else if (muteRole) {
                    muteMember();
                }
                async function muteMember() {
                    if (message.member.hasPermission('MANAGE_ROLES', { checkAdmin: true, checkOwner: true } )) {
                        if (arrMentionMembers.length != 0) {
                            for (const mbrMen of arrMentionMembers) {
                                if (mbrMen.roles.cache.has(muteRole)) {
                                    await mbrMen.roles.remove(muteRole, 'Unmuting from voice and/or text').catch(bot.errHandle);
                                    if (mbrMen.voice.channel != null) {
                                        await mbrMen.voice.setMute(false).catch(bot.errHandle);
                                        return await message.react('✅').catch(bot.errHandle);
                                    } else if (mbrMen.voice.channel == null) {
                                        return await message.react('✅').catch(bot.errHandle);
                                    }
                                } else if (!mbrMen.roles.cache.has(muteRole)) {
                                    if (mbrMen.roles.highest.position < botRole.position) {
                                        if (!muteTime) {
                                            await mbrMen.roles.add(muteRole, 'Muting from voice and/or text').catch(bot.errHandle);
                                            if (mbrMen.voice.channel != null) {
                                                await mbrMen.voice.setMute(true).catch(bot.errHandle);
                                                return await message.react('✅').catch(bot.errHandle);
                                            } else if (mbrMen.voice.channel == null) {
                                                return await message.react('✅').catch(bot.errHandle);
                                            }
                                        } else if (muteTime) {
                                            await mbrMen.roles.add(muteRole, 'Muting from voice and/or text').catch(bot.errHandle);
                                            await bot.db.query('insert into serverMutes (userID, serverID, muteRoleID, timeUnmute) values (?, ?, ?, ?)', [mbrMen.id, message.guild.id, muteRole.id, Date.now() + ms(muteTime)]).then(() => {
                                                setTimeout(async() => {
                                                    bot.db.query('delete from serverMutes where userID = ? and serverID = ? and muteRoleID = ? and timeUnmute < ?', [mbrMen.id, mbrMen.guild.id, muteRole.id, Date.now()]).catch(bot.errHandle);
                                                }, ms(muteTime) + 3000);
                                            }).catch(bot.errHandle);
                                            if (mbrMen.voice.channel != null) {
                                                await mbrMen.voice.setMute(true).catch(bot.errHandle);
                                                setTimeout(() => {
                                                    mbrMen.roles.remove(muteRole, 'Unmuting from voice and/or text').catch(bot.errHandle);
                                                    if (mbrMen.voice.channel != null) { return mbrMen.voice.setMute(false).catch(bot.errHandle); }
                                                }, ms(muteTime)+3000);
                                                return await message.react('✅').catch(bot.errHandle);
                                            } else if (mbrMen.voice.channel == null) {
                                                setTimeout(() => {
                                                    mbrMen.roles.remove(muteRole, 'Unmuting from voice and/or text').catch(bot.errHandle);
                                                    if (mbrMen.voice.channel != null) { return mbrMen.voice.setMute(false).catch(bot.errHandle); }
                                                }, ms(muteTime) + 3000);
                                                return await message.react('✅').catch(bot.errHandle);
                                            }
                                        }
                                    } else if (mbrMen.roles.highest.position >= botRole.position) {
                                        return message.channel.send('Can\'t mute they have higher role position than mine').catch(bot.errHandle);
                                    }
                                }   
                            };
                        } else if (arrMentionMembers.length == 0) {
                            return message.channel.send('You have not mentioned any member(s)').catch(bot.errHandle);
                        }
                    } else if (!message.member.hasPermission('MANAGE_ROLES', { checkAdmin: true, checkOwner: true } )) {
                        return message.react('🤔').catch(bot.errHandle);
                    }
                };
            }
        }
        
    },
};