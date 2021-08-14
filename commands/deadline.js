// const moment = require('moment');
// const ms = require('ms');
// const time2 = new moment.duration(Date.now());

module.exports = {
    name: 'deadline',
    description: 'This is a command that sets a deadline for a task and notifies the specified members every specified timestamp',
    execute(message , args , dateTime , deadlines , client , ddlnActive) {
//Make sure that everything needed is given
        if(!message.guild.member(message.author).hasPermission('ADMINISTRATOR')) return;
        if(!args[0]) return message.reply('Please specify a deadline end date as the first parameter to the command');

        if(!args[1]) return message.reply('Please specify a time for the deadline to end (format: h:mm) after the specified date in the command');

        if(!args[2] || (args[2].toLowerCase() !== 'am' && args[2].toLowerCase() !== 'pm'))
            return message.reply('Please specify AM or PM for the deadline time after the time in the command');

        if(!args[3]) return message.reply('Please specify a title at the end of the command')

        let deadlineTitle = deadlines.find(ddln => ddln.title === args.slice(3 - args.length).join(' '));
        if(deadlineTitle) return message.reply('A deadline with this title already exists (use .showdeadlines to see all existing deadlines)');

// args[0] = end date , args[1] = time , args[2] = AM or PM

        let botDateArray;
        let botTimeArray;
//----------------------------------------------------------------------
// Error Handling Starts
//----------------------------------------------------------------------
        try {
            botDateArray = isValidTime(args[0] , dateTime);
            botTimeArray = giveValidHour(args[1]);
            ddlnActive = true;
        }catch(error) {
            switch(error.message) {
                case 'NullMonthException':
                    return message.reply('That month is invalid');
                case 'NullDayException':
                    return message.reply('That day is invalid');
                case 'NullYearException':
                    return message.reply('That year has passed');
                case 'InvalidTimestamp':
                    return message.reply(`${args[0]} is not a valid date. The valid format is dd/mm/yyyy.`);
                case 'InvalidTimeFormat':
                    return message.reply(`${args[1]} is not a valid time. The valid format is hh:mm.`);
            }
        }
//-------------------------
// Error Handling Ends
//-------------------------

        const setDate = [...botDateArray];
        let setHour = eval(args[1].split(':')[0]);
        let setTime = {standard: args[1] + ' ' + args[2].toUpperCase() , botTime: [...botTimeArray]};
        if(args[2] === 'PM' || (args[2] === 'AM' && setHour === 12)) setTime.botTime[0] += 12;
        const setTitle = args.slice(3 - args.length).join(' ');
        const author = message.author;
        let rolesAdded = false;
        let membersAdded = false;
        let timesAdded = false;
        let tasksAdded = false;
        let channelAdded = false;

/*
tasks {name: string , value: string}
pingMembers {mention: string , member: object}
pingRoles {mention: string , role: object}
pingTimes {standard: string , botTime: array ([hour , minute])}
*/
        let newDeadline = {
            title: setTitle,
            dueDate: setDate,
            dueTime: setTime,
            creator: message.author,
            startDate: `${dateTime.monthInfo[dateTime.month].monthName} ${dateTime.day} ${dateTime.year}`,
            pingChannel: {},
            tasks: [],
            pingMembers: [],
            pingRoles: [],
            pingTimes: [],
            //sendPing: false,
            //pingSent: false,
            guild: message.guild};

        message.channel.send(`Due Date Set To: ${setDate.join('/')}\nDue Time Set To: ${args[1]} ${args[2]}\nTitle Set To: ${setTitle}`);
        message.channel.send('Would you like to add specific roles to ping? If not please enter "done".\nIf no roles or members are added this deadline will ping everyone.');

//----------------------------------------------------------------------
// Event Handling Starts
//----------------------------------------------------------------------
        client.on('message' , newMessage => {
            if(newMessage.author !== author || !ddlnActive) return;
            if(newMessage.channel !== message.channel) return;
            if(newMessage.content === 'cancel') {
                ddlnActive = false;
                message.channel.send('Deadline Cancelled');
                return;
            }
            let newArgs = newMessage.content.split(' ');
            const mentionsArray = [];
            mentionsArray.length = 0;
// Roles
            if(!rolesAdded) {
// Done - Roles
                if(newMessage.content === 'done') {
                    message.channel.send('Would you like to add specific members to ping? If not please enter "done".\nIf no roles or members are added this deadline will ping everyone.');
                    rolesAdded = true;
                }
// Removing Roles
                else if(newArgs[0] === 'remove') {
                    newArgs.shift();
                    newArgs.forEach(arg => {
                        try {
                            if(newDeadline.pingRoles.find(role => role.mention === arg)) {
                                delete newDeadline.pingRoles[newDeadline.pingRoles.indexOf(newDeadline.pingRoles.find(role => role.mention === arg))];
                                newDeadline.pingRoles = cleanArray(newDeadline.pingRoles);
                            }
                            else throw new Error();
                            message.channel.send(`The ${arg} role has been removed from this deadline
Type done if you would not like to add any more roles`);
                        }catch(error) {
                            message.channel.send(`The ${arg} role either has not been created or has not been added to this deadline
Type done if you would not like to add any more roles`);
                        }
                    });
                }
// Adding Roles
                else {
                    newArgs.forEach(arg => {
                        if(isValidRole(arg , message.guild))
                            mentionsArray.push(isValidRole(arg , message.guild));
                        else message.channel.send(`${arg} is not a valid mention`);
                    });
                    removeArrayDuplicates(mentionsArray);

                    mentionsArray.forEach(metn => {
                        if(!newDeadline.pingRoles.find(rle => rle.mention === `<@&${metn.id}>`))
                            newDeadline.pingRoles.push({mention: `<@&${metn.id}>` , role: metn});
                            message.channel.send(`Added <@&${metn.id}> to the deadline
Type done if you would not like to add any more roles`);
                    });
                }
            }
            else if(!membersAdded) {
// Done - Members
                if(newMessage.content === 'done') {
                    message.channel.send('Please specify a time to send the deadline daily\nBy default the ping will be sent at 05:00 PM');
                    if(!newDeadline.pingRoles[0] && !newDeadline.pingMembers[0]) {
                        let everyoneRole = message.guild.roles.cache.find(role => role.name === '@everyone');
                        newDeadline.pingRoles.push({mention: `@everyone` , role: everyoneRole});
                    }
                    membersAdded = true;
                }
// Removing Members
                else if(newArgs[0] === 'remove') {
                    newArgs.shift();
                    newArgs.forEach(arg => {
                        try {
                            if(newDeadline.pingMembers.find(mmbr => mmbr.mention === arg)) {
                                delete newDeadline.pingMembers[newDeadline.pingMembers.indexOf(newDeadline.pingMembers.find(mmbr => mmbr.mention === arg))];
                                newDeadline.pingMembers = cleanArray(newDeadline.pingMembers);
                            }
                            else throw new Error();
                            message.channel.send(`${arg} has been removed from this deadline
Type done if you would not like to add any more members`);
                        }catch(error) {
                            message.channel.send(`${arg} either has not joined the server or has not been added to this deadline
Type done if you would not like to add any more members`);
                        }
                    });
                }
// Adding Members
                else {
                    newArgs.forEach(arg => {
                        if(isValidMember(arg , message.guild))
                            mentionsArray.push(isValidMember(arg , message.guild));
                        else message.channel.send(`${arg} is not a valid mention`);
                        });
                    removeArrayDuplicates(mentionsArray);

                    mentionsArray.forEach(metn => {
                        if(!newDeadline.pingMembers.find(mmbr => mmbr.mention === `<@!${metn.id}>`)) {
                            newDeadline.pingMembers.push({mention: `<@!${metn.id}>` , role: metn});
                            message.channel.send(`Added <@!${metn.id}> to the deadline 
Type done if you would not like to add any more members`);
                        }
                    });
                }
            }
            else if(!timesAdded) {
// Done - Times
                if(newMessage.content === 'done') {
                    message.channel.send('Please specify any tasks to add to the deadline (Format: Title|Description)');
                    if(!newDeadline.pingTimes[0]) newDeadline.pingTimes.push({standard: '05:00 PM' , botTime: [17 , 0]});
                    timesAdded = true;
                }
// Removing Times
                else if(newArgs[0] === 'remove') {
                    newArgs.shift();
                    try {
                        if(newDeadline.pingTimes.find(time => time.standard === newArgs.join(' '))) {
                            delete newDeadline.pingTimes[newDeadline.pingTimes.indexOf(newDeadline.pingTimes.find(time => time.standard === newArgs.join(' ')))];
                            newDeadline.pingTimes = cleanArray(newDeadline.pingTimes);
                        }
                        else throw new Error();
                        message.channel.send(`${newArgs.join(' ')} has been removed from this deadline
Type done if you would not like to add any more times`);
                    }catch(error) {
                        message.channel.send(`${newArgs.join(' ')} is either an invalid time or has not been added to this deadline
Type done if you would not like to add any more times`);
                    }
                }
// Adding Times
                else {
                    try {
                        if(newArgs.length > 2) throw new Error();
                        if(!newArgs[1] || (newArgs[1].toLowerCase() !== 'am' && newArgs[1].toLowerCase() !== 'pm')) {
                            message.channel.send('Please enter AM or PM after the time');
                            throw new Error();
                        }
                        if(Array.isArray(giveValidHour(newArgs[0]))) {
                            let newBotTime = giveValidHour(newArgs[0]);
                            let afternoon = newArgs[1].toLowerCase() === 'pm' ? 12 : 0;
                            newBotTime[0] += afternoon;
                            if(!newDeadline.pingTimes.find(time => time.standard === newArgs.join(' ')))
                                newDeadline.pingTimes.push({standard: newArgs[0] + ' ' + newArgs[1].toUpperCase() , botTime: newBotTime});
                            message.channel.send(`${newArgs.join(' ')} has been added to this deadline
Type done if you would not like to add any more times`);
                        }
                    }catch(error) {
                        message.channel.send(`${newArgs.join(' ')} is an invalid time
Type done if you would not like to add any more times`);
                    }
                }
            }
            else if(!tasksAdded) {
// Done - Tasks
                if(newMessage.content === 'done') {
                    message.channel.send('Please specify a channel to send the reminders');
                    tasksAdded = true;
                }
// Removing Tasks
                else if(newArgs[0] === 'remove') {
                    try {
                        newArgs.shift();
                        if(newDeadline.tasks.find(task => task.name === newArgs.join(' '))) {
                            delete newDeadline.tasks[newDeadline.tasks.indexOf(newDeadline.tasks.find(task => task.name === newArgs.join(' ')))];
                            newDeadline.tasks = cleanArray(newDeadline.tasks);
                            message.channel.send(`${newArgs.join(' ')} has been removed`);
                        }
                        else
                            message.channel.send('This deadline does not have a task with that name');
                    }catch(error) {
                        message.channel.send('This deadline does not have a task with that name');
                    }
                }
// Adding Tasks
                else {
                    let titleDescription = newArgs.join(' ').split('|');
                    let taskTitle = titleDescription.shift();
                    let taskDescription = 'No Description';

                    if(newDeadline.tasks.find(tle => tle.name === taskTitle))
                        message.channel.send('A task with this title already exists');
                    else {
                        if(titleDescription.length > 0)
                            taskDescription = titleDescription.join('|');
                        newDeadline.tasks.push({name: taskTitle , value: taskDescription});
                        message.channel.send(`Task Added:\nTitle: ${taskTitle}\nDescription: ${taskDescription}`);
                    }
                }
            }
            else if(!channelAdded) {
                try {
                    let newChannel = message.guild.channels.cache.find(chnl => chnl.name === newArgs.join(' '));
                    if(!newChannel) throw new Error();

                    newDeadline.pingChannel = newChannel;
                    deadlines.push(newDeadline);
                    message.channel.send('Deadline set!');
                    ddlnActive = false;
                    return;
                }catch(error) {
                    message.channel.send('That is not a valid channel name');
                }
            }
        });
//-------------------------
// Event Handling Ends
//-------------------------

        //ddlnActive = false;
    }
}

/* turns a string into a number without risk of error */
function giveNumber(number) {
    try {
        eval(number);
    }catch(error) {
        return NaN;
    }
    return eval(number);
    // if(typeof eval(number) === 'number') return eval(number);
    //  return NaN;
}

/* Determines if a passed timestamp is valid and returns the valid timestamp
based on the year and date */
function isValidTime(timestamp , dateTime) {
    if(typeof timestamp !== 'string') return;
    const finalTimeStamp = [];
    let newTimestamp = timestamp.split('/');
    if(newTimestamp.length !== 3) throw new Error('InvalidTimestamp');
    newTimestamp.forEach(time => {
        if(giveNumber(time) === NaN) throw new Error('InvalidTimestamp');;
    });
    let nextTS = [...arrayToNumbers(newTimestamp)];
    
    if(nextTS[1] > 12 || nextTS[1] < 1) throw new Error('NullMonthException');
    if(nextTS[2] < dateTime.year) throw new Error('NullYearException');
    if(nextTS[0] < 1 || nextTS[0] > dateTime.monthInfo[nextTS[1]].dayCount) throw new Error('NullDayException');
    if(nextTS[2] === dateTime.year) {
        if(nextTS[1] < dateTime.month) throw new Error('NullMonthException');
        if(nextTS[1] === dateTime.month)
            if(nextTS[0] < dateTime.day) throw new Error('NullDayException'); 
    }

    finalTimeStamp.push(Math.floor(newTimestamp[0]));
    finalTimeStamp.push(Math.floor(newTimestamp[1]));
    finalTimeStamp.push(Math.floor(newTimestamp[2]));

    if(finalTimeStamp.length === 3) return finalTimeStamp;
    throw new Error('InvalidTimestamp');
}

/* arrayToNumbers - iterates through a string array
and returns the same array but as numbers */
function arrayToNumbers(passedArray) {
    let array = [...passedArray];
    const lastIndex = array.length - 1;
    for (let i = 0; i < array.length; i++) {
        if(i === 0) {
            let start = eval(array.shift());
            array.unshift(start);
            continue;
        }
        if(i === lastIndex) {
            let end = eval(array.pop())
            array.push(end);
            continue;
        }
        let firstHalf = array.slice(0 , i);
        let lastHalf = array.slice(i - lastIndex);
        let chosenOne = eval(array.slice(i , i + 1)[0]);
        array = [...firstHalf , chosenOne , ...lastHalf];
    }
    return array;
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

/* Determines if a message sent is a mention and a valid role
returns the role or undefined */
function isValidRole(role , guild) {
    if(role.length !== 22) return undefined;
    let checkRole = guild.roles.cache.find(testRole => testRole.id === role.slice(3 , 21));
    if(checkRole) return checkRole;
    return undefined;
}

/**
 * Determines if a message sent is a mention and a valid member
 * returns the member or undefined
*/ 
function isValidMember(member , guild) {
    if(member.length !== 22) return undefined;
    let checkMember = guild.members.cache.find(testMember => testMember.id === member.slice(3 , 21));
    if(checkMember) return checkMember;
    return undefined;
}

/**
 * removes duplicate items
 */
function removeArrayDuplicates(array) {
    array.forEach(idx => {
        let savedIndex = array.indexOf(idx);
        array[savedIndex] = null;
        while(array.includes(idx)) {
            delete array[array.indexOf(idx)];
        }
        array[savedIndex] = idx;
        array = cleanArray(array);
    });
}

/**
 * removes empty items/falsey values
 */
function cleanArray(givenArray) {
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