const width = 920, height = 450
const margin = {
    top: 10,
    bottom: 40,
    left: 100,
    right: 20,
}

const svg = d3.select("svg#circle-chart")
    .attr("viewBox", [0, 0, width, height])
    .attr("width", width)

const svgBarChart = d3.select("svg#bar-chart")

const colorScale = d3.scaleOrdinal(d3.schemeSet3.map(d3.color))

function drawCircles(byMonth = true) {
    const groupedData = d3.group(byMonth ? monthlyData : weeklyData, d => d.date, d => d.clade)
    const circlesData = Array()
    for (const [date, innerMap] of groupedData) {
        for (const [clade, arr] of innerMap) {
            circlesData.push({
                date,
                clade,
                count: arr.length,
            })
        }
    }

    const xScale = d3.scalePoint()
        .domain(byMonth ? allMonths : allWeeks)
        .range([margin.left, width - margin.right])
        .padding(0.5)

    const yScale = d3.scalePoint()
        .domain(allClades)
        .range([margin.top, height - margin.bottom])
        .padding(0.5)

    // V grid lines
    svg.append("g").classed("v-grid", true)
        .selectAll("line")
        .data(byMonth ? allMonths : allWeeks)
        .enter()
        .append("line")
        .attr("x1", d => xScale(d))
        .attr("x2", d => xScale(d))
        .attr("y1", margin.top)
        .attr("y2", height - margin.bottom)
        .attr("stroke", "lightgray")

    // H grid lines
    svg.append("g").classed("h-grid", true)
        .selectAll("line")
        .data(allClades)
        .enter()
        .append("line")
        .attr("x1", margin.left)
        .attr("x2", width - margin.right)
        .attr("y1", d => yScale(d))
        .attr("y2", d => yScale(d))
        .attr("stroke", "lightgray")

    // X axis
    svg.append("g").classed("x-axis", true)
        .attr("transform", `translate(0, ${height - margin.bottom})`)
        .call(
            byMonth ?
                d3.axisBottom(xScale) :
                d3.axisBottom(xScale).tickValues(allWeeks.filter((_, i) => i % 5 === 0)),
        )

    // Y axis
    svg.append("g").classed("y-axis", true)
        .attr("transform", `translate(${margin.left}, 0)`)
        .call(d3.axisLeft(yScale))

    // All circles
    svg.append("g").classed("circles", true)
        .selectAll("circle")
        .data(circlesData)
        .enter()
        .append("circle")
        .attr("cx", d => xScale(d.date))
        .attr("cy", d => yScale(d.clade))
        .attr("r", 0)
        .attr("fill", d => colorScale(d.clade))
        .attr("stroke", d => colorScale(d.clade).darker())
        .transition().duration(1000)
        .attr("r", d => Math.sqrt(d.count) * 1.75 + 2)

    svg.selectAll("circle")
        .on("mouseover", function (e, {date, clade, count}) {
            svgBarChart.selectAll("rect.bar-block")
                .filter(d => d.date === date && d.clade === clade)
                .attr("stroke-width", 4)

            d3.select("strong#date").text(date)
            d3.select("strong#clade").text(clade)
            d3.select("strong#count").text(count)
        })
        .on("mouseout", function () {
            svgBarChart.selectAll("rect.bar-block")
                .attr("stroke-width", null)
        })
}

dataPromise.then(drawCircles)

import {drawBars} from "./vis-bars.js"

d3.select("button#by-month").on("click", function () {
    svg.selectAll("g").remove()
    svgBarChart.selectAll("g").remove()

    drawCircles(true)
    drawBars(true)
})

d3.select("button#by-week").on("click", function () {
    svg.selectAll("g").remove()
    svgBarChart.selectAll("g").remove()

    drawCircles(false)
    drawBars(false)
})
