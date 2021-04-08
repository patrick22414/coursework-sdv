const width = 680, height = 480
const margin = {
    top: 40,
    bottom: 40,
    left: 40,
    right: 40,
}

const svg = d3.select("svg#stacked-bar-chart")
    .attr("viewBox", [0, 0, width, height])
    .attr("width", width)
    .style("background", "#ffffff")
// .attr("width", 100)

const xScale = d3.scaleBand()
    .range([margin.left, width - margin.right])
    .padding(0.2)

const yScale = d3.scaleLinear()
    .domain([0, 100])
    .range([height - margin.bottom, margin.top])

const hScale = d3.scaleLinear()
    .range([0, height - margin.bottom - margin.top])

const xAxis = svg.append("g")
    .attr("transform", `translate(0, ${height - margin.bottom})`)
    .call(d3.axisBottom(xScale))

const yAxis = svg.append("g")
    .attr("transform", `translate(${margin.left}, 0)`)
    .call(d3.axisLeft(yScale))

// const timeScale = d3.scaleTime()
//     .domain([new Date("2019-12-15"), new Date("2021-02-18")])
//     .range([margin.left, width - margin.right])

// const timeAxis = svg.append("g")
//     .attr("transform", `translate(0, ${height - margin.bottom})`)
//     .call(d3.axisBottom(timeScale).ticks(5))

const colorScale = d3.scaleOrdinal(d3.schemeSet3)

const t1 = () => d3.transition().duration(750)

function visStackedBarsByMonth() {
    // Set domains
    xScale.domain(allMonths)

    const maxHeight = d3.max(stackedMonthlyData, d => d3.sum(d, d => d.height))
    yScale.domain([0, maxHeight]).nice()
    hScale.domain([0, maxHeight]).nice()

    yAxis.transition(t1()).call(d3.axisLeft(yScale))
    xAxis.transition(t1()).call(d3.axisBottom(xScale).tickValues(allMonths.filter((w, i) => i % 2 === 0)))

    svg.selectAll("g.bar")
        .data(stackedMonthlyData)
        .call(_drawStackedBars)
}

function visStackedBarsByWeek() {
    // Set domains
    xScale.domain(allWeeks)

    const maxHeight = d3.max(stackedWeeklyData, d => d3.sum(d, d => d.height))
    yScale.domain([0, maxHeight]).nice()
    hScale.domain([0, maxHeight]).nice()

    yAxis.transition(t1()).call(d3.axisLeft(yScale))
    xAxis.transition(t1()).call(d3.axisBottom(xScale).tickValues(allWeeks.filter((w, i) => i % 7 === 3)))

    svg.selectAll("g.bar")
        .data(stackedWeeklyData)
        .call(_drawStackedBars)
}

function _drawStackedBars(bars) {
    bars.join(
        enter => enter.append("g").attr("class", "bar"),
        update => update,
        exit => exit.remove(),
    )
        .selectAll("rect.bar-block")
        .data([])
        .join()
        .data(d => d)
        .enter()
        .append("rect").attr("class", "bar-block")
        .attr("x", d => xScale(d.date))
        .attr("width", xScale.bandwidth())
        .attr("fill", d => colorScale(d.clade))
        .attr("y", yScale(0))
        .attr("height", 0)
        .transition(t1())
        .attr("y", d => yScale(d.baseline) - hScale(d.height))
        .attr("height", d => hScale(d.height))

        // .append("text").attr("class", "bar-block")
        // .text(d => d.height)

    d3.selectAll("g.bar")
        .on("mouseover", function (e, d) {
            svg.append("text").attr("class", "hovertext")
                .text(d[0].date)
                .attr("x", e.pageX)
                .attr("y", e.pageY)
                .attr("text-anchor", "middle")
        })
        .on("mousemove", function (e, d) {
            svg.select("text.hovertext")
                .attr("x", e.pageX)
                .attr("y", e.pageY)
        })
        .on("mouseout", function (e, d) {
            svg.select("text.hovertext")
                .remove()
        })
}

// Initial drawings
dataPromise = dataPromise
    .then(() => {
        const legendGroups = svg.selectAll("g.legend")
            .data(allClades)
            .enter()
            .append("g").attr("class", "legend")
            .on("mouseover", function (e, clade) {
                d3.select(this)
                    .select("rect.legend")
                    .attr("stroke", "#282828")
                    .attr("stroke-width", 1.5)
                    .attr("stroke-linejoin", "round")

                d3.selectAll("rect.bar-block")
                    .filter(d => d.clade === clade)
                    .attr("stroke", "#282828")
                    .attr("stroke-width", 1.5)
                    .attr("stroke-linejoin", "round")
            })
            .on("mouseout", function (e, clade) {
                d3.select(this)
                    .select("rect.legend")
                    .attr("stroke", "none")

                d3.selectAll("rect.bar-block")
                    .attr("stroke", "none")
            })

        legendGroups.append("rect").attr("class", "legend")
            .attr("x", margin.left + 40)
            .attr("y", (d, i) => margin.top + i * 22)
            .attr("rx", 2)
            .attr("width", 16)
            .attr("height", 16)
            .attr("fill", d => colorScale(d))

        legendGroups.append("text").attr("class", "legend")
            .attr("x", margin.left + 60)
            .attr("y", (d, i) => margin.top + 11 + i * 22)
            .text(d => d)

    })
    .then(visStackedBarsByMonth)

d3.select("button#vis-stacked-bars-by-month")
    .on("click", visStackedBarsByMonth)

d3.select("button#vis-stacked-bars-by-week")
    .on("click", visStackedBarsByWeek)