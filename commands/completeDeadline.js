module.exports = {
    name: 'completeDeadline',
    description: 'This is a command that completes the given deadline',
    execute(message , args , Discord , deadlines , client , HAM) {
        if(!args[0]) return message.reply('Please specify a deadline(s) to complete');

        const completedDeadlines = [];
        args.forEach(deadline => {
            let checkDeadline = deadlines.find(finished => finished.title === deadline);
            if(checkDeadline && checkDeadline.guild === message.guild) completedDeadlines.push(checkDeadline);
            else message.channel.send(`A deadline with the title ${deadline} does not exist on this server`);
        });

        if(completedDeadlines[0]) {
            completedDeadlines.forEach(deadline => {
                delete deadlines[deadlines.indexOf(deadlines.find(finished => finished === deadline))];
                sendDeadline(deadline);
            });
            HAM.cleanArray(deadlines);
            message.channel.send(`<@!${message.author.id}> has completed ${completedDeadlines.map(deadline => deadline.title).join(', ')}`);
        }
        
        function sendDeadline(deadline) {

            let deadlineEmbed = new Discord.MessageEmbed()
                .setTitle(deadline.title)
                .setDescription(`Started: ${deadline.startDate}
Due: ${deadline.dueDate.join('/')} | ${deadline.dueTime.standard}
Members: ${deadline.pingMembers.map(mmbr => mmbr.mention)}
Roles: ${deadline.pingRoles.map(role => role.mention)}

Ping Times: ${deadline.pingTimes.map(time => time.standard).join(' | ')}
Ping Channel: ${deadline.pingChannel.name}`)
                .setFooter(`COMPLETE!`)
                .setThumbnail(`https://cdn.discordapp.com/avatars/${client.user.id}/${client.user.avatar}.webp`);

            deadline.tasks.forEach(task => {
            deadlineEmbed.addField(task.name , task.value , false);
            });
            deadline.pingChannel.send(deadlineEmbed);
            deadline.pingChannel.send('^ ✅ COMPLETED! :D ^')
        }
    }
}