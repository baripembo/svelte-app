<script>
  import { curveBasis, csv, format, group, max, timeFormat } from 'd3'
  import { scaleTime } from 'd3-scale'
  import { calcExtents, LayerCake, Html, Svg } from 'layercake'
  import { onMount, setContext } from 'svelte'

  import AxisX from '$components/charts/AxisX.svelte';
  import AxisY from '$components/charts/AxisY.svelte';
  import Line from '$components/charts/Line.svelte';  

  let hrpData = [];
  let countryData = [];
  let perComplete = [];
  let commodities = [];

  let fullExtents;

  const extentGetters = {
    x: d => d['Date'],
    y: d => d['Average Price']
  };

  const wfpData = '/aggregated_wfp_food_prices_ssd.csv';

  onMount(async () => {
    //small multiples data by PIN
    commodities = await csv(wfpData, function(data) {
      data['Commodity'] = `${data['Commodity']} per ${data['Unit']}`;
      data['Average Price'] = +data['Average Price'];
      data['Date'] = new Date(data['Date']);
      return data;
    }).then((data) => {
      return data;
    });

    //calculate scale for all small multiples
    fullExtents = calcExtents(commodities, extentGetters);

    //group data by commodity
    commodities = [...group(commodities, d => d['Commodity'])];
  });
</script>


<h3>South Sudan Food Prices (2006 – 2024)</h3>
<div class='group-chart-container'>
  {#each commodities as commodity}
  <div class='multiples-chart-container'>
      <LayerCake
        padding={{ top: 30, right: 20, bottom: 0, left: 20 }}
        data={ commodity[1] }
        x='Date'
        y='Average Price'
        xScale={ scaleTime() }
        yDomain={fullExtents.y}
      >
        <Html>
          <div class='chart-header'>
            <div class='chart-title'>
              <h5>{commodity[0]}</h5>
            </div>
          </div>
        </Html>
        <Svg>
<!--           <AxisX
            baseline={true}
            formatTick={timeFormat('%Y')}
            gridlines={false}
            snapTicks={true}
            ticks={fullExtents.x}
          /> -->
          <AxisY
            formatTick={format('.2s')}
            ticks={fullExtents.y}
          />
          <Line stroke='#1EBFB3' curve={curveBasis} />
        </Svg>
      </LayerCake>
    </div>
  {/each}
</div>

<!-- <div class='description'>
  <p>These small multiples show HDX user growth in HRP countries over time as well as each country's data grid data complete percentage.</p>
  <a href='https://docs.google.com/spreadsheets/d/19fWDh6UU0ErS-Ex_IvLCsJqR0voNCpxzVLALhJLSjSQ/edit?pli=1#gid=0' target='_blank'>DATA</a>
</div> -->


<style>
  .multiples-chart-container {
    width: 20%;
  }
</style>