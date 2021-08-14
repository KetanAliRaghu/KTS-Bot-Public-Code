module.exports = {
    name: 'showDeadlines',
    description: 'This command creates an embed message with all unfinished deadlines',
    execute(message , args , Discord , deadlines , client) {
        if(args[0]) {
            let checkDeadline = deadlines.find(deadline => deadline.title === args[0]);
            if(!checkDeadline || checkDeadline.guild !== message.guild)
                return message.reply('That deadline does not exist on this server');
            sendDeadline(checkDeadline);
            return;
        }
        try{
            deadlines.forEach(deadline => {
                if(deadline.guild === message.guild) throw new Error();
            });
            message.channel.send('There are no active deadlines on this server');
        }catch(error) {
            for(deadline of deadlines)
                sendDeadline(deadline);
        }

        function sendDeadline(deadline) {
            if(deadline.guild === message.guild) {
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
                message.channel.send(deadlineEmbed);
            }
        }
    }
}