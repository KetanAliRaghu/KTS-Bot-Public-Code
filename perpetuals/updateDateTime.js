module.exports = async(dateTime , client) => {
    setInterval(() => {
        readyDateTime();
    } , 5);
    /*
    setInterval(() => {
        client.users.cache.get('393194473045360651').send(dateTime.getTime());
        client.users.cache.get('393194473045360651').send(dateTime.getDate());
    } , 60000);
    */

    function readyDateTime() {
        let currentDate = new Date();
        //let currentHour = currentDate.getHours() < 4 ? currentDate.getHours() + 20 : currentDate.getHours() - 4;
        dateTime.setDate(
            currentDate.getDate(),
            currentDate.getMonth() + 1,
            currentDate.getFullYear()
        );
        dateTime.setTime(
            currentDate.getHours(),
            currentDate.getMinutes(),
            currentDate.getSeconds()
        );
    }
}