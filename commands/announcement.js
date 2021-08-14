module.exports = {
    name: 'announcement',
    description: 'This command creates an announcement to be sent at a certain time.',
    execute(message , args , pendingAnnouncements) {
        if(!message.guild.member(message.author).hasPermission('ADMINISTRATOR')) return;
        if(!args[0]) return message.reply('Please enter a time to send the announcement.');
        if(!args[1] || (args[1].toUpperCase() !== 'AM' && args[1].toUpperCase()  !== 'PM')) return message.reply('Please enter AM or PM after the time to send.');
        if(!args[2]) return message.reply('Please enter an announcement at the end of the command');
        let announcementChannel = message.guild.channels.cache.find(chnl => chnl.name === 'announcements');
        if(!announcementChannel) return message.reply('This server does not have a channel with the name "announcements"');
        
        let newArgs = [...args];
        newArgs.shift();
        newArgs.shift();
        let announcementMessage = newArgs.join(' ');

        try {
            pendingAnnouncements.forEach(anncmt => {
                if(anncmt.announcement === announcementMessage) {
                    let AMorPM = 'AM';
                    let sendTime = `${anncmt.time[0]}`;
                    if(anncmt.time[0] >= 12) AMorPM = 'PM';
                    if(anncmt.time[0] === 0) sendTime = '12';
                    if(anncmt.time[0] > 12) sendTime = `${anncmt.time[0] - 12}`;

                    throw new Error(`This announcement already exists and is scheduled for ${sendTime}:${anncmt.time[1]} ${AMorPM}`);
                }
            });
        }catch(error) {
            return message.reply(error.message);
        }

        let botTime;
        try {
            botTime = giveValidHour(args[0]);
        }catch(error) {
            switch(error.message) {
                case 'InvalidTimeFormat':
                    return message.reply(`${args[0]} ${args[1]} is not a valid time. The valid format is hh:mm am/pm.`);
            }
        }
        
        let setHour = eval(args[0].split(':')[0]);
        if(args[1].toUpperCase() === 'PM') botTime[0] += 12;
        if(args[1].toUpperCase() === 'AM' && setHour === 12) botTime[0] -= 12;

        // timed announcement {time: array , announcement: string}
        pendingAnnouncements.push({time: botTime , announcement: announcementMessage , channel: announcementChannel});
        message.channel.send('Announcement set!');
    }
}

/**
 * Determines is the passed hour format is valid
 * and returns is as an array [hour , minute , second]
 * */ 
 function giveValidHour(hour) {
    if(hour.length !== 5                    ||
        typeof eval(hour[0]) !== 'number'   ||
        eval(hour[0]) > 1                   ||
        typeof eval(hour[1]) !== 'number'   ||
        hour[2] !== ':'                     ||
        typeof eval(hour[3]) !== 'number'   ||
        eval(hour[3]) > 5                   ||
        typeof eval(hour[4]) !== 'number') throw new Error('InvalidTimeFormat');
    if(eval(hour[0]) > 0 && eval(hour[1] > 2)) throw new Error('InvalidTimeFormat');
    return [eval(hour[0] + hour[1]) , eval(hour[3] + hour[4])];
}