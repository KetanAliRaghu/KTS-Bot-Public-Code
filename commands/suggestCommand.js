module.exports = {
    name: 'suggestCommand',
    description: 'This is a command that allows discord users to suggest commands to be implemented into the KTS Bot',
    execute(message , args , commandSuggestions) {
        let author = message.author;
        let commandName = '';
        let commandDescription = [];

        if(message.channel.id !== '864225944536875019') {
            if(message.author.id === '409026174694588418') {
                message.channel.send('Nice try Peter');
                return;
            }
            message.channel.send('Please use the "command-suggestions" channel');
            return;
        }
        
        if(!args[0])
            return message.reply('Please enter a command name and description');
        else if(commandSuggestions.find(sgst => sgst.commandName === args[0]))
            return message.reply('That command name has already been suggested, please enter a different one');
        else
            commandName = args[0];

        if(args[1]) {
            args.shift(0);
            commandDescription = [...args].join(' ');
        }else
            return message.reply('Please enter a command description');


        //message.channel.send(`<@${author.id}> suggested **${commandName}** command to __${commandDescription}__`);
        message.channel.send('Thank you for your suggestion');
        commandSuggestions.push({name: author.username , commandName: commandName , commandDescription: commandDescription});
        //console.log("Command Suggestions:");
        //console.log(commandSuggestions);
    }
}

// .suggestcommand [Command Name] [Command Description]
// .suggestcommand cat shows a random image of a cat
// args[0] args[1 - infinty]