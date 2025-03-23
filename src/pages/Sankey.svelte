<script>
  import { onMount } from "svelte";
  import * as d3 from "d3";
  import { sankey, sankeyLeft, sankeyLinkHorizontal } from "d3-sankey";

  const dataURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSW4ZPCEPDOMjYc6usomqMI7uzW_LVb3WsBmzTB-qiAt0ZhCtzEWYaPCY8BLD4gAmB6BnmeJ33Fwo3K/pub?gid=578104208&single=true&output=csv";

  // let data = {
  //   nodes: [
  //     {name: "World Bank Group", category: "World Bank Group"},
  //     {name: "HOT", category: "HOT"},
  //     {name: "Others", category: "Others"},
  //     {name: "WorldPop", category: "WorldPop"},
  //     {name: "UNHCR", category: "UNHCR"},
  //     {name: "Kontur", category: "Kontur"},
  //     {name: "FAO", category: "FAO"},
  //     {name: "WFP", category: "WFP"},
  //     {name: "IDMC", category: "IDMC"},
  //     {name: "Who's On First", category: "Who's On First"},
  //     {name: "UNESCO", category: "UNESCO"},
  //     {name: "API", category: "API"},
  //   ],
  //   links: [
  //     {source: "World Bank Group", target: "API", value: 4666},
  //     {source: "HOT", target: "API", value: 2585},
  //     {source: "Others", target: "API", value: 2611},
  //     {source: "WorldPop", target: "API", value: 1071},
  //     {source: "UNHCR", target: "API", value: 978},
  //     {source: "Kontur", target: "API", value: 496},
  //     {source: "FAO", target: "API", value: 440},
  //     {source: "WFP", target: "API", value: 433},
  //     {source: "IDMC", target: "API", value: 419},
  //     {source: "Who's On First", target: "API", value: 247},
  //     {source: "UNESCO", target: "API", value: 242}
  //   ]
  // }

  let container;

  const width = 900;
  const height = 500;  
  const format = d3.format(",");

  const titleHeight = 20;
  const titleYPos = 8;

  function processData(data) {
    // Sort data in descending order by value
    data.sort((a, b) => b["#value+num"] - a["#value+num"]);

    const nodeNames = new Set();
    const links = data.map(item => {
      // Collect source and target node names
      const source = item["#source+name"];
      const target = item["#target+name"];
      nodeNames.add(source);
      nodeNames.add(target);
      
      // Convert the value from string to number
      return {
        source,
        target,
        value: +item["#value+num"]
      };
    });

    // Create nodes array, using each name as its own category
    const nodes = Array.from(nodeNames).map(name => ({
      name,
      category: name
    }));

    return { nodes, links };
  }


  onMount(async () => {
    // Load data
    let sankeyData = await d3.csv(dataURL, function(data) {
      return data;
    }).then((data) => {
      return data;
    });

    // Process data
    let processedData = processData(sankeyData);

    // Clear any previous chart content
    container.innerHTML = "";

    // Create the SVG container
    const svg = d3.select(container)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto;");

    // Add a left-side label
    svg.append("text")
      .attr("x", 0)
      .attr("y", titleYPos)
      .append("tspan")
      .style("font-weight", "bold")
      .attr("text-anchor", "start")
      .attr("dominant-baseline", "middle")
      .text("Organization");


    // Add a right-side label
    svg.append("text")
      .attr("x", width)
      .attr("y", titleYPos)
      .append("tspan")
      .style("font-weight", "bold")
      .attr("text-anchor", "end")
      .attr("dominant-baseline", "middle")
      .text("Data on HDX");

    const sankeyGroup = svg.append("g")
      .attr("transform", `translate(0,${titleHeight})`);

    // Configure the Sankey generator
    const sankeyGenerator = sankey()
      .nodeId(d => d.name)
      .nodeAlign(sankeyLeft)
      .nodeWidth(10)
      .nodePadding(10)
      .extent([[1, 5], [width - 1, height - titleHeight - 5]]);

    // Copy data to avoid mutating the original
    const { nodes, links } = sankeyGenerator({
      nodes: processedData.nodes.map(d => Object.assign({}, d)),
      links: processedData.links.map(d => Object.assign({}, d))
    });

    // Define a color scale
    const color = d3.scaleOrdinal(d3.schemeDark2);

    // Create the nodes (rectangles)
    const rect = sankeyGroup.append("g")
      //.attr("stroke", "#000")
      .selectAll("rect")
      .data(nodes)
      .join("rect")
      .attr("x", d => d.x0)
      .attr("y", d => d.y0)
      .attr("height", d => d.y1 - d.y0)
      .attr("width", d => d.x1 - d.x0)
      .attr("fill", d => color(d.category));

    // Create the links group
    const link = sankeyGroup.append("g")
      .attr("fill", "none")
      .attr("stroke-opacity", 0.5)
      .selectAll("g")
      .data(links)
      .join("g")
      .style("mix-blend-mode", "multiply");

    // Create gradients
    const defs = sankeyGroup.append("defs");
    link.each(function(d) {
      // Generate a unique id for each gradient
      d.uid = `link-${Math.random().toString(36).substr(2, 9)}`;

      // Create a linear gradient for each link
      const gradient = defs.append("linearGradient")
        .attr("id", d.uid)
        .attr("gradientUnits", "userSpaceOnUse")
        .attr("x1", d.source.x1)
        .attr("x2", d.target.x0);

      gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", color(d.source.category));

      gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", color(d.target.category));
    });

    // Create the link paths.
    link.append("path")
      .attr("d", sankeyLinkHorizontal())
      .attr("stroke", d => `url(#${d.uid})`)
      .attr("stroke-width", d => Math.max(1, d.width));

    // Add titles to the links.
    link.append("title")
      .text(d => `${d.source.name} → ${d.target.name}\n${format(d.value)}`);

    // Add labels on the nodes.
    sankeyGroup.append("g")
      .selectAll("text")
      .data(nodes)
      .join("text")
      .attr("x", d => d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6)
      .attr("y", d => (d.y1 + d.y0) / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", d => d.x0 < width / 2 ? "start" : "end")
      .each(function(d) {
        // Append a tspan for the name
        d3.select(this)
          .append("tspan")
          .text(d.name + " ");

        // Append a tspan for the value and style it as bold
        d3.select(this)
          .append("tspan")
          .style("font-weight", "bold")
          .text(format(d.value));
      });
  });
</script>

<h3>Organizations Sharing Data via API on HDX</h3>
<!-- The container for the chart -->
<div bind:this={container}></div>
<br>
<a href='https://docs.google.com/spreadsheets/d/19fWDh6UU0ErS-Ex_IvLCsJqR0voNCpxzVLALhJLSjSQ/edit?pli=1&gid=578104208#gid=578104208' target='_blank'>DATA</a>
