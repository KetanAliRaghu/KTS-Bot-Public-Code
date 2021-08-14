const Discord = require('discord.js');
const client = new Discord.Client({partials: ['MESSAGE' , 'CHANNEL' , 'REACTION']});
 
const prefix = '.';
 
const fs = require('fs');
const emojiName = require('emoji-name-map');
 
client.commands = new Discord.Collection();
 
const changeRainbowRole = require('./perpetuals/rainbowRole');
const updateDateTime = require('./perpetuals/updateDateTime');
const deadlineCheck = require('./perpetuals/deadlineCheck');
const announcementCheck = require('./perpetuals/announcementCheck');

const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('.js'));
for(const file of commandFiles){
    const command = require(`./commands/${file}`);
 
    client.commands.set(command.name , command);
}

const mutedRoles = [];
let pollActive = false;
let rrActive = false;
const commandSuggestions = [];
const deadlines = [];
const pendingAnnouncements = [];
let ddlnActive = false;
const dateTime = {
    day: 0,
    month: 0,
    year: 0,
    hour: 0,
    minute: 0,
    second: 0,
    getDate: function() {
        return `${this.day} / ${this.month} / ${this.year}`;
    },
    getTime: function() {
        return `${this.hour}:${this.minute}:${this.second}`;
    },
    getMonthDays: function(monthName) {
        return this.monthInfo
            .find(month => month.name === monthName)
            .dayCount;
    },
    getHours: function() {
        if(this.hour > 12) return this.hour - 12;
        return this.hour;
    },
    setDate: function(day , month , year) {
        this.day = day;
        this.month = month;
        this.year = year;
    },
    setTime: function(hour , minute , second) {
        this.hour = hour;
        this.minute = minute;
        this.second = second;
    },
    monthInfo: [
        {monthName: null , dayCount: NaN},
        {monthName: 'January' , dayCount: 31},
        {monthName: 'February' , dayCount: 28},
        {monthName: 'March' , dayCount: 31},
        {monthName: 'April' , dayCount: 30},
        {monthName: 'May' , dayCount: 31},
        {monthName: 'June' , dayCount: 30},
        {monthName: 'July' , dayCount: 31},
        {monthName: 'August' , dayCount: 31},
        {monthName: 'September' , dayCount: 30},
        {monthName: 'October' , dayCount: 31},
        {monthName: 'November' , dayCount: 30},
        {monthName: 'December' , dayCount: 31},
    ]
};
const HAM = {
// Helpful Array Methods (yes, it should be functions not methods, but HAM)
    /**
     * removes duplicate items
     */
    removeArrayDuplicates: function(array) {
        array.forEach(idx => {
            let savedIndex = array.indexOf(idx);
            array[savedIndex] = null;
            while(array.includes(idx)) {
                delete array[array.indexOf(idx)];
            }
            array[savedIndex] = idx;
            array = cleanArray(array);
        });
    },

    /**
     * removes empty items/falsey values
     */
    cleanArray: function(givenArray) {
        const array = [];
        givenArray.forEach(elmt => {
            try {
                if(typeof elmt !== 'object' && elmt != false && elmt != null && elmt != undefined)
                    array.push(elmt);
                else if(Object.keys(elmt).length !== 0)
                    array.push(elmt);
            }catch(error) {}
        });
        return array;
    }
}
const addMessages = [
    {start: 'Welcome ', end: ' to the Kids That STEM Discord Server!'},
    {start: 'Hi ', end: ', thanks for joining the Kids That STEM Discord Server!'},
    {start: 'Welcome to the Kids That STEM Discord Server ', end: '!'},
    {start: 'Howdy partner! Let\' all welcome ', end: ' to the Kids That STEM Discord Server!'},
    {start: 'h-h-h-h-hiii ', end: ', I d-d-d-didn\'t think I\'d s-s-s-see you on the K-K-Kids That STEM Discord Server... baka 😳'}
];
const removeMessages = [
    {start: 'Goodbye ', end: ', I hope you had fun!'},
    {start: 'Bye ', end: ', thanks for your time with us!'},
    {start: 'I hope you had a good time! Bye ', end: '!'},
    {start: 'Goodbye ', end: ', thanks for helping us out!'},
    {start: 'Good riddance 😤! I never liked ', end: ' anyways... *hmph* baka 😳'}
];

client.once('ready' , () => {
    console.log('KTS bot is Active');
    client.users.cache.get('393194473045360651').send('I\'m online');
    updateDateTime(dateTime , client);
    deadlineCheck(client , dateTime , Discord , deadlines);
    announcementCheck(pendingAnnoucements , HAM , dateTime , client);
});

client.on('guildMemberAdd' , guildMember => {
    if(guildMember.guild.channels.cache.find(chnl => chnl.name === 'welcome')) {
        let welcomeChannel = guildMember.guild.channels.cache.find(chnl => chnl.name === 'welcome');
        let randomMessage = Math.floor(Math.random() * addMessages.length);
        welcomeChannel.send(`${addMessages[randomMessage].start}<@${guildMember.user.id}>${addMessages[randomMessage].end}`);
    }
});

client.on('guildMemberRemove' , guildMember => {
    if(guildMember.guild.channels.cache.find(chnl => chnl.name === 'bye')) {
        let byeChannel = guildMember.guild.channels.cache.find(chnl => chnl.name === 'bye');
        let randomMessage = Math.floor(Math.random() * addMessages.length);
        byeChannel.send(`${removeMessages[randomMessage].start}<@${guildMember.user.id}>${removeMessages[randomMessage].end}`);
    }
});
 
client.on('message' , message => {
    if(!message.content.startsWith(prefix) || message.author.bot) return;
 
    const args = message.content.slice(prefix.length).split(' ');
    const command = args.shift().toLowerCase();
//--------------------------------------------------------------------------
    if(command === 'ktsrules')
        client.commands.get('KTSRules').execute(message , args , client);
//--------------------------------------------------------------------------
    if(command === 'suggestcommand')
        client.commands.get('suggestCommand').execute(message , args , commandSuggestions);
//--------------------------------------------------------------------------
    if(command === 'showcommandsuggestions')
        client.commands.get('showCommandSuggestions').execute(message , args , commandSuggestions , Discord);
//--------------------------------------------------------------------------
    if(command === 'clearcommandsuggestions')
        client.commands.get('clearCommandSuggestions').execute(message , args , commandSuggestions);
//--------------------------------------------------------------------------
    if(command === 'memberinfo')
        client.commands.get("memberInfo").execute(message , args , Discord , client);
//--------------------------------------------------------------------------
    if(!pollActive && command === 'poll')
        client.commands.get('poll').execute(message , args , Discord , client , pollActive);
//--------------------------------------------------------------------------
    if(!rrActive && command === 'reactionrole')
        client.commands.get("reactionRole").execute(message , args , Discord , client , rrActive);
//--------------------------------------------------------------------------
    if(command === 'deadline')
        client.commands.get("deadline").execute(message , args , dateTime , deadlines , client , ddlnActive);
//--------------------------------------------------------------------------
    if(command === 'showdeadlines')
        client.commands.get('showDeadlines').execute(message , args , Discord , deadlines , client);
//--------------------------------------------------------------------------
    if(command === 'cdeadline' || command === 'completedeadline')
        client.commands.get('completeDeadline').execute(message , args , Discord , deadlines , client , HAM);
//--------------------------------------------------------------------------
// Emergency bot shut off (failsafe)
    if(command === 'kill')
        client.commands.get('kill').execute(message , client);
//--------------------------------------------------------------------------
    if(command === 'announcement')
        client.commands.get('announcement').execute(message , args , pendingAnnouncements);
//--------------------------------------------------------------------------
    if(command === 'deleteannouncement' || command === 'dannouncement')
        client.commands.get('announcementDelete').execute(message , args , HAM , pendingAnnouncements);
//--------------------------------------------------------------------------
});