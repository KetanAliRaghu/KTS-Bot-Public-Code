module.exports = async(client) => {
    //if(!guildID) return;
    const roleRainbow = client.guilds.cache.get('816751961675792414')
    .roles.cache.find(role => role.name.toLowerCase() === 'rainbow');

    if(!roleRainbow) return;

    setInterval(() => {
        roleRainbow.setColor(rainbowArray2[rainbowIndex()]);
        console.log('Updating...');
    } , 60000);
    
}

const rainbowArray = 
    ['#e91e63',
    '#e74c3c',
    '#f1c40f',
    '#2ecc71',
    '#3498db',
    '#9b59b6'];

const rainbowArray2 = 
    [15277667,
    15105570,
    15844367,
    3066993,
    51455,
    10181046];

let x = 0;
function rainbowIndex() {
    if(x >= 5) x = 0;
    else x++;
    return x;
}