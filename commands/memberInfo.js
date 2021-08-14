module.exports = {
    name: 'memberInfo',
    description: 'This is a command to show the profile picture, name, discriminator, roles, and nicknames of a member of the Kids That STEM Discord Server',
    execute(message , args , Discord , client) {
        const guild = client.guilds.cache.get('816751961675792414');
        //const memberNames = guild.members.cache.map(mmbr => mmbr.user.username);
        //const memberRoles = guild.members.cache.map(mmbr => mmbr._roles.map(rle => guild.roles.cache.get(rle).name));
        
        const member = message.mentions.users.first();
        const user = message.mentions.members.first();

        if(!member || !user) {
            message.channel.send('Member not found');
            return;
        }

        const memberRoles = user._roles.map(rle => guild.roles.cache.get(rle).name)
        const memberPFP = `https://cdn.discordapp.com/avatars/${member.id}/${member.avatar}.webp`

        let memberEmbed = new Discord.MessageEmbed()
            .setTitle(`${member.username}#${member.discriminator}`)
            .setThumbnail(memberPFP)
            .setColor('#62ddff')
            .setDescription(`__**Roles**__:\n[${memberRoles.join('],\n[')}]`);
        if(user.nickname)
            memberEmbed.setFooter(`Nickname: ${user.nickname}`);

        message.channel.send(memberEmbed);
    }
}