const width = 680, height = 480
const innerRadius = 140, outerRadius = 180

const svg = d3.select("svg#pie-chart")
    .attr("viewBox", [0, 0, width, height])
    .attr("width", width)
    .style("background", "#ffffff")

const pie = d3.pie()
    .value(d => d.count)
    .padAngle(0.01)

const arc = d3.arc()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius)
    .cornerRadius(5)

const colorScale = d3.scaleOrdinal(d3.schemeSet3)

dataPromise.then(() => {
    const cladeCounts = d3.groups(rawData, d => d.clade).map(d => ({clade: d[0], count: d[1].length}))

    const pieData = pie(cladeCounts)
    const allClades = d3.sort(pieData, d => d.index).map(d => d.data.clade)

    const arcPaths = svg.append("g")
        .attr("transform", `translate(${width / 2 - 100}, ${height / 2})`)
        .selectAll("path")
        .data(pieData)
        .enter()
        .append("path")
        .attr("d", arc)
        .attr("fill", d => colorScale(d.data.clade))

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

            arcPaths.filter(d => d.data.clade === clade)
                .attr("stroke", "#282828")
                .attr("stroke-width", 1.5)
                .attr("stroke-linejoin", "round")
        })
        .on("mouseout", function (e, clade) {
            d3.select(this)
                .select("rect.legend")
                .attr("stroke", "none")

            arcPaths.attr("stroke", "none")
        })

    legendGroups.append("rect").attr("class", "legend")
        .attr("x", 480)
        .attr("y", (d, i) => 64 + i * 22)
        .attr("rx", 2)
        .attr("width", 16)
        .attr("height", 16)
        .attr("fill", d => colorScale(d))

    legendGroups.append("text").attr("class", "legend")
        .attr("x", 500)
        .attr("y", (d, i) => 64 + 11 + i * 22)
        .text(d => d)
})