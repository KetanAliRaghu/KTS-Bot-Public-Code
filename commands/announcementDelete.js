module.exports = {
    name: 'announcementDelete',
    description: 'This command deletes an announcement that has been scheduled',
    execute(message , args , HAM , pendingAnnouncements) {
        if(!message.guild.member(message.author).hasPermission('ADMINISTRATOR')) return;

        try {
            pendingAnnouncements.forEach(anncmt => {
                if(anncmt.channel.guild === message.guild && anncmt.announcement === args.join(' '))
                    delete pendingAnnouncements[pendingAnnouncements.indexOf(anncmt)];
                pendingAnnouncements = HAM.cleanArray(pendingAnnouncements);
                throw new Error('That announcement has been deleted');
            });
            throw new Error('That announcement does not on this server exist');
        }catch(error) {
            return message.reply(error.message);
        }
    }
}