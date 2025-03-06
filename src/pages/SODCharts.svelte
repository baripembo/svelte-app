<script>
  import { onMount } from 'svelte';
  import * as d3 from 'd3';

  let data = [
    {name: "Food Prices", value: -0.28},
    {name: "Food Security", value: -0.25},
    {name: "Internally-Displaced Persons", value: -0.19},
    {name: "Impact", value: 0.16},
    {name: "Populated Places", value: 0.26},
    {name: "Roads", value: 0.43},
    {name: "Education Facilities", value: 0.73},
    {name: "Health Facilities", value: 0.73}
  ];

  let width = 800;
  let margin = {top: 30, right: 60, bottom: 10, left: 100};
  let barHeight = 25;
  let computedHeight = Math.ceil((data.length + 0.1) * barHeight) + margin.top + margin.bottom;
  let format = d3.format(".0%"); // Format percentage
  let tickFormat = format;

  // Update scales to use the computedHeight
  let x = d3.scaleLinear()
    .domain([-0.8, 0.8])
    .rangeRound([margin.left, width - margin.right]);

  // Use scaleBand so we can use y.bandwidth()
  let y = d3.scaleBand()
    .domain(d3.range(data.length))
    .rangeRound([margin.top, computedHeight - margin.bottom])
    .padding(0.1);

  // Define the axes
  let xAxis = g => g
    .attr("transform", `translate(0,${margin.top})`)
    .call(d3.axisTop(x).ticks(width / 80).tickFormat(tickFormat))
    .call(g => g.select(".domain").remove());

  let yAxis = g => g
    .attr("transform", `translate(${x(0)},0)`)
    .call(d3.axisLeft(y)
      .tickFormat(i => data[i].name)
      .tickSize(0)
      .tickPadding(6))
    .call(g => g.selectAll(".tick text")
      .filter(i => data[i].value < 0)
      .attr("text-anchor", "start")
      .attr("x", 6));

  onMount(() => {
    // Create and append the chart using the computed height
    createChart({
      containerId: "sod-chart-container",
      width: width,
      height: computedHeight,
      data: data,
      x: x,
      y: y,
      xAxis: xAxis,
      yAxis: yAxis,
      format: format
    });
  });

  // Revised createChart function
  function createChart({ containerId, width, height, data, x, y, xAxis, yAxis, format }) {
    const svg = d3.create("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`);

    // Draw the lines
    svg.append("g")
      .attr("stroke", "#888")
      .attr("stroke-width", 1)
      .selectAll("line")
      .data(data)
      .join("line")
        .attr("x1", x(0))
        .attr("x2", d => x(d.value))
        .attr("y1", (d, i) => y(i) + y.bandwidth() / 2)
        .attr("y2", (d, i) => y(i) + y.bandwidth() / 2);

    // Add the x-axis
    svg.append("g")
      .call(xAxis);

    // Add the y-axis
    svg.append("g")
      .call(yAxis);

    // Draw the circles
    svg.append("g")
      .selectAll("circle")
      .data(data)
      .join("circle")
        .attr("fill", d => d.value >= 0 ? "#B7E1CD" : "#FF9902")
        .attr("cx", d => x(d.value))
        .attr("cy", (d, i) => y(i) + y.bandwidth() / 2)
        .attr("r", 6);

    // Add the text labels
    svg.append("g")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .selectAll("text")
      .data(data)
      .join("text")
        .attr("text-anchor", d => d.value < 0 ? "end" : "start")
        .attr("x", d => (d.value == 0) ? x(d.value) + 8 : x(d.value) + Math.sign(d.value) * 8)
        .attr("y", (d, i) => y(i) + y.bandwidth() / 2)
        .attr("dy", "0.35em")
        .text(d => format(d.value));

    // Append the generated SVG to the specified div.
    const container = document.getElementById(containerId);
    if (container) {
      container.appendChild(svg.node());
    } else {
      console.error(`Container with id "${containerId}" not found.`);
    }

    return svg.node();
  }
</script>


<h3>Percent change in Available and Up-to-date data by sub-category (2023-2024)</h3>
<div id="sod-chart-container"></div>


<style>
</style>