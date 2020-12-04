const Discord = require('discord.js');

module.exports = {
    name: 'prefix',
    description: 'showcases or changes the prefix for the server, limited to 3 characters, you can do `@FutatsuLollies prefix` to see the prefix',
    usage: 'fl.prefix / fl.prefix <prefix> -set',
    cd: 0,
    guildOnly: true,
    args: false,
    async execute(bot, message, args, option, commands, prefix, errorLogs) {
        if (!args[0]) {
            return message.channel.send(`My prefix for this server is \`${prefix}\`, default prefix is \`fl.\``);
        } else if (args[0]) {
            if (option[1] === 'set') {
                if (message.member.hasPermission('ADMINISTRATOR') || message.author.id === bot.owner.id) {
                    if (args[0].length > 3) {
                        return message.channel.send('Maximum characters allowed is 3');
                    } else if (args[0].length <= 3) {
                        await bot.db.query(`update serverInfo set prefix = ${args[0].toLowerCase()} where serverID = ${message.guild.id}`).catch(err => errorLogs.send(err));
                        return message.channel.send(`Successfully changed the prefix to \`${args[0].toLowerCase()}\``);
                    }
                } else if (!message.member.hasPermission('ADMINISTRATOR')) {
                    return message.channel.send('You do not have administrator permission');
                }
            }
        }
    }
};