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
  let perComplete = [];
  let fullExtents;

  const extentGetters = {
    x: d => d['#date'],
    y: d => d['#users']
  };

  //data complete percentage from data grids
  const perCompleteData = 'https://proxy.hxlstandard.org/data.csv?dest=data_edit&strip-headers=on&tagger-match-all=on&tagger-01-header=date&tagger-01-tag=%23date&tagger-02-header=iso3&tagger-02-tag=%23iso&tagger-03-header=location&tagger-03-tag=%23location&tagger-04-header=percentage+data+complete&tagger-04-tag=%23pct%2Bcomplete&tagger-05-header=percentage+data+incomplete&tagger-05-tag=%23pct%2Bincomplete&tagger-06-header=percentage+no+data&tagger-06-tag=%23pct%2Bnodata&header-row=1&url=https%3A%2F%2Fdocs.google.com%2Fspreadsheets%2Fd%2F1KJ4U6rc0ROWzpfHnaSlpRijF-t8T0Ze4Pq2sBjAqKrc%2Fedit%3Fpli%3D1%23gid%3D579688831';

  const dataURL = 'https://proxy.hxlstandard.org/data.csv?tagger-match-all=on&tagger-01-header=date&tagger-01-tag=%23date&tagger-02-header=countryname&tagger-02-tag=%23country%2Bname&tagger-03-header=countryname_fr&tagger-03-tag=%23country%2Bname%2Bfr&tagger-04-header=countrycode&tagger-04-tag=%23country%2Bcode&tagger-05-header=uniqueusers&tagger-05-tag=%23users&url=https%3A%2F%2Fdocs.google.com%2Fspreadsheets%2Fd%2Fe%2F2PACX-1vR8h_9uY_SCu9FTZr6Mq5htrUAF7eWXdme-rUsVbWgX9cF2hTvkmrWTisMmKoDAR462SJbDh9FIzwSf%2Fpub%3Fgid%3D1856284668%26single%3Dtrue%26output%3Dcsv&dest=data_view&header-row=1&strip-headers=on';

  onMount(async () => {
    rowcaData = await csv(dataURL, function(data) {
      data['#users'] = +data['#users'];
      data['#date'] = new Date(data['#date']);
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
    fullExtents = calcExtents(rowcaData, extentGetters);

    //group data by country
    countryData = [...group(rowcaData, d => d['#country+name+fr'])];

    //find max val by country
    countryData.forEach(function(country) {
      let c = perComplete.get(country[1][0]['#country+name']);
      let per = (c !== undefined) ? c[0]['#pct+complete'] : 0;
      country.push(max(country[1], d => d['#users']))
      country.push(+per);
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
              <p><b>{format('.0%')(country[3])}</b> Data Complete</p>
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

<div class='description'>
  <p>These small multiples show HDX user growth in ROWCA countries over time as well as each country's data grid data complete percentage.</p>
  <a href='https://docs.google.com/spreadsheets/d/1ZPraPwIDh3UwqpZ2ci7Uawwv7ahcya1Y0dmW9KzF4mk/edit#gid=1204537761' target='_blank'>DATA</a>
</div>


<style>
  a {
    color: #007CE0;
    font-weight: 700;
    text-decoration: underline;
  }
  p {
    font-size: 0.9rem;
    margin-bottom: 5px;
  }
</style>
