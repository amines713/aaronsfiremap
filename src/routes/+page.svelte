<script lang="ts">
	import { onMount, tick } from 'svelte'
	import { Map, Marker } from '@beyonk/svelte-mapbox'
	import Select from 'svelte-select'

	import "../app.css"

	export let data

	let mapComponent
	let val
	let fires = []

	$: changeVal(val)

	const changeVal = async (val) => {
		fires = []
		await tick()

		if (!val) {
			fires = []
			return
		}

		try {
			const _r = await fetch(`/api/agency?link=${val.link}`, {
				method: 'GET',
				headers: {
					'content-type': 'application/json'
				}
			})

			const r = await _r.json()
			fires = r.fires

			if (r.center && r.fires.length > 0) {
				mapComponent.flyTo({ center: r.center, zoom: 7 })
			}
		}
		catch(err) {
			console.error(err)
		}
	}

	let accessToken = 'pk.eyJ1IjoiYW1pbmVzNzEzIiwiYSI6ImNrbmdyY2ZkdDBkaDkydnMzM2FzamFyaGIifQ.Nr7mYTWpC_2X6ax5FuKKbg'

	const getColor = (acres) => {
		if (acres > 40) {
			return "red"
		}

		if (acres > 2) {
			return "orange"
		}

		return "yellow"
	}

	onMount(() => {
		mapComponent.setCenter([-114,48],5)
	})
</script>

<svelte:head>
	<title>Aarons Fire Map</title> 
</svelte:head>

<div class="app">
	<div class="map" id="map">
		<Map
			accessToken={accessToken}
			bind:this={mapComponent}
		>
			{#each fires as fire}
				<Marker key={fire.name} lat={fire.lat} lng={fire.lng} color={getColor(fire.acres)} >
					<div class="firecontent" slot="popup">
						<strong>{fire.name}</strong>
						<div>{fire.type}</div>
						<div>{fire.acres.toLocaleString("en-US")} Acres</div>
					</div>
				</Marker>
			{/each}
		</Map>
	</div>

	<div class="select">
		<Select
			label="name"
			itemId="link"
			placeholder="Choose Agency"
			groupBy={a => a.name.substring(0,2)}
			items={data.agencies}
			bind:value={val}
		/>
	</div>
</div>


<style lang="scss">
	.app {
		height: 100%;
		width: 100%;
		position: relative;
		#map {
			height: 100%;
			width: 100%;
		}
		.select {
			position: absolute;
			top: 20px;
			left: 20px;
			width: 500px;
			max-width: 90vw;
		}
	}
	
	.firecontent {
		padding: 0 10px 0 0;
	}
</style>
