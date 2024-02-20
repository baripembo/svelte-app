<script>
	import { getContext } from "svelte";
	import { line } from "d3";

	const { padding, xScale } = getContext("LayerCake");

	export let stroke = "#ccc";
	export let strokeWidth = 1;
	export let strokeDasharray = '4, 2';
	export let myX = 0;
	export let height = 250;
	export let text = 'label me';
	export let labelPosition = 'right';
	export let labelClass = 'label';
	export let allowWrapping = false;

	let offset = $padding.top + $padding.bottom;
</script>

<line
	x1={$xScale(myX)}
	y1={-offset}
	x2={$xScale(myX)}
	y2={height-offset}
	{stroke}
	stroke-width={strokeWidth}
	stroke-dasharray={strokeDasharray}
/>

{#if allowWrapping} 
	<foreignObject
		class={labelClass}
		x={labelPosition=='left' ? $xScale(myX)-105 : $xScale(myX)+5} 
		y={-(offset)} 
		width="100" 
		height="100"
	>
		<p xmlns="http://www.w3.org/1999/xhtml" 
			class={labelClass}>
		{text}
		</p>
	</foreignObject>
{:else}
	<text
		class={labelClass}
		x={labelPosition=='left' ? $xScale(myX)-5 : $xScale(myX)+5}
		y={-(offset)}
		dy={'1em'}
		fill={stroke}
	>
		{text}
	</text>
{/if}

<style>
	line {
		fill: none;
		stroke-linejoin: round;
		stroke-linecap: round;
	}
	.label, .label-left {
		color: #F2645A;
		line-height: 18px;
	    font-family: 'Source Sans Pro', sans-serif;
	    font-size: 16px;
      	font-weight: 700;
    	text-anchor: start;
	}
	.label-left {
    	text-align: right;
    	text-anchor: end;
    }
</style>
