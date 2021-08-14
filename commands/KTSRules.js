module.exports = {
    name: 'KTSRules',
    description: 'This is a command that lists the Kids That STEM (KTS) rules in the channel with the name "rules"',
    execute(message , args , client) {
// Ignore this, it was late and I am lazy
        const rulesChannel = message.guild.channels.cache.find(chnl => chnl.name === 'rules');
        rulesChannel.send(
`
▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
Welcome to the Kids that STEM Server
▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬

Hi everyone! Here are the general rules for the Kids that STEM (KTS) Server. Please abide by them at all times you are active on the server:

#1: Always be respectful to others. Racist, sexist, anti-LGBTQ+, or otherwise offensive content will not be tolerated.
#2: No offensive cursing (reference rule #1 and rule #4).
#3: No text spamming, mic spamming, or bot/command spamming.
#4: No bullying, trolling, or general toxicity.
#5: No NSFW content including discussions, shared images/videos, nicknames, profile pictures, etc.
#6: No alt accounts.
#7: Please rename yourself to your real name in the server.
#8: Do not ping other members of the server without a legitimate reason (e.g. @ username). Excessive pinging is not allowed. Furthermore do not use @everyone or @here.
#9: Do not self-promote without permission.
#10: Keep channel discussions on-topic pertaining to the channel (unless you're in the off-topic channel).
#11: No voice changers during meetings.`);
    }
}