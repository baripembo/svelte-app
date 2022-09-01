<script>
  import { csv, flatGroup, format, group, max, timeFormat } from 'd3'
  import { scaleTime } from 'd3-scale'
  import { calcExtents, LayerCake, Html, Svg } from 'layercake'
  import { onMount, setContext } from 'svelte'

  import AxisX from '$components/charts/AxisX.svelte';
  import AxisY from '$components/charts/AxisY.svelte';
  import Line from '$components/charts/Line.svelte';


  let rowcaData = [];
  let countryData = [];
  let fullExtents;

  const extentGetters = {
    x: d => d['#date'],
    y: d => d['#users']
  };


  const dataURL = 'https://proxy.hxlstandard.org/data.csv?tagger-match-all=on&tagger-01-header=date&tagger-01-tag=%23date&tagger-02-header=countryname&tagger-02-tag=%23country%2Bname&tagger-03-header=countryname_fr&tagger-03-tag=%23country%2Bname%2Bfr&tagger-04-header=countrycode&tagger-04-tag=%23country%2Bcode&tagger-05-header=uniqueusers&tagger-05-tag=%23users&url=https%3A%2F%2Fdocs.google.com%2Fspreadsheets%2Fd%2Fe%2F2PACX-1vR8h_9uY_SCu9FTZr6Mq5htrUAF7eWXdme-rUsVbWgX9cF2hTvkmrWTisMmKoDAR462SJbDh9FIzwSf%2Fpub%3Fgid%3D1856284668%26single%3Dtrue%26output%3Dcsv&dest=data_view&header-row=1&strip-headers=on';

  onMount(async () => {
    rowcaData = await csv(dataURL, function(data) {
      data['#users'] = +data['#users'];
      data['#date'] = new Date(data['#date']);
      return data;
    }).then((data) => {
      return data;
    });

    //calculate scale for all small multiples
    fullExtents = calcExtents(rowcaData, extentGetters);

  $: console.log(fullExtents)
    //group data by country
    countryData = [...group(rowcaData, d => d['#country+name+fr'])];

    //find max val by country
    countryData.forEach(function(country) {
      country.push(max(country[1], d => d['#users']))
    });

    //sort by high to low val//sort by high to low val
    countryData.sort((a, b) => {
      return b[2] - a[2];
    });
  });
</script>



<h3>User Growth in ROWCA Countries (2016 – 2022)</h3>
<div class='group-chart-container'>
  {#each countryData as country}
    <div class='multiples-chart-container'>
      <LayerCake
        padding={{ top: 30, right: 20, bottom: 0, left: 20 }}
        data={ country[1] }
        x='#date'
        y='#users'
        xScale={ scaleTime() }
        yDomain={fullExtents.y}
      >
        <Html>
          <div class='chart-header'>
            <img class='icon-flag' src='./images/flags/{country[1][0]["#country+code"]}.png' />
            <div class='chart-title'>
              <h5>{country[0]}</h5>
            </div>
          </div>
        </Html>
        <Svg>
          <AxisX
            baseline={true}
            formatTick={timeFormat('%Y')}
            gridlines={false}
            snapTicks={true}
            ticks={fullExtents.x}
          />
          <AxisY
            formatTick={format('.2s')}
            ticks={fullExtents.y}
          />
          <Line stroke='#1EBFB3' />
        </Svg>
      </LayerCake>
    </div>
  {/each}
</div>


<style>
</style>
