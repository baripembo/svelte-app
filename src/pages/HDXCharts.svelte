<script>
  import { curveBasis, csv, format, formatPrefix, group, max, select, timeFormat } from 'd3'
  import { scaleTime } from 'd3-scale'
  import { calcExtents, LayerCake, Html, Svg } from 'layercake'
  import { onMount } from 'svelte'
  import { tweened } from 'svelte/motion';
  import * as eases from 'svelte/easing';

  import AnnotationLine from '$components/AnnotationLine.svelte';  
  import AxisX from '$components/charts/AxisX.svelte';
  import AxisY from '$components/charts/AxisY.svelte';
  import Line from '$components/charts/Line.svelte';  

  const xKey = '#date';
  const yKey = '#users+unique';
  const userData = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSW4ZPCEPDOMjYc6usomqMI7uzW_LVb3WsBmzTB-qiAt0ZhCtzEWYaPCY8BLD4gAmB6BnmeJ33Fwo3K/pub?gid=0&single=true&output=csv';
  
  const tweenOptions = {
    duration: 500,
    easing: eases.cubicInOut
  };
  const xDomain = tweened(undefined, tweenOptions);
  const yDomain = tweened(undefined, tweenOptions);
  const extentGetters = {
    x: d => d[xKey],
    y: d => d[yKey]
  };

  let hdxData = [];
  let origHdxData = [];
  let dates = [];
  let userMax = 0;
  $: fromDateValue = '';
  $: toDateValue = '';

  // $: {
  //   console.log(`user max is ${userMax}`)
  // }

  //date the centre opened
  const centreDate = new Date(2017, 7, 1);


  onMount(async () => {
    hdxData = await csv(userData, function(data) {
      data['#month'] = data[xKey]; //save copy of original date format
      let d = data[xKey].split('-');
      data[xKey] = new Date(d[1], getMonthFromString(d[0]));
      data[yKey] = +parseFloat(data[yKey].replace(/,/g, ''));
      return data;
    }).then((data) => {
      return data;
    });
    //save original copy of data
    origHdxData = hdxData;

    //get range of years in data
    dates = [...new Set(hdxData.map(d => d[xKey]))];

    //set date range
    $: fromDateValue = dates[0]
    $: toDateValue = dates[dates.length-1]

    //calculate max user value and round up
    userMax = roundUp(max(hdxData, d => d[yKey]));
  });

  const extents = calcExtents(hdxData, extentGetters);
  $: xDomain.set(extents.x);
  $: yDomain.set([0, userMax]);


  function getMonthFromString(month) {
    var d = Date.parse(month + '1, 2012');
    if (!isNaN(d)) {
      return new Date(d).getMonth();
    }
    return -1;
  }

  function getMonth(m) {
    var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return months[m];
  }

  function roundUp(num) {
    let p = Math.pow(10, num.toString().length-1);
    return Math.ceil(num / p) * p;
  }

  function handleDateSelect(e) {
    let selectedDate = new Date(e.target.value);
    hdxData = origHdxData.filter(function(d) {
      if (e.target.id=='fromDate') {
        if (d[xKey].getTime() > selectedDate.getTime())
          return d;
      }
      else {
        if (d[xKey].getTime() < selectedDate.getTime())
          return d;
      }
    })

    $: userMax = roundUp(max(hdxData, d => d[yKey]));
  }

  function checkDateRange(date) {
    return (date.getTime() >= new Date(fromDateValue).getTime() && date.getTime() <= new Date(toDateValue).getTime());
  }
</script>

<label for='from-date'>From date:</label>
<select name='from-date' id='fromDate' bind:value={fromDateValue} on:change='{handleDateSelect}'>
  {#each dates as date}
    {#if (new Date(date).getTime() < new Date(toDateValue).getTime()) }
      <option value={date} selected>{getMonth(date.getMonth())} {date.getFullYear()}</option>
    {/if}
  {/each}
</select>

<label for='to-date'>To date:</label>
<select name='from-date' id='toDate' bind:value={toDateValue} on:change='{handleDateSelect}'>
  {#each dates as date}
    {#if (new Date(date).getTime() > new Date(fromDateValue).getTime()) }
      <option value={date} selected>{getMonth(date.getMonth())} {date.getFullYear()}</option>
    {/if}
  {/each}
</select>

<h3>Unique Users on HDX</h3>
<div class='chart-container'>
  <LayerCake
    padding={{ top: 8, right: 0, bottom: 20, left: 25 }}
    data={hdxData}
    x={extentGetters.x}
    y={extentGetters.y}
    xScale={ scaleTime() }
    xDomain={$xDomain}
    yDomain={$yDomain}
  >
    <Svg>
      <AxisX
        baseline={true}
        formatTick={timeFormat('%b %Y')}
        gridlines={false}
        snapTicks={true}
      />
      <AxisY
        formatTick={format('.2s')}
      />
      <Line stroke='#1EBFB3' curve={curveBasis} />
      <!-- {#if checkDateRange(centreDate)} -->
      {#if (centreDate.getTime() > new Date(fromDateValue).getTime() && centreDate.getTime() < new Date(toDateValue).getTime()) }
        <AnnotationLine text={'The Centre for Humanitarian Data opens'} myX={centreDate} height={300} stroke='#F2645A' />
      {/if}
    </Svg>
  </LayerCake>
</div>

<div class='description'>
  <p>This chart shows unique user growth on HDX by month over time. The available date range can be adjusted from January 2014 to present.</p>
  <a href='https://docs.google.com/spreadsheets/d/19fWDh6UU0ErS-Ex_IvLCsJqR0voNCpxzVLALhJLSjSQ/edit?pli=1#gid=0' target='_blank'>DATA</a>
</div>

<style>
</style>