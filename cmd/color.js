const Discord = require('discord.js');
// color command used to create a custom role color based on hex bot's color command, however it doesn't use external functions like hex bot does
module.exports = {
    name: 'color',
    description: 'creates a color role for yourself, works only with servers that have roles with the "default" color, also if the creator of the role leaves the server, the role (if it exists) will be deleted; fl.color @<someone> is to get their highest role color',
    usage: 'fl.color #<hexcode> / fl.color @<someone>',
    cd: 0,
    guildOnly: true,
    args: false,
    async execute (bot, message, args, option, commands, prefix) {
        // checks for perms before carrying on with command execution
        const botPerms = message.guild.me.hasPermission(['SEND_MESSAGES, MANAGE_ROLES, EMBED_LINKS, ADD_REACTIONS'], { checkAdmin: true, checkOwner: false });
        if (!botPerms) {
            return message.channel.send('I do not have one or more of these permissions: `Send Messages; Manage Roles; Embed Links; Add Reactions;` to my role `FutatsuLollies`').catch(bot.errHandle);
        } else {
            // after finding that placeholder role exists it has some definitions before carrying on with code, sets up preview embedded message too, then it has basic checks to see if hexCode would be someone mentioned and all that, most of the code after this is just copy paste
            function colorChanger() {
                const hexCode = args[0];
                const idOthers = message.mentions.members.first();
                const roleColor = message.guild.roles.cache.find(r => r.name === `USER-${message.author.id}`);
                const placeholder = message.guild.roles.cache.find(r => r.name === '▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇');
                const rolePreview = new Discord.MessageEmbed()
                .setDescription(`**Your role will look like this: \n${placeholder}\n${placeholder}\n${placeholder}\nDo you want to change your color?**`)
                .setColor(message.member.displayHexColor);
                if (!idOthers) {
                    if (!roleColor) {
                        if (!hexCode) {
                            return message.channel.send('No role found').catch(bot.errHandle);
                        } else if (!hexCode.startsWith('#')) {
                            return message.channel.send('Incorrect hexcode, example: `prefix`.color #ff00ff').catch(bot.errHandle);
                        } else if (hexCode.startsWith('#')) { // possibly pointless else-if?
                            await placeholder.setColor(hexCode).then(async placeholderRole => {
                                const filter = (reaction, user) => ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id;
                                message.channel.send(rolePreview).then(async botMsg => {
                                    await botMsg.react('✅').catch(bot.errHandle);
                                    await botMsg.react('❌').catch(bot.errHandle);
                                    await botMsg.awaitReactions(filter, { max: 1, time: 12000, errors: ['time'] }).then(async reacts => {
                                        const reaction = reacts.first();
                                        if (reaction.emoji.name === '✅') {
                                            const latestEmbed = botMsg.embeds[0];
                                            const acceptEmbed = new Discord.MessageEmbed(latestEmbed)
                                            .setDescription('**Role set**')
                                            .setColor(message.member.displayHexColor);
                                            message.guild.roles.create({ data: { name: `USER-${message.author.id}`, color: hexCode, position: placeholder.position +1 } }).then(async userRole => {
                                                message.member.roles.add(userRole, 'Adding the custom color role to the requester');
                                                botMsg.edit(acceptEmbed).then(async botMsgDelete => { botMsgDelete.delete( { timeout: 2000 } ).catch(bot.errHandle); }).catch(bot.errHandle);
                                            });
                                        } else if (reaction.emoji.name === '❌') {
                                            const latestEmbed = botMsg.embeds[0];
                                            const cancelEmbed = new Discord.MessageEmbed(latestEmbed)
                                            .setDescription('**Cancelled**')
                                            .setColor(message.member.displayHexColor);
                                            botMsg.edit(cancelEmbed).then(async botMsgDelete => { botMsgDelete.delete( { timeout: 2000 } ).catch(bot.errHandle); }).catch(bot.errHandle);
                                        }
                                    }).catch(() => {
                                        const latestEmbed = botMsg.embeds[0];
                                        const noResponseEmbed = new Discord.MessageEmbed(latestEmbed)
                                        .setDescription('**Times Up**')
                                        .setColor(botMsg.member.displayHexColor);
                                        botMsg.edit(noResponseEmbed).then(async botMsgDelete => { botMsgDelete.delete( { timeout: 2000 } ).catch(bot.errHandle); }).catch(bot.errHandle);
                                    });
                                }).catch(bot.errHandle);
                            }).catch(bot.errHandle);
                        }
                    } else {
                        if (!hexCode) {
                            return message.channel.send(`Your role hex code is: ${roleColor.hexColor}`).catch(bot.errHandle);
                        } else if (hexCode === 'remove') {
                            roleColor.delete('User requested to delete their custom role').catch(bot.errHandle);
                            return message.channel.send(`${roleColor} was deleted`).catch(bot.errHandle);
                        } else if (!hexCode.startsWith('#')) {
                            return message.channel.send('Incorrect hexcode, example: `prefix`.color #ff00ff').catch(bot.errHandle);
                        } else if (hexCode.startsWith('#')) { // possibly pointless else-if?
                            placeholder.setColor(hexCode).then( async placeholderRole => {
                                const filter = (reaction, user) => ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id;
                                message.channel.send(rolePreview).then(async botMsg => {
                                    await botMsg.react('✅').catch(bot.errHandle);
                                    await botMsg.react('❌').catch(bot.errHandle);
                                    await botMsg.awaitReactions(filter, { max: 1, time: 12000, errors: ['time'] }).then(async reacts => {
                                        const reaction = reacts.first();
                                        if (reaction.emoji.name === '✅') {
                                            const latestEmbed = botMsg.embeds[0];
                                            const acceptEmbed = new Discord.MessageEmbed(latestEmbed)
                                            .setDescription('**Role Updated**')
                                            .setColor(message.member.displayHexColor);
                                            roleColor.setColor(hexCode).catch(bot.errHandle);
                                            botMsg.edit(acceptEmbed).then(async botMsgDelete => { botMsgDelete.delete( { timeout: 2000 } ).catch(bot.errHandle); }).catch(bot.errHandle);
                                        } else if (reaction.emoji.name === '❌') {
                                            const latestEmbed = botMsg.embeds[0];
                                            const cancelEmbed = new Discord.MessageEmbed(latestEmbed)
                                            .setDescription('**Cancelled**')
                                            .setColor(message.member.displayHexColor);
                                            botMsg.edit(cancelEmbed).then(async botMsgDelete => { botMsgDelete.delete( { timeout: 2000 } ).catch(bot.errHandle); }).catch(bot.errHandle);
                                        }
                                    }).catch(() => {
                                        const latestEmbed = botMsg.embeds[0];
                                        const noResponseEmbed = new Discord.MessageEmbed(latestEmbed)
                                        .setDescription('**Times Up**')
                                        .setColor(botMsg.member.displayHexColor);
                                        botMsg.edit(noResponseEmbed).then(async botMsgDelete => { botMsgDelete.delete( { timeout: 2000 } ).catch(bot.errHandle); }).catch(bot.errHandle);
                                    });
                                }).catch(bot.errHandle);
                            }).catch(bot.errHandle);
                        }
                    }
                } else {
                    if (hexCode === `<@!${idOthers.id}`) { // this could definitely be different lmao like just hexCode === idOthers :omegalul:
                        const roleColorOthers = message.guild.roles.cache.find(role => role.name === `USER-${idOthers.id}`);
                        if (!roleColorOthers) {
                            return message.channel.send(`No user role found, however the highest role's hexcode is: ${idOthers.displayHexColor}`).catch(bot.errHandle);
                        } else if (roleColorOthers) {
                            return message.channel.send(`User role hexcode is: ${roleColorOthers.hexColor}`).catch(bot.errHandle);
                        }
                    }
                }
            }
            // after finding perms, it checks if a placeholder role used to preview role colors exists, if not i'll try to create it, else it'll carry on with code
            const phC = message.guild.roles.cache.find(r => r.name === '▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇');
            if (!phC) {
                message.guild.roles.create({ data: { name: '▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇' }, reason: 'Creating a placeholder role to preview the colors'}).catch(bot.errHandle);
                return colorChanger();
            } else {
                return colorChanger();
            }
        }
    },
};
