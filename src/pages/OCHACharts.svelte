<script>
  import { csv, flatGroup, format, max, timeFormat } from 'd3'
  import { scaleTime } from 'd3-scale'
  import { calcExtents, LayerCake, Html, Svg } from 'layercake'
  import { onMount, setContext } from 'svelte'

  import AxisX from '$components/charts/AxisX.svelte';
  import AxisY from '$components/charts/AxisY.svelte';
  import Line from '$components/charts/Line.svelte';


  let ochaData = [];
  let ochaContent = [];
  let serviceData = [];
  let serviceContent = [];
  let fullExtents, fullContentExtents;

  const dataURL = 'https://proxy.hxlstandard.org/data.csv?dest=data_edit&strip-headers=on&force=on&tagger-match-all=on&tagger-05-header=service+name+and+url&tagger-05-tag=%23service%2Bname&tagger-06-header=date+(mm%2Fdd%2Fyyyy)&tagger-06-tag=%23date&tagger-08-header=users&tagger-08-tag=%23users&tagger-17-header=url&tagger-17-tag=%23url&header-row=1&url=https%3A%2F%2Fdocs.google.com%2Fspreadsheets%2Fd%2Fe%2F2PACX-1vR8h_9uY_SCu9FTZr6Mq5htrUAF7eWXdme-rUsVbWgX9cF2hTvkmrWTisMmKoDAR462SJbDh9FIzwSf%2Fpub%3Fgid%3D1837949461%26single%3Dtrue%26output%3Dcsv';


  const contentURL = 'https://proxy.hxlstandard.org/data.csv?dest=data_edit&strip-headers=on&force=on&tagger-match-all=on&tagger-05-header=service+name+and+url&tagger-05-tag=%23service%2Bname&tagger-06-header=date+(mm%2Fdd%2Fyyyy)&tagger-06-tag=%23date&tagger-08-header=users&tagger-08-tag=%23users&tagger-17-header=url&tagger-17-tag=%23url&header-row=1&url=https%3A%2F%2Fdocs.google.com%2Fspreadsheets%2Fd%2Fe%2F2PACX-1vR8h_9uY_SCu9FTZr6Mq5htrUAF7eWXdme-rUsVbWgX9cF2hTvkmrWTisMmKoDAR462SJbDh9FIzwSf%2Fpub%3Fgid%3D1204537761%26single%3Dtrue%26output%3Dcsv';

  const extentGetters = {
    x: d => d['#date'],
    y: d => d['#users']
  };

  onMount(async () => {
    //data sites
    ochaData = await csv(dataURL, function(data) {
      data['#users'] = +data['#users'];
      data['#date'] = new Date(data['#date']);
      return data;
    }).then((data) => {
      return data;
    });

    //calculate scale for all small multiples
    fullExtents = calcExtents(ochaData, extentGetters);

    //group data by service
    serviceData = flatGroup(ochaData, d => d['#service+name']);
    
    //find max val by service
    serviceData.forEach(function(service) {
      service.push(max(service[1], d => d['#users']))
    });
    
    //find max val by service
    serviceData.forEach(function(service) {
      service.push(max(service[1], d => d['#users']))
    });

    //sort by high to low val
    serviceData.sort((a, b) => b[2] - a[2]);


    //content sites
    ochaContent = await csv(contentURL, function(data) {
      data['#users'] = +data['#users'].replace(/,/g, '');
      data['#date'] = new Date(data['#date']);
      return data;
    }).then((data) => {
      return data;
    });

    //calculate scale for all small multiples
    fullContentExtents = calcExtents(ochaContent, extentGetters);
    
    //group data by service
    serviceContent = flatGroup(ochaContent, d => d['#service+name']);
    
    //find max val by service
    serviceContent.forEach(function(service) {
      service.push(max(service[1], d => d['#users']))
    });
    
    //sort by high to low val
    serviceContent.sort((a, b) => b[2] - a[2]);
  });

  function stripURL(url) {
    return url.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "").split('/')[0]
  }
</script>


<h3>User Growth in OCHA Platforms (2018 – 2022)</h3>
<div class='group-chart-container'>
  <h4>Data Sites</h4>
  {#each serviceData as service}
    <div class='multiples-chart-container'>
      <LayerCake
        padding={{ top: 30, right: 20, bottom: 0, left: 20 }}
        data={ service[1] }
        x='#date'
        y='#users'
        xScale={ scaleTime() }
        yDomain={fullExtents.y}
      >
        <Html>
          <div class='chart-header'>
            <h5>{service[0]}</h5>
            <p><a href='service[1][0]["#url"]' target='_blank'>{stripURL(service[1][0]['#url'])}</a></p>
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

  <h4>Content Sites</h4>
  {#each serviceContent as service}
    <div class='multiples-chart-container'>
      <LayerCake
        padding={{ top: 30, right: 20, bottom: 0, left: 20 }}
        data={ service[1] }
        x='#date'
        y='#users'
        xScale={ scaleTime() }
        yDomain={fullExtents.y}
      >
        <Html>
          <div class='chart-header'>
            <h5>{service[0]}</h5>
            <p><a href='service[1][0]["#url"]' target='_blank'>{stripURL(service[1][0]['#url'])}</a></p>
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
  <p>These small multiples show user growth across select OCHA platforms over time.</p>
  <a href='https://docs.google.com/spreadsheets/d/1ZPraPwIDh3UwqpZ2ci7Uawwv7ahcya1Y0dmW9KzF4mk/edit#gid=1204537761' target='_blank'>DATA</a>
</div>


<style>
  .chart-header {
    display: block;
    text-align: center;
  }
</style>
