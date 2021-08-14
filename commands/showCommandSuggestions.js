const { DiscordAPIError } = require("discord.js")

module.exports = {
    name: 'showCommandSuggestions',
    description: 'This is a command that lists the command suggestions made by server members',
    execute(message , args , commandSuggestions , Discord) {
        if(!message.guild.member(message.author).hasPermission('ADMINISTRATOR'))
            return;
        
        if(!commandSuggestions[0]) {
            message.channel.send('There are no command suggestions');
            return;
        }
        
        let suggestionsEmbed = new Discord.MessageEmbed()
            .setTitle('Command Suggestions')
            .setColor('#62ddff');

        for(let sgst of commandSuggestions)
            suggestionsEmbed.addField(`${sgst.name}: ${sgst.commandName}` , sgst.commandDescription);
            
        message.channel.send(suggestionsEmbed);
    }
}