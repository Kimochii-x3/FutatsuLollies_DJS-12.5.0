const Discord = require('discord.js');
// channel command used to set the logging channel for a server
module.exports = {
    name: 'channel',
    description: 'set the event logging channel, requires event logging enabled and the permissions requiested upon inviting the bot [you need administrator permission]',
    usage: 'fl.channel #<channel name> -set',
    cd: 0,
    guildOnly: true,
    args: true,
    async execute (bot, message, args, option, commands, prefix) {
        if (args[0]) {
            // if the option after the dash (-) is set, it'll set the logging channel
            if (message.member.hasPermission('ADMINISTRATOR') || message.author.id === bot.owner.id) {
                if (option[1] === 'set') {
                    const cID = message.mentions.channels.first();
                    if (cID) {
                        await bot.db.query('update serverInfo set serverClogID = ? where serverID = ?', [cID.id, message.guild.id]).catch(bot.errHandle);
                        return message.channel.send(`Successfully **changed** the logging channel to ${cID}`).catch(bot.errHandle);
                    } else { return message.channel.send('No channel found, check if you have mentioned a channel').catch(bot.errHandle); }
                    // if its remove, it'll remove the logging channel and disable the logging to prevent crashing erros
                } else if (option[1] === 'remove') {
                    await bot.db.query('update serverInfo set serverClogID =NULL where serverID = ?', [message.guild.id]).catch(bot.errHandle);
                    await bot.db.query('update serverInfo set serverLog = N where serverID = ?', [message.guild.id]).catch(bot.errHandle);
                    return message.channel.send('Successfully **nullified** the logging channel and **disabled** the logging in the database').catch(bot.errHandle);
                }
            } else { return message.channel.send('You don\'t have Administrator permission, nor are the Owner of the server').catch(bot.errHandle); }
        }
    },
};