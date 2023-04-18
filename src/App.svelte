<script>
  import HDXCharts from './pages/HDXCharts.svelte';
  import HDXHRPCharts from './pages/HDXHRPCharts.svelte';
  import HRPCharts from './pages/HRPCharts.svelte';
  import OCHACharts from './pages/OCHACharts.svelte';
  import ROWCACharts from './pages/ROWCACharts.svelte';
</script>

<main>
  <h2>Centre in Numbers</h2>
  <HDXCharts />
  <hr>
  <HDXHRPCharts />
  <hr>
  <HRPCharts />
  <hr>
  <OCHACharts />
  <hr>
  <ROWCACharts />
</main>

<style>
  hr {
    margin: 50px 0;
  }
</style>