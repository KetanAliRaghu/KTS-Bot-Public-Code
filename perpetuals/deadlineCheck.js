const ms = require('ms');
const deadline = require('../commands/deadline');

module.exports = async(client , dateTime , Discord , deadlines) => {
    
    setTimeout(() => {
        setTimeout(() => {
            setInterval(() => {
                deadlines.forEach(deadline => {
                    if(deadline.dueDate[0] === dateTime.day             &&
                        deadline.dueDate[1] === dateTime.month          &&
                        deadline.dueDate[2] === dateTime.year           &&
                        deadline.dueTime.botTime[0] === dateTime.hour   &&
                        deadline.dueTime.botTime[1] === dateTime.minute) {
                            deadline.pingChannel.send(`${deadline.pingMembers.map(member => member.mention)}
${deadline.pingRoles.map(role => role.mention)}
**${deadline.title}** DUE NOW!`);
                        }
                    deadline.pingTimes.forEach(time => {
                        if(dateTime.hour === time.botTime[0] && dateTime.minute === time.botTime[1])
                            sendDeadline(deadline);
                    });
                });
            } , ms('1m'));
        } , (60 - dateTime.second) * 1000);
    } , ms('1s'));

    function sendDeadline(deadline) {

    let deadlineEmbed = new Discord.MessageEmbed()
            .setTitle(deadline.title)
            .setDescription(`Started: ${deadline.startDate}
Due: ${deadline.dueDate.join('/')} | ${deadline.dueTime.standard}
Members: ${deadline.pingMembers.map(mmbr => mmbr.mention)}
Roles: ${deadline.pingRoles.map(role => role.mention)}

Ping Times: ${deadline.pingTimes.map(time => time.standard).join(' | ')}
Ping Channel: ${deadline.pingChannel.name}`)
            .setFooter(`Creator of this deadline: ${deadline.creator.username}#${deadline.creator.discriminator}`)
            .setThumbnail(`https://cdn.discordapp.com/avatars/${client.user.id}/${client.user.avatar}.webp`);

        deadline.tasks.forEach(task => {
            deadlineEmbed.addField(task.name , task.value , false);
        });
        deadline.pingChannel.send(deadlineEmbed);
    }
}