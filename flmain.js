const Discord = require('discord.js'); // Library used to write the bot code
const ms = require('ms'); // ms npm package used for time
const fs = require('fs'); // used to read the command & event files as well as any additional files
const snekfetch = require('snekfetch'); // using snekfetch to update bot stats on top.gg
const mysql = require('promise-mysql'); // usnig promise-mysql for database
const { token, pls_fuck, me_hard, daddy, hydrabolt, uwu } = require('./botconf.json'); // requiring bot token, database credentials and prefix
const bot = new Discord.Client({ messageCacheMaxSize: 300 /*, messageCacheLifetime: 7200, messageSweepInterval: 600*/}) // creating the bot with non-default message settings
const commands = new Discord.Collection(); // creating the command collection
const cd = new Set(); // creating the set for command cooldowns
const cmdFiles = fs.readFileSync(__dirname + '/cmd').filter(file => file.endsWith('.js')); // reading the command files in async
const runAndUptime = bot.channels.cache.get('622467121175199745');
const errorLogs = bot.channels.cache.get('780537355144134686');
const everyLogs = bot.channels.cache.get('780545286837370901');
const guildJoinLeave = bot.channels.cache.get('727205516048203787');
// setting the commands by name to the commands discord collection defined above
for (const file of cmdFiles) {
    const cmd = require(__dirname + `/cmd/${file}`);
    commands.set(cmd.name, cmd);
}
// reading the event files and binding them
fs.readdir(__dirname + `/events`, (err, files) => {
    if (err) return errorLogs.send(err);
    files.forEach(file => {
        if (!file.endsWith('.js')) return;
        const event = require(__dirname + `/events/${file}`);
        let eventName = file.split('.')[0];
        bot.on(eventName, event.bind(null, bot));
    });
});
// connecting to database, has to be this way bcs promise-mysql is finnecky, logging the bot's startup time and database connection
(async () => {
    bot.db = await mysql.createConnection({
        host: pls_fuck,
        user: me_hard,
        password: daddy,
        port: hydrabolt,
        database: uwu,
    });
    let dbDesc;
    bot.db.ping(function (err) {
        if (err) {
            dbDesc = 'Database error - not connected'
        } else {
            dbDesc = 'Database connected'
        }
    });
    // logging startup/restarts/reconnects and uptime
    const botStartup = new Discord.RichEmbed()
    .setTitle(new Date().toLocaleString('en-GB'))
    .setColor('#63ff48')
    .setDescription(dbDesc)
    runAndUptime.send(botStartup);
})();
// once the bot's ready this code is executed
bot.on('ready', async () => {
    // fetches the MOTD from the database and sets it as the bot's status
    const status = await bot.db.query('select * from botStats').catch(err => errorLogs.send(err));
    if (status[0].motd.length > 1) {
        await bot.user.setActivity(`${bot.guilds.size} servers/fl.help/MOTD: ${status[0].motd}`, { type: 'WATCHING'}).catch(err => errorLogs.send(err));
    } else if (status[0].motd.length < 1) {
        await bot.user.setActivity(`${bot.guilds.size} servers/fl.help`, { type: 'WATCHING' }).catch(err => errorLogs.send(err));
    }
    // maps the guilds by their ID, then checks if they exist in the database, adds them if they dont
    const gIDs = bot.guilds.map(g => g.id);
    for (const g of gIDs) {
        const gInDB = await bot.db.query(`select * from serverInfo where serverID = ${g}`).catch(err => errorLogs.send(err));
        if (gInDB[0]) {
            if (gInDB[0].serverID.length < 1) {
                await bot.db.query(`insert into serverInfo (serverID) values ('${g}')`).catch(err => errorLogs.send(err));
                everyLogs.send(`Added ${g} to database as it was missing`);
            } else if (gInDB[0].serverID.length > 1) { return; }
        } else if (!gInDB[0]) {
            await bot.db.query(`insert into serverInfo (serverID) values ('${g}')`).catch(err => errorLogs.send(err));
            everyLogs.send(`Added ${g} to database as it was missing`);
        }
    }
    // interval to check if a user hasnt been unmuted when they should be unmuted due to the bot restarting, reconnecting or whatever other issue
    setInterval(async() => {
        const rows = await bot.db.query(`select * from serverMutes where timeUnmute < ${Date.now()}`).catch(err => errorLogs.send(err));
        for (const r of rows) {
            const guild = await bot.guilds.cache.get(r.serverID);
            const member = await guild.members.cache.get(r.userID);
            const mtr = await guild.roles.cache.get(r.muteRoleID);
            member.roles.remove(mtr, 'Unmuting');
            if (member.voice.channel != null) {
                member.voice.setMute(false, 'Unmuting').catch(err => errorLogs.send(err));
                await bot.db.query(`delete from serverMutes where userID = ${r.userID} and serverID = ${r.serverID} and muteRoleID = ${r.muteRoleID}`).catch(err => errorLogs.send(err));
            } else if (member.voice.channel == null) {
                await bot.db.query(`delete from serverMutes where userID = ${r.userID} and serverID = ${r.serverID} and muteRoleID = ${r.muteRoleID}`).catch(err => errorLogs.send(err));
            }
        }
    }, 30000);
});
// logs erros, used for debugging
bot.on('error', errorLogs.send(error));
// message related things
bot.on('message', async message => {
    // checks if the channel the message was sent in is DM one, if it is it closes the DM channel or if its a bot to ignore it
    if (message.channel.type !== 'dm' || !message.author.bot) {
        // checks if the message includes 'prefix' then checks if the bot is mentioned in the message and it returns the prefix for the server the message was sent in
        if (message.content.toLowerCase().includes('prefix')) {
            const botmention = message.mentions.members.has('615263043001122817')
            if (botmention) {
                const rows = await bot.db.query(`select * from serverInfo where serverID = ${message.guild.id}`).catch(err => errorLogs.send(err))
                return message.channel.send(`my prefix for this server is: \`${rows[0].prefix}\``);
            }
        } else {
            // gets the prefix from database for the server, gets the args and options after which checks if the message starts with command name (and if args are required or not) then executes it
            // on error logs the error in errorlog channel and replies if error occured
            const rows = await bot.db.query(`select * from serverInfo where serverID = ${message.guild.id}`).catch (err => errorLogs.send(err));
            try {
                const prefix = rows[0].prefix;
                if (!message.content.toLowerCase().startsWith(prefix)) { return; }
                const args = message.content.slice(prefix.length).split(/ +/);
                const cmdName = args.shift().toLowerCase();
                const option = message.content.slice(prefix.length + cmdName.length).split(/-+/);
                if (!commands.has(cmdName)) { return; }
                const cmd = commands.get(cmdName);
                try {
                    if (cmd.guildOnly && !message.guild) {
                        return message.channel.send('This command is for server only');
                    } else if (cd.has(`${message.author.id} + ${message.guild.id}`)) {
                        return message.channel.send(`This command's cooldown is \`${cmd.cd}\`s, please wait`);
                    } else if (cmd.args && !args.length) {
                        return message.channel.send('No args provided');
                    } else if (message.member.hasPermission('ADMINISTRATOR')) {
                        cmd.execute(bot, message, args, option, commands, prefix);
                    } else if (!message.member.hasPermission('ADMINISTRATOR')) {
                        cmd.execute(bot, message, args, option, commands, prefix);
                        if (cmd.cd !== 0) {
                            await cd.add(`${message.author.id} + ${message.guild.id}`);
                            setTimeout(() => {
                                cd.delete(`${message.author.id} + ${message.guild.id}`);
                            }, cmd.cd * 1000);
                        }
                    }
                } catch (err) {
                    errorLogs.send(err);
                    message.channel.send('Issue occured while trying to execute the command');
                }
            } catch (err) {
                await everyLogs.send(err);
                await everyLogs.send(`Server ID: ${message.guild.id}\nOwner ID: ${message.guild.owner.id}\nChannel ID: ${message.channel.id}\nChannel Type: ${message.channel.type}\nAuthor ID: ${message.author.id}\nAuthor Tag: ${message.author.tag}`);
            }
        }
    } else if (message.author.bot) { return; } else if (message.channel.type === 'dm') { message.channel.delete().then(() => everyLogs.send(`Closed DM's with ${message.author}`)).catch(err => errorLogs.send(err)); }
});
// debugging information
bot.on('debug', m => {
    if (m.toLowerCase().includes('heartbeat')) { return; } else if (!m.toLowerCase().includes('heartbeat')) { return everyLogs.send(m); }
});
bot.on('uncaughtExeption', err => { errorLogs.send(err); });
// when bot joins guild for first time it adds it to the databse, if ti doesnt it'll crash when it tries to fetch info from database
bot.on('guildCreate', async guild => {
    const rows = await bot.db.query(`select * from serverInfo where serverID = ${guild.id}`).catch(err => errorLogs.send(err));
    if (rows[0]) {
        if (rows[0].serverID == guild.id) { return; } else if (rows[0].serverID != guild.id) {
            await bot.db.query(`insert into serverInfo (serverID) values (${guild.id})`).catch(err => errorLogs.send(err));
            everyLogs.send(`Added ${guild.id} to database, serverID != to guild.id, this is a extremely rare occasion, if it happens constantly check the code`);
        }
    } else if (!rows[0]) {
        await bot.db.query(`insert into serverInfo (serverID) values (${guild.id})`).catch(err => errorLogs.send(err));
        everyLogs.send(`Added ${guild.id} to database`);
    }
});
// all other event listeners are extended in events folder
// when bot leaves the guild
bot.on('guildDelete', async guild => {});
// when a guild is updated
bot.on('guildUpdate', async (oldGuild, newGuild) => {});
// when an emoji is created
bot.on('emojiCreate', async emoji => {});
// when an emoji is updated
bot.on('emojiUpdate', async (oldEmoji, newEmoji) => {});
// when an emoji is deleted
bot.on('emojiDelete', async emoji => {});
// when someone gets banned
bot.on('guildBanAdd', async (guild, user) => {});
// when someone gets unbanned
bot.on('guildBanRemove', async (guild, user) => {});
// when a user joins the guild
bot.on('guildMemberAdd', async member => {});
// when a member is updated in the guild
bot.on('guildMemberUpdate', async (oldMember, newMember) => {});
// when a member leaves the guild
bot.on('guildMemberRemove', async member => {});
// when a message is deleted
bot.on('messageDelete', async message => {});
// when a message is updated (edited and idk whatelse)
bot.on('messageUpdate', async (oldMessage, newMessage) => {});
// when a member joins/exists/changes voice channels
bot.on('voiceStateUpdate', async (oldMember, newMember) => {});
// when a invite to the guild or channel is created
bot.on('inviteCreate', async invite => {});
// when a invite to the guild or channel is deleted
bot.on('inviteDelete', async invite => {});
// when a channel is created
bot.on('channelCreate', async channel => {});
// when a channel is updated
bot.on('channelUpdate', async (oldChannel, newChannel) => {});
// when a channel is deleted
bot.on('channelDelete', async channel => {});
// when a role is created
bot.on('roleCreate', async role => {});
// when a role is updated
bot.on('roleUpdate', async (oldRole, newRole) => {});
// when a role is deleted
bot.on('roleDelete', async role => {});
// the bot token that it logs in with
bot.login(token);