const Discord = require('discord.js');
// log command used for pretty much enabling/disabling the logging for a server
module.exports = {
    name: 'log',
    description: 'enable/disable event logging (you need administrator permission to use this command)',
    usage: 'fl.log Y -set (logging enabled); fl.log N -set (logging disabled)',
    cd: 0,
    guildOnly: true,
    args: true,
    async execute (bot, message, args, option, commands, prefix) {
        if (message.member.hasPermission('ADMINISTRATOR', { checkAdmin: true, checkOwner: true }) || message.author.id === bot.owner.id) {
            const rows = await bot.db.query('select * from serverInfo where serverID = ?', [message.guild.id]).catch(bot.errHandle);
            if (option[1] === 'set') {
                if (rows[0].serverClogID.length > 1) {
                    if (args[0].toLowerCase() === 'y') {
                        await bot.db.query('update serverInfo set serverLog = ? where serverID = ?', [args[0].toUpperCase(), message.guild.id]).catch(bot.errHandle);
                        return message.channel.send('Successfully **enabled** the logging').catch(bot.errHandle);
                    } else if (args[0].toLowerCase() === 'n') {
                        await bot.db.query('update serverInfo set serverLog = ? where serverID = ?', [args[0].toUpperCase(), message.guild.id]).catch(bot.errHandle);
                        return message.channel.send('Successfully **disabled** the logging').catch(bot.errHandle);
                    } else {
                        return message.channel.send('Only allowed `y` or `n`').catch(bot.errHandle);
                    }
                } else {
                    return message.channel.send(`No event logging channel found in the database, please set it up with \`${rows[0].prefix}channel #<channel name> -set\``).catch(bot.errHandle);
                }
            }
        } else { message.channel.send('You do not have `Administrator` permission').catch(bot.errHandle) }
    },
};