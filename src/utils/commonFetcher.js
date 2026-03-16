export const getWeekDayByLang = ({ lang, length = 'full' }) => {

    const weekDays = {
        'Monday': 'Mandag',
        'Tuesday': 'Tirsdag',
        'Wednesday': 'Onsdag',
        'Thursday': 'Torsdag',
        'Friday': 'Fredag',
        'Saturday': 'Lørdag',
        'Sunday': 'Søndag',
    };
    const weekDayEntries = Object.entries(weekDays);
    let result = {};

    weekDayEntries.forEach(([enDay, daDay]) => {
        if (lang === 'da') {
            result[enDay] = daDay;
        } else if (lang === 'en') {
            result[daDay] = enDay;
        }
    });

    if (length === 'full') {
        return result;
    } else {
        const trimmedResult = {};
        Object.entries(result).forEach(([key, value]) => {
            trimmedResult[key] = value.slice(0, length);
        });
        return trimmedResult;
    }
}
