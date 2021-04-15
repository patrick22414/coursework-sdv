let dataPromise = d3.tsv("datasets/Nextstrain/nextstrain_groups_neherlab_ncov_united-kingdom_metadata.tsv")

let rawData

let allClades
let dateRange
let allMonths
let allWeeks

dataPromise = dataPromise.then(data => {
    rawData = data.map(d => ({
        date: new Date(d["Collection Data"]),
        clade: d["Clade"],
    }))
        .sort((a, b) => a.date - b.date)

    allClades = Array.from(new Set(rawData.map(d => d.clade)))

    dateRange = d3.extent(rawData, d => d.date)

    const allDays = getEveryDayBetween(...dateRange)
    allMonths = Array.from(new Set(allDays.map(dt => dt.toYearMonthString())))
    allWeeks = Array.from(new Set(allDays.map(dt => dt.toYearWeekString())))
})

let monthlyData
let weeklyData

dataPromise = dataPromise.then(() => {
    monthlyData = rawData.map(d => ({
        ...d,
        date: d.date.toYearMonthString(),
    }))

    weeklyData = rawData.map(d => ({
        ...d,
        date: d.date.toYearWeekString(),
    }))
})

let stackedMonthlyData
let stackedWeeklyData

dataPromise = dataPromise.then(() => {
    const groupFn = data => d3.rollups(data, v => v.length, d => d.date, d => d.clade)
        .map(d => {
            const arr = Array(d[1].length)

            d[1] = d3.sort(d[1], dd => allClades.indexOf(dd[0]))

            let baseline = 0
            for (const [i, dd] of d[1].entries()) {
                arr[i] = {
                    date: d[0],
                    clade: dd[0],
                    height: dd[1],
                    baseline: baseline,
                }

                baseline += dd[1]
            }

            return arr
        })

    stackedMonthlyData = groupFn(monthlyData)
    stackedWeeklyData = groupFn(weeklyData)
})
