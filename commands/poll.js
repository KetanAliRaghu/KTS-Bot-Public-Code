module.exports = {
    name: 'poll',
    description: 'This command creates a poll embed.',
    execute(message , args , Discord , client , pollActive) {
        if(!args[0]) {
            message.channel.send('Please enter a Title with the command (Ex: .poll Title)');
            return;
        }
        pollActive = true;
        const title = args.join(' ');
        const author = message.author;
        let description;
        const optionsList = [];
        let selectedChannel;
        let done = false;

        message.channel.send('Please enter a description');
        
        client.on('message' , newMessage => {
// If the poll command is not active or the message was not sent by the author
// the bot will do nothing
            if(newMessage.author !== author || !pollActive) return;
// If the user sends 'cancel' the poll will be stopped
            if(newMessage.content.split(' ')[0] === 'cancel') {
                    message.channel.send('Poll Cancelled');
                    pollActive = false;
                    return;
                }
// If their is no description the bot will keep asking until there is a description
            if(description == null) {
                description = newMessage.content;
                message.channel.send('Please enter an option (Ex: 🔵 Blue)');
            }else if(!done || optionsList.length >= 20) {
// If the message 'done' has not bee typed the bot will continue to accept options
// If the the user has entered less than 2 options the bot will ask for more options
                if(newMessage.content.toLowerCase() === 'done') {
                    if(optionsList.length < 2) message.channel.send('You must enter at least 2 options and no more than 20');
                    else {
                        done = true;
                        message.channel.send('Please enter a channel to send the poll');
                    }
                }
// So long as the first character is an emoji and there is at least a one-word
// Description the bot will add the option to the optionsList
                else {
                    let newArgs = newMessage.content.split(' ');
                    let optionDescription = [...newArgs];
                    optionDescription.shift();
                    if(newArgs.length >= 2)
                        newMessage.react(newArgs[0]).then(() => {
                            message.channel.send('Accepted');
                            optionsList.push({emoji: newArgs[0] , description: optionDescription.join(' ')});
                        }, () => {
                            message.channel.send('Please enter a valid option (Ex: 🔵 Blue)');
                        });
                    else
                        message.channel.send('Please enter an emoji and an option description');
                }
// If the user has not selected a valid channel the bot will ask until a
// valid channel has been selected
            }else if(!selectedChannel) {
                try {
                    selectedChannel = message.guild.channels.cache
                    .find(chnl => chnl.name === newMessage.content);
                    if(selectedChannel == undefined) throw new Error();
                    sendPoll();
                }catch(error) {
                    message.channel.send('Please enter a valid channel');
                }
            }
        });
        async function sendPoll() {
            let pollEmbed = new Discord.MessageEmbed()
                .setColor('#62ddff')
                .setTitle(title)
                .setDescription(description)
                .setThumbnail(`https://cdn.discordapp.com/avatars/${client.user.id}/${client.user.avatar}.webp`)
                .setFooter(`Poll Created By: @${author.username}`);

            optionsList.forEach(optn => { pollEmbed.addField(optn.emoji , optn.description , true); });
                    
            message.channel.send('Poll Sent!');
                    
            let pollEmbedReact = await selectedChannel.send(pollEmbed);

            optionsList.forEach(emj => { pollEmbedReact.react(emj.emoji); });
           
            message.channel.send('Reactions Added!');
            pollActive = false;
            return;
        }
    }
}

//REMEMBER reset pollActive to false at the end