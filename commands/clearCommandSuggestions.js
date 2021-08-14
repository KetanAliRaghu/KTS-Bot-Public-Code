module.exports = {
    name: 'clearCommandSuggestions',
    description: 'This is a command that clears the command suggestions list',
    execute(message , args , commandSuggestions) {
        if(message.guild.member(message.author).hasPermission('ADMINISTRATOR')) {
            commandSuggestions.length = 0;
            message.channel.send('Command suggestions have been cleared');
        }
    }
}