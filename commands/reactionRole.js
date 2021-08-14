module.exports = {
    name: 'reactionRole',
    description: 'This is a command that creates an embed to give role to server members',
    execute(message , args , Discord , client , rrActive) {
        if(!message.guild.member(message.author).hasPermission('ADMINISTRATOR') || !args[0]) {
            message.channel.send('Please enter a Title with the command (Ex: .reactionrole Title)');
            return;
        }
        rrActive = true;
        const title = args.join(' ');
        const author = message.author;
        let description;
        const optionsList = [];
        let selectedChannel;
        let done = false;
        let rrEmbedReact;

        message.channel.send('Please enter a description');
        
        client.on('message' , newMessage => {
// If the rr command is not active or the message was not sent by the author
// the bot will do nothing
            if(newMessage.author !== author || !rrActive) return;
// If the user sends 'cancel' the rr will be stopped
            if(newMessage.content.split(' ')[0] === 'cancel') {
                    message.channel.send('Reaction Role Cancelled');
                    rrActive = false;
                    return;
                }
// If their is no description the bot will keep asking until there is a description
            if(description == null) {
                description = newMessage.content;
                message.channel.send('Please enter an option (Ex: 🙂 Member)');
            }else if(!done || optionsList.length >= 20) {
// If the message 'done' has not bee typed the bot will continue to accept options
// If the the user has entered less than 2 options the bot will ask for more options
                if(newMessage.content.toLowerCase() === 'done') {
                    if(optionsList.length < 1) message.channel.send('You must enter at least 1 option and no more than 20');
                    else {
                        done = true;
                        message.channel.send('Please enter a channel to send the reaction role');
                    }
                }
// So long as the first character is an emoji and there is at least a one-word
// Description the bot will add the option to the optionsList
                else {
                    let newArgs = newMessage.content.split(' ');
                    let optionDescription = [...newArgs];
                    optionDescription.shift();
                    let selectedRole = message.guild.roles.cache.find(rle => rle.name === optionDescription.join(' '));
                    
                    if(selectedRole && newArgs.length >= 2)
                        newMessage.react(newArgs[0]).then(() => {
                            message.channel.send('Accepted');
                            optionsList.push({emoji: newArgs[0] , roleName: optionDescription.join(' ')});
                        }, () => {
                            message.channel.send('Please enter a valid role (Ex: 🙂 Member)');
                        });
                    else
                        message.channel.send('Please enter an emoji and a valid role name');
                }
// If the user has not selected a valid channel the bot will ask until a
// valid channel has been selected
            }else if(!selectedChannel) {
                try {
                    selectedChannel = message.guild.channels.cache
                    .find(chnl => chnl.name === newMessage.content);
                    if(selectedChannel == undefined) throw new Error();
                    sendRR();
                }catch(error) {
                    message.channel.send('Please enter a valid channel');
                }
            }
        });
        async function sendRR() {
// Sends the reactionrole embed.
            let rrEmbed = new Discord.MessageEmbed()
                .setColor('#62ddff')
                .setTitle(title)
                .setDescription(description)
                .setThumbnail(`https://cdn.discordapp.com/avatars/${client.user.id}/${client.user.avatar}.webp`)
                .setFooter(`Reaction Role Created By: @${author.username}`);

            optionsList.forEach(optn => { rrEmbed.addField(optn.emoji , optn.roleName , true); });
                    
            message.channel.send('Reaction Role Sent!');
                    
            rrEmbedReact = await selectedChannel.send(rrEmbed);

            optionsList.forEach(emj => { rrEmbedReact.react(emj.emoji); });
           
            message.channel.send('Reactions Added!');
            rrActive = false;
        }

        client.on('messageReactionAdd' , async (reaction , user) => {
//if the reaction was not added by the bot and the message is the same as
//the reaction message the corresponding role will be added/removed
            if(reaction.message.partial) await reaction.message.fetch();
            if(reaction.partial) await reaction.fetch();
            if(user.bot || !reaction.message.guild) return;
            if(reaction.message.id !== rrEmbedReact.id) return;

            if(reaction.message.channel.id === selectedChannel.id) {
                let addRoleEmoji = optionsList.find(rle => rle.emoji === reaction._emoji.name);
                let addedRole = message.guild.roles.cache.find(rle => rle.name === addRoleEmoji.roleName);
                await reaction.message.guild.members.cache.get(user.id).roles.add(addedRole);
            }else return;
        });

        client.on('messageReactionRemove' , async (reaction , user) => {
            if(reaction.message.partial) await reaction.message.fetch();
            if(reaction.partial) await reaction.fetch();
            if(user.bot || !reaction.message.guild) return;
            if(reaction.message.id !== rrEmbedReact.id) return;

            if(reaction.message.channel.id === selectedChannel.id) {
                let addRoleEmoji = optionsList.find(rle => rle.emoji === reaction._emoji.name);
                let addedRole = message.guild.roles.cache.find(rle => rle.name === addRoleEmoji.roleName);
                await reaction.message.guild.members.cache.get(user.id).roles.remove(addedRole);
            }else return;
        });
    }
}