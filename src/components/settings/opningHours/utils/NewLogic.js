import moment from "moment"

export class SequenceManager {
    constructor(e = {}) {
        // this.event = e
        this.employee = e?.employee
        this.detailId = e?.detailId
        this.weekday = e?.weekday
        this.employees_opening_hour = e?.employees_opening_hour
    }

    // delete whole series
    removeDetail() {
        let newEmployee = {
            ...this.employee,
            detail: this?.employee?.detail.filter((item) => item.id !== this?.detailId)
        }

        return newEmployee
    }

    // delete occurrence
    addHoliday() {
        let newEmployee = {
            ...this.employee,
            detail: this.employee?.detail.map((item) => ({
                ...item,
                off_days: item?.off_days ? [...item?.off_days, moment(this.weekday).format('YYYY-MM-DD')] : [moment(this.weekday).format('YYYY-MM-DD')]
            }))
        }
        return newEmployee
    }

    // remove deleted occurrence
    removeHoliday() {
        let newEmployee = {
            ...this.employee,
            detail: this.employee?.detail.map((item) => ({
                ...item,
                off_days: item?.off_days ? item?.off_days.filter((day) => day !== moment(this.weekday).format('YYYY-MM-DD')) : []
            }))
        }
        return newEmployee
    }

    // add or update series
    updateDetail(finalValues , type) {

        const updatedEmployees = this.employees_opening_hour.map((empObj) => {
            if (Array.isArray(finalValues)) {
                return finalValues.reduce((acc, item) => {
                    if (empObj.id === item.employee_id) {

                        const detailIndex = empObj?.detail?.findIndex((detailObj) => detailObj?.id == this.detailId);

                        let newDetail = [...empObj.detail];
                        let start_date = newDetail[detailIndex]?.start_date;
                        let end_date = newDetail[detailIndex]?.end_date;
                        let repeat = newDetail[detailIndex]?.repeat;

                        if (this.detailId) {
                            if (detailIndex !== -1) {
                                if (type === 'occurrence' && (item.start_date === start_date && item.end_date === end_date && item.repeat === repeat)) {

                                    let match = Object?.keys(item.additional_days)?.find((day) => day === moment(this.weekday).format('YYYY-MM-DD'));
                                    if (match) {
                                        newDetail[detailIndex] = {
                                            ...newDetail[detailIndex],
                                            add_break : item.add_break,
                                            additional_days: {
                                                ...newDetail[detailIndex].additional_days,
                                                [match]: {
                                                    start_time: item.start_time,
                                                    end_time: item.end_time,
                                                    start_break_time: item.start_break_time,
                                                    end_break_time: item.end_break_time
                                                }
                                            }
                                        }
                                    } else {
                                        newDetail[detailIndex] = {
                                            ...newDetail[detailIndex],
                                            additional_days: {
                                                ...newDetail[detailIndex].additional_days,
                                                [moment(this.weekday).format('YYYY-MM-DD')]: {
                                                    start_time: item.start_time,
                                                    end_time: item.end_time,
                                                    start_break_time: item.start_break_time,
                                                    end_break_time: item.end_break_time
                                                }
                                            }
                                        }
                                    }

                                } else {
                                    newDetail[detailIndex] = {
                                        ...item,
                                        additional_days: {}
                                    };
                                }
                            } else {
                                newDetail.push(item);
                            }
                        } else {
                            newDetail.push(item);
                        }

                        return { ...empObj, detail: newDetail };
                    } else {
                        if (this.detailId) {
                            const newDetail = empObj.detail.filter((detailObj) => detailObj.id !== this.detailId);
                            return { ...empObj, detail: newDetail };
                        } else {
                            return acc;
                        }
                    }
                }, empObj);
            }
            return empObj;
        });

        return updatedEmployees;
    }
}

