function getEveryDayBetween(start, end) {
    let days = []
    for (let dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)) {
        days.push(new Date(dt))
    }

    return days
}

Date.prototype.toYearMonthString = function () {
    return `${this.getFullYear()}-${(this.getMonth() + 1).toString().padStart(2, "0")}`
}

Date.prototype.toYearWeekString = function () {
    return `${this.getWeekYear()}-W${this.getWeek().toString().padStart(2, "0")}`
}

// This script is released to the public domain and may be used, modified and
// distributed without restrictions. Attribution not necessary but appreciated.
// Source: https://weeknumber.net/how-to/javascript

// Returns the ISO week of the date.
Date.prototype.getWeek = function () {
    const date = new Date(this.getTime())
    date.setHours(0, 0, 0, 0)
    // Thursday in current week decides the year.
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7)
    // January 4 is always in week 1.
    const week1 = new Date(date.getFullYear(), 0, 4)
    // Adjust to Thursday in week 1 and count number of weeks from date to week1.
    return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7)
}

// Returns the four-digit year corresponding to the ISO week of the date.
Date.prototype.getWeekYear = function () {
    const date = new Date(this.getTime())
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7)
    return date.getFullYear()
}