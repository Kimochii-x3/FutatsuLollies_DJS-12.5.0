const Discord = require('discord.js');

module.exports = {
    name: 'update',
    description: 'used to update various bot things',
    usage: 'fl.update',
    cd: 0,
    guildOnly: false,
    args: false,
    async execute(bot, message, args, option, commands, prefix) {
        if (message.author.id === bot.owner.id) {
            if (option[1] === 'set' && option[2] === 'motd') {
                await bot.db.query('update botStats set motd = ?', [option[0]]).catch(bot.errHandle);
                await bot.user.setActivity(`${bot.guilds.cache.size} servers / MOTD: ${option[0]}`, { type: 'watching' }).catch(bot.errHandle);
            } else if (option[1] === 'delete' && option[2] === 'motd') {
                await bot.db.query(`update botStats set motd =NULL`).catch(bot.errHandle);
                await bot.user.setActivity(`${bot.guilds.cache.size} servers`, { type: 'watching' }).catch(bot.errHandle);
            }
        } else if (message.author.id !== bot.owner.id) {
            return message.react('🤔').catch(bot.errHandle);;
        }
    }
};