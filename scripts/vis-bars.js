const width = 920, height = 430
const margin = {
    top: 20,
    bottom: 10,
    left: 100,
    right: 20,
}

const svg = d3.select("svg#bar-chart")
    .attr("viewBox", [0, 0, width, height])
    .attr("width", width)

const svgCircleChart = d3.select("svg#circle-chart")

const colorScale = d3.scaleOrdinal(d3.schemeSet3.map(d3.color))

function drawBars(byMonth = true) {
    const groupedData = d3.group(byMonth ? monthlyData : weeklyData, d => d.date, d => d.clade)
    const barsData = []
    for (const [date, innerMap] of groupedData) {
        let barData = []
        let baseline = 0

        let innerArr = Array.from(innerMap, ([k, v]) => [k, v.length])
        innerArr = d3.sort(innerArr, a => allClades.indexOf(a[0]))

        for (const [clade, count] of innerArr) {
            barData.push({
                date,
                clade,
                count,
                baseline,
            })

            baseline += count
        }

        barsData.push(barData)
    }

    const xScale = d3.scaleBand()
        .domain(byMonth ? allMonths : allWeeks)
        .range([margin.left, width - margin.right])
        .paddingInner(0.4)
        .paddingOuter(0.2)

    const yScale = d3.scaleLinear()
        .domain([0, byMonth ? 300 : 220])
        .range([height - margin.bottom, margin.top])

    const hScale = d3.scaleLinear()
        .domain([0, byMonth ? 300 : 220])
        .range([0, height - margin.bottom - margin.top])

    // V grid lines
    svg.append("g").classed("v-grid", true)
        .selectAll("line")
        .data(byMonth ? allMonths : allWeeks)
        .enter()
        .append("line")
        .attr("x1", d => xScale(d) + xScale.bandwidth() / 2)
        .attr("x2", d => xScale(d) + xScale.bandwidth() / 2)
        .attr("y1", margin.top)
        .attr("y2", height - margin.bottom)
        .attr("stroke", "lightgray")

    // Y axis
    svg.append("g").classed("y-axis", true)
        .attr("transform", `translate(${margin.left}, 0)`)
        .call(d3.axisLeft(yScale))

    // Bars
    svg.selectAll("g.bar")
        .data(barsData)
        .enter()
        .append("g").classed("bar", true)
        .selectAll("rect.bar-block")
        .data(d => d)
        .enter()
        .append("rect").classed("bar-block", true)
        .attr("x", d => xScale(d.date))
        .attr("y", height - margin.bottom)
        .attr("width", xScale.bandwidth())
        .attr("height", 0)
        .attr("fill", d => colorScale(d.clade))
        .attr("stroke", d => colorScale(d.clade).darker())
        .transition().duration(1000)
        .attr("y", (d, i) => yScale(d.baseline) - hScale(d.count) - i * 3)
        .attr("height", d => hScale(d.count))

    svg.selectAll("rect.bar-block")
        .on("mouseover", function (e, {date, clade, count}) {
            svgCircleChart.selectAll("circle")
                .filter(d => d.date === date && d.clade === clade)
                .attr("stroke-width", 4)

            d3.select("strong#date").text(date)
            d3.select("strong#clade").text(clade)
            d3.select("strong#count").text(count)
        })
        .on("mouseout", function () {
            svgCircleChart.selectAll("circle")
                .attr("stroke-width", "unset")
        })
}

dataPromise.then(drawBars)

export {drawBars}