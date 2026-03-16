import moment from "moment";

export function getCurrentWeekInfo(date) {
    // moment.locale("en");
    const currentDate = moment(date) || moment();

    function getWeekDates(currentDate) {

        const startOfWeek = currentDate.startOf('week');
        const weekDates = [];

        for (let i = 0; i < 7; i++) {
            weekDates.push(startOfWeek.clone().add(i, 'day'));
        }

        return weekDates;
    }

    const weekDates = getWeekDates(currentDate);

    return {
        weekNumber: moment(date).isoWeek(),
        weekDates,
        weekArray: []
    };
}


export function shiftWeek(date, format, shift) {
    const currentWeek = getCurrentWeekInfo(date);
    const weekIndex = currentWeek.weekNumber;

    const shiftByWeeks = (weeks) => {
        let newDate = moment(date).add(weeks, 'week');
        return [newDate, getCurrentWeekInfo(newDate)];
    }

    let weekShift = 1;
    if (format === 'evenweek' || format === 'oddweek') {
        const isEvenWeek = (weekIndex % 2 === 0);
        weekShift = (format === 'evenweek' && isEvenWeek || format === 'oddweek' && !isEvenWeek) ? 2 : 1;
    }

    return shift === 'previous' ? shiftByWeeks(-weekShift) : shift === 'next' ? shiftByWeeks(weekShift) : null;
}



// export function dayChecker(emp, controller, index) {
//     moment.locale("en");



//     if (!emp?.detail || emp.detail.length === 0) return false;

//     let currentDate = controller.weekDates[index];
//     let currentWeek = controller.weekNumber;

//     for (let i = 0; i < emp.detail.length; i++) {

//         let item = emp.detail[i];
//         let startdate = moment(item.start_date, 'YYYY-MM-DD');
//         let enddate = item.end_date ? moment(item.end_date,  'YYYY-MM-DD') : null;
//         let repeat = item.repeat ?? 'DO_NOT_REPEAT';

//         if (moment(currentDate).isBefore(startdate)) continue;

//         if (enddate && moment(currentDate).isAfter(enddate)) continue;


//         switch (repeat) {
//             case "EVEN":
//                 if (currentWeek % 2 !== 0) {
//                     continue;
//                 }
//                 break;
//             case "ODD":
//                 if (currentWeek % 2 === 0) {
//                     continue;
//                 }
//                 break;
//             case "MONTH":
//                 if (startdate.format("DD") !== currentDate.format("DD")) {
//                     continue;
//                 }
//                 break;

//             case "DO_NOT_REPEAT":
//                 if (currentDate.format("DD") !== startdate.format("DD")) {
//                     continue;
//                 }
//                 break;

//             default:
//                 break;
//         }

//         if (repeat === 'MONTH') {
//             return true;
//         } else {




//                 if (currentDate.format("ddd") === startdate.format("ddd")) {

//                     return true;
//                 }

//         }
//     }

//     return false;
// }


export function eventChecker(emp, controller, index) {
    moment.locale("en");


    if (!emp?.detail || emp.detail.length === 0) return false;

    let currentDate = controller.weekDates[index];
    let currentWeek = controller.weekNumber;
    let currentFormattedDate = currentDate.format("YYYY-MM-DD");

    for (let i = 0; i < emp.detail.length; i++) {

        let item = emp.detail[i];
        let startdate = moment(item.start_date, 'YYYY-MM-DD');
        let enddate = item.end_date ? moment(item.end_date, 'YYYY-MM-DD') : null;
        let repeat = item.repeat ?? 'DO_NOT_REPEAT';
        let off_days = item.off_days;
        let additional_days = item.additional_days



        if (moment(currentDate).isBefore(startdate)) continue;

        if (enddate && moment(currentDate).isAfter(enddate)) continue;

        if (off_days && off_days.includes(currentFormattedDate)) {
            return { ...item, status: 'off' }
        }

        if (additional_days && Object.keys(additional_days).includes(currentFormattedDate)) {

            item = {
                ...item,
                start_time: additional_days[currentFormattedDate].start_time,
                end_time: additional_days[currentFormattedDate].end_time,
                start_break_time: additional_days[currentFormattedDate].start_break_time,
                end_break_time: additional_days[currentFormattedDate].end_break_time
            }
        } else {

            item = {
                ...item,
                start_time: item.start_time,
                end_time: item.end_time,
                start_break_time: item.start_break_time,
                end_break_time: item.end_break_time
            }
        }

        switch (repeat) {
            case "EVEN":
                if (currentWeek % 2 !== 0) {
                    continue;
                }
                break;
            case "ODD":
                if (currentWeek % 2 === 0) {
                    continue;
                }
                break;
            case "MONTH":
                if (startdate.format("DD") !== currentDate.format("DD")) {
                    continue;
                }
                break;

            case "DO_NOT_REPEAT":
                if (currentDate.format("DD-MM-YYYY") !== startdate.format("DD-MM-YYYY")) {
                    continue;
                }
                break;

            default:
                break;
        }

        if (repeat === 'MONTH') {
            return item;
        } else {



            if (currentDate.format("ddd") === startdate.format("ddd")) {

                return item;
            }

        }
    }

    return null;
}

export function eventCheckerCalendar(emp, date) {
    const locale = localStorage.getItem("language");
    moment.locale(locale === "en" ? "en-gb" : "da");

    if (!emp?.detail || emp.detail.length === 0) return false;

    let currentDate = date;
    let currentWeek = date?.week();
    let currentFormattedDate = currentDate.format("YYYY-MM-DD");


    for (let i = 0; i < emp.detail.length; i++) {

        let item = emp.detail[i];
        let startdate = moment(item.start_date, 'YYYY-MM-DD');
        let enddate = item.end_date ? moment(item.end_date, 'YYYY-MM-DD') : null;
        let repeat = item.repeat ?? 'DO_NOT_REPEAT';
        let off_days = item.off_days;
        let additional_days = item.additional_days



        if (moment(currentDate).isBefore(startdate)) continue;
        if (enddate && moment(currentDate).isAfter(enddate, 'date')) continue;
        if (off_days && off_days.includes(currentFormattedDate)) {
            return { ...item, status: 'off' }
        }

        if (additional_days && Object.keys(additional_days).includes(currentFormattedDate)) {
            item = {
                ...item,
                start_time: additional_days[currentFormattedDate].start_time,
                end_time: additional_days[currentFormattedDate].end_time,
                start_break_time: additional_days[currentFormattedDate].start_break_time,
                end_break_time: additional_days[currentFormattedDate].end_break_time
            }
        } else {

            item = {
                ...item,
                start_time: item.start_time,
                end_time: item.end_time,
                start_break_time: item.start_break_time,
                end_break_time: item.end_break_time
            }
        }

        switch (repeat) {
            case "EVEN":
                if (currentWeek % 2 !== 0) {
                    continue;
                }
                break;
            case "ODD":
                if (currentWeek % 2 === 0) {
                    continue;
                }
                break;
            case "MONTH":
                if (startdate.format("DD") !== currentDate.format("DD")) {
                    continue;
                }
                break;

            case "DO_NOT_REPEAT":
                if (currentDate.format("DD-MM-YYYY") !== startdate.format("DD-MM-YYYY")) {
                    continue;
                }
                break;

            default:
                break;
        }

        if (repeat === 'MONTH') {
            return item;
        } else {



            if (currentDate.format("ddd") === startdate.format("ddd")) {

                return item;
            }

        }
    }

    return null;
}
// export function dateIdFinder({ emp, date }) {

//     if (!emp?.detail || emp.detail.length === 0) return false;

//     for (let i = 0; i < emp.detail.length; i++) {
//         let item = emp.detail[i];

//         if (moment(item.start_date).format("ddd") === moment(date).format("ddd")) {
//             return item.id;
//         }
//     }

//     return false;
// }


export function isEmpAvailable(emp, currentDate) {
    moment.locale("en-gb");

    if (!emp?.availabilityDay) return false;
    let currentWeek = moment(currentDate).isoWeek()






    for (let i = 0; i < emp.availabilityDay.length; i++) {

        let item = emp.availabilityDay[i];
        let startdate = moment(item.start_date, 'YYYY-MM-DD');
        let enddate = item.end_date ? moment(item.end_date, 'YYYY-MM-DD') : null;
        let repeat = item.repeat ?? 'DO_NOT_REPEAT';

        if (moment(currentDate).isBefore(startdate)) continue;

        if (enddate && moment(currentDate).isAfter(enddate)) continue;


        switch (repeat) {
            case "EVEN":
                if (currentWeek % 2 !== 0) {
                    continue
                }
                break;
            case "ODD":
                if (currentWeek % 2 === 0) {
                    continue
                }
                break;
            case "MONTH":
                if (startdate.format("DD") !== currentDate.format("DD")) {
                    continue
                }
                break;

            case "DO_NOT_REPEAT":
                if (startdate.format("DD-MM-YYYY") !== currentDate.format("DD-MM-YYYY")) {
                    continue
                }
                break;

            default:
                break;
        }

        if (repeat === 'MONTH') {
            return true
        } else {

            if (currentDate.format("ddd") === startdate.format("ddd")) {

                return true;
            }

        }


    }



    return false

}


const compareTime = (item, currentDate) => {
    const currentDateTime = moment(moment(currentDate).format('HH:mm:ss'), 'HH:mm:ss');
    const startTime = moment(item.start_time, 'HH:mm:ss');
    const endTime = moment(item.end_time, 'HH:mm:ss');
    const breakStartTime = moment(item.start_break_time, 'HH:mm:ss');
    const breakEndTime = moment(item.end_break_time, 'HH:mm:ss');



    // Check if current time is between startTime and endTime
    // const isBetweenStartAndEnd = currentDateTime.isBetween(startTime, endTime);
    const isBetweenStartAndEnd = currentDateTime.isSameOrAfter(startTime) && currentDateTime.isBefore(endTime);

    // Check if current time is between breakStartTime and breakEndTime
    // const isBetweenBreak = currentDateTime.isBetween(breakStartTime, breakEndTime);
    const isBetweenBreak = currentDateTime.isSameOrAfter(breakStartTime) && currentDateTime.isBefore(breakEndTime);

    // Final check
    if (isBetweenStartAndEnd && !isBetweenBreak) {

        return true

    }
}

export function isEmpAvailableOnSpecificSlot(emp, currentDate) {



    // let currentWeek = currentDate.isoWeek()
    const weekInfo = getCurrentWeekInfo(currentDate);

    let currentWeek = weekInfo.weekNumber;


    // emp.detail.map((empObj) => {
    //     let item = empObj.detail;

    //     let startdate = moment(item.start_date, 'YYYY-MM-DD');
    //     let enddate = item.end_date ? moment(item.end_date,  'YYYY-MM-DD') : null;
    //     let repeat = item.repeat ?? 'DO_NOT_REPEAT';


    //     if (moment(currentDate).isBefore(startdate)) continue;

    //     if (enddate && moment(currentDate).isAfter(enddate)) continue;


    //     switch (repeat) {
    //         case "EVEN":
    //             if (currentWeek % 2 !== 0) {
    //                 return false
    //             }
    //             break;
    //         case "ODD":
    //             if (currentWeek % 2 === 0) {
    //                 return false
    //             }
    //             break;
    //         case "MONTH":
    //             if (startdate.format("DD") !== currentDate.format("DD")) {
    //                 return false
    //             }
    //             break;

    //         case "DO_NOT_REPEAT":
    //             if (currentDate.format("DD") !== startdate.format("DD")) {
    //                 return false
    //             }
    //             break;

    //         default:
    //             break;
    //     }

    //     if (repeat === 'MONTH') {

    //         // return true
    //         if(moment(currentDate).isSameOrAfter(moment(item.start_time, 'HH:mm:ss'),'minute') && moment(currentDate).isSameOrBefore(moment(item.end_time, 'HH:mm:ss'), 'minute')){
    //             if(moment(currentDate).isSameOrAfter(moment(item.start_break_time, 'HH:mm:ss'),'minute') && moment(currentDate).isSameOrBefore(moment(item.end_break_time, 'HH:mm:ss'), 'minute')){
    //                 return false
    //             }
    //             return true
    //         }  else{
    //             return false
    //         } 
    //     } else {





    //             if (currentDate.format("ddd") === startdate.format("ddd")) {




    //                 const currentDateTime = moment(moment(currentDate).format('HH:mm:ss'),'HH:mm:ss');
    //                 const startTime = moment(item.start_time, 'HH:mm:ss');
    //                 const endTime = moment(item.end_time, 'HH:mm:ss');
    //                 const breakStartTime = moment(item.start_break_time, 'HH:mm:ss');
    //                 const breakEndTime = moment(item.end_break_time, 'HH:mm:ss');




    //                 // Check if current time is between startTime and endTime
    //                 const isBetweenStartAndEnd = currentDateTime.isBetween(startTime, endTime);

    //                 // Check if current time is between breakStartTime and breakEndTime
    //                 const isBetweenBreak = currentDateTime.isBetween(breakStartTime, breakEndTime);

    //                 // Final check
    //                 if (isBetweenStartAndEnd && !isBetweenBreak) {

    //                     return true

    //                 } else {
    //                     return false
    //                 }
    //             }

    //     }
    // })



    for (let i = 0; i < emp.detail.length; i++) {

        let item = emp.detail[i];
        let startdate = moment(item.start_date, 'YYYY-MM-DD');
        let enddate = item.end_date ? moment(item.end_date, 'YYYY-MM-DD') : null;
        let repeat = item.repeat ?? 'DO_NOT_REPEAT';
        let additional_days = item.additional_days

        if (item.off_days.includes(currentDate.format('YYYY-MM-DD'))) {
            return false
        }


        if (moment(currentDate).isBefore(startdate, 'date')) continue;

        if (enddate && moment(currentDate).isAfter(enddate, 'date')) continue;

        if (additional_days && Object.keys(additional_days).includes(currentDate.format("YYYY-MM-DD"))) {
            item = {
                ...item,
                start_time: additional_days[currentDate.format("YYYY-MM-DD")].start_time,
                end_time: additional_days[currentDate.format("YYYY-MM-DD")].end_time,
                start_break_time: additional_days[currentDate.format("YYYY-MM-DD")].start_break_time,
                end_break_time: additional_days[currentDate.format("YYYY-MM-DD")].end_break_time
            }
        } else {
            item = {
                ...item,
                start_time: item.start_time,
                end_time: item.end_time,
                start_break_time: item.start_break_time,
                end_break_time: item.end_break_time
            }
        }


        switch (repeat) {
            case "EVEN":
                if (currentWeek % 2 !== 0) {
                    continue
                }
                break;
            case "ODD":
                if (currentWeek % 2 === 0) {
                    continue
                }
                break;
            case "MONTH":
                if (startdate.format("DD") !== currentDate.format("DD")) {
                    continue
                }
                break;

            case "DO_NOT_REPEAT":
                if (currentDate.format("DD-MM-YYYY") !== startdate.format("DD-MM-YYYY")) {
                    continue
                }
                break;

            default:
                break;
        }

        if (repeat === 'MONTH') {
            if (startdate.format("DD") !== currentDate.format("DD")) {
                return false
            }

            if (currentDate.format("DD") === startdate.format("DD")) {
                return compareTime(item, currentDate)
            }
        } else {

            if (currentDate.format("ddd") === startdate.format("ddd")) {

                return compareTime(item, currentDate)
            }
        }

    }


    return false

}

export function eventFinder({ emp, date }) {

    if (!emp?.detail || emp.detail.length === 0) return null;

    for (let i = 0; i < emp.detail.length; i++) {
        let item = emp.detail[i];

        if (moment(item.start_date).format("ddd") === moment(date).format("ddd")) {
            return item;
        }
    }

    return null;
}

export function getStartEndTime({ emp, date, type = "WEEK" }) {
    if (!emp?.detail || emp.detail.length === 0) return false;

    for (let i = 0; i < emp.detail.length; i++) {
        let item = emp.detail[i];
        type = item.repeat;

        if (type === "WEEK" || type === "EVEN" || type === "ODD" || type === null && moment(item.start_date).format("ddd") === moment(date).format("ddd")) {
            const startTime = moment(item.start_time, 'HH:mm:ss').format('HH:mm');
            const endTime = moment(item.end_time, 'HH:mm:ss').format('HH:mm');
            return { startTime, endTime, item };
        }

        if (type === "MONTH" || type === null && moment(item.start_date).format("DD") === moment(date).format("DD")) {
            const startTime = moment(item.start_time, 'HH:mm:ss').format('HH:mm');
            const endTime = moment(item.end_time, 'HH:mm:ss').format('HH:mm');
            return { startTime, endTime, item };
        }




    }

    return false;
}