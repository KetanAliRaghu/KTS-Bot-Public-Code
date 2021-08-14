const ms = require('ms');

module.exports = async(pendingAnnoucements , HAM , dateTime , client) => {

    client.users.cache.get('393194473045360651').send('Entered announcementCheck');
    setTimeout(() => {
        client.users.cache.get('393194473045360651').send('First Timeout');
        setTimeout(() => {
            client.users.cache.get('393194473045360651').send('Second Timeout');
            setInterval(() => {
                client.users.cache.get('393194473045360651').send('Start Interval');
                pendingAnnoucements.forEach(anncmt => {
                    client.users.cache.get('393194473045360651').send('Checking Anncmt');
                    anncmt.channel.send(`${anncmt.time[0]} | ${dateTime.hour}`);
                    anncmt.channel.send(`${anncmt.time[1]} | ${dateTime.minute}`);
                    if(dateTime.hour === anncmt.time[0] && dateTime.minute === anncmt.time[1]) {
                        anncmt.channel.send(anncmt.announcement);
                        delete pendingAnnoucements[pendingAnnoucements.indexOf(anncmt)];
                        pendingAnnouncements = HAM.cleanArray(pendingAnnoucements);
                    }
                });
            } , ms('1m'));
        } , (60 - dateTime.second) * 1000);
    } , ms('1s'));
}