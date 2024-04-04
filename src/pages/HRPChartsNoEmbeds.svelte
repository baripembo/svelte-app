<script>
  import { curveBasis, csv, format, group, max, timeFormat } from 'd3'
  import { scaleTime } from 'd3-scale'
  import { calcExtents, LayerCake, Html, Svg } from 'layercake'
  import { onMount, setContext } from 'svelte'

  import AxisX from '$components/charts/AxisX.svelte';
  import AxisY from '$components/charts/AxisY.svelte';
  import Line from '$components/charts/Line.svelte';  

  export let limit = 0;
  export let width = 20;
  export let simple = false;
  export let stroke = '#1EBFB3';

  let hrpData = [];
  let countryData = [];
  let perComplete = [];
  let dates = [];

  let fullExtents;

  const extentGetters = {
    x: d => d['#date'],
    y: d => d['#users+unique']
  };

  //data complete percentage from data grids
  const perCompleteData = 'https://proxy.hxlstandard.org/data.csv?dest=data_edit&force=on&strip-headers=on&tagger-match-all=on&tagger-01-header=date&tagger-01-tag=%23date&tagger-02-header=iso3&tagger-02-tag=%23iso&tagger-03-header=location&tagger-03-tag=%23location&tagger-04-header=percentage+data+complete&tagger-04-tag=%23pct%2Bcomplete&tagger-05-header=percentage+data+incomplete&tagger-05-tag=%23pct%2Bincomplete&tagger-06-header=percentage+no+data&tagger-06-tag=%23pct%2Bnodata&header-row=1&url=https%3A%2F%2Fdocs.google.com%2Fspreadsheets%2Fd%2F1KJ4U6rc0ROWzpfHnaSlpRijF-t8T0Ze4Pq2sBjAqKrc%2Fedit%3Fpli%3D1%23gid%3D579688831';

  //user growth data in hrp countries excluding central america
 const userData = 'https://proxy.hxlstandard.org/data.csv?dest=data_edit&strip-headers=on&force=on&tagger-match-all=on&tagger-01-header=date&tagger-01-tag=%23date&tagger-02-header=country&tagger-02-tag=%23country%2Bname&tagger-03-header=countrycode&tagger-03-tag=%23country%2Bcode&tagger-04-header=uniqueusers&tagger-04-tag=%23users%2Bunique&header-row=1&url=https://docs.google.com/spreadsheets/d/e/2PACX-1vR8h_9uY_SCu9FTZr6Mq5htrUAF7eWXdme-rUsVbWgX9cF2hTvkmrWTisMmKoDAR462SJbDh9FIzwSf/pub?gid%3D90569925%26single%3Dtrue%26output%3Dcsv'


  onMount(async () => {
    let lastDate = new Date();
    //small multiples data by PIN
    hrpData = await csv(userData, function(data) {
      if (data['#country+name']==='Palestine') data['#country+name'] = 'State of Palestine';
      if (data['#country+name']==='Congo') data['#country+name'] = 'Democratic Republic of the Congo';
      data['#users+unique'] = +data['#users+unique'];
      data['#date'] = new Date(data['#date']);

      //keep copy of unique dates
      if (data['#date'].getTime() != lastDate.getTime()) dates.push(data['#date']); 
      lastDate = data['#date'];
      return data;
    }).then((data) => {
      return data;
    });

    //small multiples data by PIN
    perComplete = await csv(perCompleteData, function(data) {
      if (data['#location']==='Venezuela (Bolivarian Republic of)') data['#location'] = 'Venezuela';
      return data;
    }).then((data) => {
      return group(data, d => d['#location']);
    });

    //calculate scale for all small multiples
    fullExtents = calcExtents(hrpData, extentGetters);

    //group data by country
    countryData = [...group(hrpData, d => d['#country+name'])];
    // console.log(countryData)
    

    countryData.forEach(function(country) {
      let c = perComplete.get(country[0]);
      let per = (c !== undefined) ? c[0]['#pct+complete'] : 0;
      country.push(max(country[1], d => d['#users+unique']));
      country.push(+per);
    });

    // //fill in empty dates
    // countryData.forEach(function(country) {
    //   const countryMap = new Map(country[1].map(c => [c.date, c]));
    //   console.log('countryMap',countryMap)
    //   // Iterate through the dates
    //   dates.forEach(date => {
    //     // Check if there is an item for the current date
    //     console.log('looking for ',date)
    //     if (!countryMap.has(date)) {
    //       // If not, create a new item for this date and add it to the map
    //       countryMap.set(date, { '#date': date, '#users+unique': 0 });
    //     }
    //   });
    //   //country[1] = Array.from(countryMap.values());
    // });

    // console.log(countryData)

    //sort by high to low val
    countryData.sort((a, b) => {
      return b[2] - a[2];
    });

    //if a max is set, slice the array
    if (limit>0) countryData = countryData.slice(0, limit);
  });
</script>


<h3>HDX User Growth in HRP Countries (no embeds) <span>2016 – 2024</span></h3>
<div class='group-chart-container' style='width:{simple ? "50%" : "100%"}'>
  {#each countryData as country}
    <div class='multiples-chart-container' style='width:{width}'>
      <LayerCake
        padding={{ top: 30, right: 20, bottom: 0, left: 20 }}
        data={ country[1] }
        x='#date'
        y='#users+unique'
        xScale={ scaleTime() }
        yDomain={fullExtents.y}
      >
        <Html>
          <div class='chart-header'>
            {#if !simple}
              <img class='icon-flag' src='./images/flags/{country[1][0]["#country+code"]}.png' />
            {/if}
            <div class='chart-title'>
              <h5>{country[0]}</h5>
              {#if !simple}
                <p><b>{format('.0%')(country[3])}</b> Data Complete</p>
              {/if}
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
          <Line stroke={stroke} curve={curveBasis} />
        </Svg>
      </LayerCake>
    </div>
  {/each}
</div>

<div class='description'>
  <p>These small multiples show HDX user growth in HRP countries over time as well as each country's data grid data complete percentage.</p>
  <a href='https://docs.google.com/spreadsheets/d/1ZPraPwIDh3UwqpZ2ci7Uawwv7ahcya1Y0dmW9KzF4mk/edit#gid=90569925' target='_blank'>DATA</a>
</div>


<style>
  .multiples-chart-container {
    width: 20%;
  }
</style>