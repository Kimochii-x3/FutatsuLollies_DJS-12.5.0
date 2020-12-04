const Discord = require('discord.js');
// lookup command it takes arguments of avatar and tag and its used to lookup someone's avatar or user tag
module.exports = { 
    name: 'look',
    description: 'looks up a user\'s avatar by mentioning them or by their ID, using ID lets you lookup avatars of any member in other servers, the tag option is just for user tag and it works by ID or mentioning them',
    usage: 'fl.look avatar @<someone> / fl.look avatar <user ID> / fl.look tag @<someone> / fl.look tag <user ID>',
    cd: 0,
    guildOnly: true,
    args: true,
    async execute (bot, message, args, option, commands, prefix, errorLogs) {
        const lookup = args[0];
        const id = args[1];
        const mentionedMember = message.mentions.members.first();
        if (mentionedMember) {
            switch (lookup) {
                case 'avatar': {
                    const avatarurl = await bot.users.fetch(mentionedMember.id).then(u => u.avatarURL({ format: 'png', dynamic: true, size: 4096 })).catch(err => errorLogs.send(err));
                    return message.channel.send(avatarurl);
                }
                case 'tag': {
                    const tag = await bot.users.fetch(mentionedMember.id).then(u => u.tag).catch(err => errorLogs.send(err));
                    return message.channel.send(tag);
                }
                default: { return; }
            }
        } else if (!mentionedMember) {
            switch (lookup) {
                case 'avatar': {
                    const avatarurl = await bot.users.fetch(id).then(u => u.avatarURL({ format: 'png', dynamic: true, size: 4096 })).catch(err => errorLogs.send(err));
                    return message.channel.send(avatarurl);
                }
                case 'tag': {
                    const tag = await bot.users.fetch(id).then(u => u.tag).catch(err => errorLogs.send(err));
                    return message.channel.send(tag);
                }
                default: { return; }
            }
        } else if (!args[1] || !mentionedMember) {
            switch (lookup) {
                case 'avatar': {
                    const avatarurl = await bot.users.fetch(message.author.id).then(u => u.avatarURL({ format: 'png', dynamic: true, size: 4096 })).catch(err => errorLogs.send(err));
                    return message.channel.send(avatarurl);
                }
                case 'tag': {
                    const tag = await bot.users.fetch(message.author.id).then(u => u.tag).catch(err => errorLogs.send(err));
                    return message.channel.send(tag);
                }
                default: { return; }
            }
        }
    }
};