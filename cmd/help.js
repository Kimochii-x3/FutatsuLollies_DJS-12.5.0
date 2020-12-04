const Discord = require('discord.js');
// help command, not much going on here
module.exports = {
    name: 'help',
    description: 'lists available commands and usages or description, it has 3 options which are `cmds`, `desc`, `info` (this one is purely info on how to contact me, support server and all that)',
    usage: 'fl.help / fl.help cmds / fl.help desc / fl.help info',
    cd: 0,
    guildOnly: true,
    args: false,
    async execute (bot, message, args, option, commands, prefix, errorLogs) {
        const dataName = [];
        const dataUsage = [];
        const dataDesc = [];
        dataName.push(commands.map(command => `\`${command.name}\` >> ${command.usage}`).join('\n'));
        dataDesc.push(commands.map(command => `\`${command.name}\` >> ${command.description}`).join('\n'));
        if (args[0] === 'cmds') {
            const cmdsEmbed = new Discord.MessageEmbed()
            .setColor('GREY')
            .setAuthor('Commands & Usages:')
            .setDescription(dataName);
            return message.channel.send(cmdsEmbed);
        } else if (args[0] === 'desc') {
            const descEmbed = new Discord.MessageEmbed()
            .setColor('GREY')
            .setAuthor('Descriptions:')
            .setDescription(dataDesc);
            return message.channel.send(descEmbed);
        } else if (args[0] === 'info') {
            const rows = await bot.db.query(`select * from botStats`).catch(err => errorLogs.send(err));
            const infoEmbed = new Discord.MessageEmbed()
            .setColor('GREY')
            .setAuthor('Bot info:')
            .setDescription(`${rows[0].info}\nDev: ${bot.owner.tag}\n[Invite Link](https://discordapp.com/oauth2/authorize?client_id=615263043001122817&scope=bot&permissions=1342205136)\n[Support server link](https://discord.gg/AThmedm)\n[Github Repository](https://github.com/Kimochii-x3/FutatsuLollies_DJS-12.5.0)`);
            return message.channel.send(infoEmbed);
        } else if(!args[0]) {
            const helpEmbed = new Discord.MessageEmbed()
            .setColor('GREY')
            .setAuthor('There are 3 options for the help command; Example usage: fl.help cmds')
            .setDescription('1. **`cmds`** provides the command name list and usages\n2. **`desc`** provides command name list followed by description for each command and explains what it does\n3. **`info`** provides information about the bot');
            return message.channel.send(helpEmbed);
        }
    },
};