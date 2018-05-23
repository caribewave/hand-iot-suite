module.exports = {
    convertToUTCTime: function convertToUTCTime(dateStr) {
        const [dateValue, timeValue] = dateStr.split(" ");
        const [day, month, year] = dateValue.split(".");
        const [hours, minutes, seconds] = timeValue.split(":");
        return new Date(Date.UTC(year, month -1, day, hours, minutes, seconds));
    }
}