<script>
  import HDXCharts from './pages/HDXCharts.svelte';
  import HDXCharts2 from './pages/HDXCharts2.svelte';
  import HDXHRPCharts from './pages/HDXHRPCharts.svelte';
  import HRPCharts from './pages/HRPCharts.svelte';
  import HRPChartsNoEmbeds from './pages/HRPChartsNoEmbeds.svelte';
  import OCHACharts from './pages/OCHACharts.svelte';
  import ROWCACharts from './pages/ROWCACharts.svelte';
  import Sankey from './pages/Sankey.svelte';
  import SODCharts from './pages/SODCharts.svelte';
  import SODTable from './pages/SODTable.svelte';
  import WFPCharts from './pages/WFPCharts.svelte';
</script>


<main>  
  <div class='header'>
    <h2>The Centre in Numbers</h2>
    <a href="https://centre.humdata.org">
      <img src='images/centreforHumdata_green_TransparentBG.png' alt='Centre for Humanitarian Data logo' />  
    </a>
  </div>

  <Sankey />
  <hr>
  <SODCharts />
  <hr>
  <SODTable />
  <hr>
  <HDXCharts />
  <hr>
  <HDXCharts2 />
  <hr>
  <HDXHRPCharts />
<!--   <hr>
  <WFPCharts /> -->
  <hr>
  <HRPCharts />
  <hr>
  <HRPChartsNoEmbeds />
<!--   <hr>
  <HRPCharts simple={true} stroke={'#007CE0'} limit={4} width={'50%'} />
  <hr>
  <HRPCharts simple={true} stroke={'#007CE0'} limit={6} width={'33%'} /> -->
  <hr>
  <OCHACharts />
  <hr>
  <ROWCACharts />
</main>

<style>
  hr {
    margin: 50px 0;
  }
  .header {
    display: flex;    
    flex-flow: row;
    justify-content: space-between;
  }
  .header img {
    width: 200px;
  }
</style>