<script lang="ts">
	import { onMount, tick } from 'svelte'
	// import { Map, Marker } from '@beyonk/svelte-mapbox'
	import Select from 'svelte-select'
	import { toGeoJson } from '@/lib/geojson'
	import type {
		MapMouseEvent,
		Map,
		MapboxGeoJSONFeature,
		EventData,
		GeoJSONSource
	} from 'mapbox-gl'
  import MapSettings from './mapsettings.svelte'

	import { blankIcon, blankIconTwo } from '@/lib/icons'

	export let data

	const layerOptions = {
		// 'text-field': '{mapdisplay}',
		'text-allow-overlap': true,
		'text-justify': 'center',
		'text-size': 22,
		'icon-allow-overlap': true,
	}

	// let mapComponent
	let mb
	let map
	let el
	let val
	let fires = []
	let newfires = []
	let perimeters = {}
  let tiles = 'Topo'

	$: changeVal(val)
	$: changeFires(map, fires)
	$: changeNewFires(map, newfires)
	$: changePerimeters(map, perimeters)
  $: changeTiles(map, tiles)

  const changeTiles = async (map: any, tiles: string) => {
    if (!map) {
      return
    }

    const style = map.getStyle().name

    console.log('style', style)

    switch (tiles) {
      case "Satellite": {
        if (style !== "Mapbox Satellite") {
          map.setStyle("mapbox://styles/mapbox/satellite-v9")
          // map.setStyle("mapbox://styles/mapbox/satellite-streets-v11")
        }
        break 
      }

      case "Topo": {
        if (style !== "Mapbox Outdoors") {
          map.setStyle("mapbox://styles/mapbox/outdoors-v11")
        }
        break
      }
    }
  }


	const changePerimeters = (map, perimeters) => {
		if (!map || !map.isStyleLoaded()) {
			return
		}

		let pSource = map.getSource('perimeters')//  as GeoJSONSource

		if (!pSource) {
			return
		}

		pSource.setData(perimeters)
	}

	const moveBounds = async () => {
		if (!map || !map.isStyleLoaded()) {
			return
		}

		const zoom = map.getZoom()
		const bounds = map.getBounds()
		const latMax = bounds._ne.lat
		const latMin = bounds._sw.lat

		const lngMin = bounds._ne.lng
		const lngMax = bounds._sw.lng

		try {
			const _r = await fetch(`/api/perimeters?ne=${bounds._ne.lat},${bounds._ne.lng}&sw=${bounds._sw.lat},${bounds._sw.lng}&zoom=${zoom}`, {
				method: 'GET',
				headers: {
					'content-type': 'application/json'
				}
			})

			const r = await _r.json()
			perimeters = r
		}
		catch(err) {
			console.error(err)
		}

		try {
			const _r = await fetch(`/api/fires?ne=${bounds._ne.lat},${bounds._ne.lng}&sw=${bounds._sw.lat},${bounds._sw.lng}`, {
				method: 'GET',
				headers: {
					'content-type': 'application/json'
				}
			})

			const r = await _r.json()
			newfires = r
			console.log('newfires', r)
		}
		catch(err) {
			console.error(err)
		}
	}

	const changeFires = (map, fires) => {
		if (!map || !map.isStyleLoaded()) {
			return
		}

		let firesSource = map.getSource('fires')//  as GeoJSONSource

		if (!firesSource) {
			return
		}

		firesSource.setData(toGeoJson(fires))
	}

	const changeNewFires = (map, newfires) => {
		if (!map || !map.isStyleLoaded()) {
			return
		}

		let firesSource = map.getSource('newfires')//  as GeoJSONSource

		if (!firesSource) {
			return
		}

		firesSource.setData(newfires)
	}

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
				map.flyTo({ center: r.center, zoom: 7 })
			}
		}
		catch(err) {
			console.error(err)
		}
	}

	// let accessToken = 'pk.eyJ1IjoiYW1pbmVzNzEzIiwiYSI6ImNrbmdyY2ZkdDBkaDkydnMzM2FzamFyaGIifQ.Nr7mYTWpC_2X6ax5FuKKbg'

	const getColor = (acres) => {
		if (acres > 40) {
			return "red"
		}

		if (acres > 2) {
			return "orange"
		}

		return "yellow"
	}

	const loadMapLayers = () => {
		map.addSource('perimeters', {
			type: 'geojson',
			data: {}
		})

		map.addLayer({
			id: 'perimeters',
			type: 'fill',
			source: 'perimeters', // reference the data source
			layout: {},
			paint: {
				'fill-color': '#ff8000', // blue color fill
				'fill-opacity': 0.5
			}
		})

		map.addSource('mapbox-dem', {
			'type': 'raster-dem',
			'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
			'tileSize': 512,
			'maxzoom': 14
		})

		map.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.4 })

		map.addLayer({
			'id': 'sky',
			'type': 'sky',
			'paint': {
				'sky-type': 'atmosphere',
				'sky-atmosphere-sun': [0.0, 0.0],
				'sky-atmosphere-sun-intensity': 15
			}
		})

		// Fires
		map.addSource('fires', {
			type: 'geojson',
			data: toGeoJson([])
		})

		
		map.addImage('blank-icon', blankIcon)

		map.addLayer({
			id: 'fires',
			type: 'symbol',
			source: 'fires',
			layout: {
				...layerOptions,
				'icon-image': 'blank-icon-two',
			}
		})

		// NewFires
		map.addSource('newfires', {
			type: 'geojson',
			data: toGeoJson([])
		})

		
		map.addImage('blank-icon-two', blankIconTwo)

		map.addLayer({
			id: 'newfires',
			type: 'symbol',
			source: 'newfires',
			layout: {
				...layerOptions,
				'icon-image': 'blank-icon',
			}
		})

		map.on('click', 'fires', (e) => {
			// Copy coordinates array.
			const fire = e.features[0].properties
			const coordinates = e.features[0].geometry.coordinates.slice()

			while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
				coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360
			}
			 
			new mb.Popup()
				.setLngLat(coordinates)
				.setHTML(`
					<strong>${fire.name}</strong>
					<div>${fire.type}</div>
					<div>${fire.acres.toLocaleString("en-US")} Acres</div>
				`)
				.addTo(map)
		})

		map.on('click', 'newfires', (e) => {
			// Copy coordinates array.
			const fire = e.features[0].properties
			const coordinates = e.features[0].geometry.coordinates.slice()

			while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
				coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360
			}

			new mb.Popup()
				.setLngLat(coordinates)
				.setHTML(`
					<strong>${fire.IncidentName}</strong>
					<div>${fire.FireCause}</div>
					<div>${fire.IncidentSize?.toLocaleString("en-US") || 0} Acres</div>
					<div>${fire.PercentContained?.toLocaleString("en-US") || 0} % Contained</div>
				`)
				.addTo(map)
		})
		 
		map.on('mouseenter', 'fires', () => {
			map.getCanvas().style.cursor = 'pointer'
		})
		 
		map.on('mouseleave', 'fires', () => {
			map.getCanvas().style.cursor = ''
		})

		map.on('moveend', () => {
			moveBounds()
		})

		map.on('zoomend', () => {
			moveBounds()
		})
		
    // map.setStyle("mapbox://styles/mapbox/outdoors-v11")

		setTimeout(() => {
			moveBounds()
		}, 1000)
	}

	onMount(async () => {
		mb = await import('mapbox-gl')

		map = new mb.Map({
			accessToken: 'pk.eyJ1IjoiYW1pbmVzNzEzIiwiYSI6ImNrbmdyY2ZkdDBkaDkydnMzM2FzamFyaGIifQ.Nr7mYTWpC_2X6ax5FuKKbg',
			style: 'mapbox://styles/mapbox/outdoors-v11',
			center: [-114, 48],
			zoom: 8,
			pitch: 0,
			bearing: 0,
			container: el
		})

		map.addControl(new mb.NavigationControl())

		map.on('styledataloading', () => {
			map.once('styledata', () => {
				const waiting = () => {
					if (!map.isStyleLoaded()) {
						setTimeout(waiting, 100)
					} else {
						loadMapLayers()
					}
				}

				waiting()
			})
		})

		map.on('load', () => {
			loadMapLayers()
		})
	})
</script>

<svelte:head>
	<title>Aarons Fire Map</title> 
</svelte:head>

<div class="app">
	<MapSettings
		bind:tiles
	/>
	<div class="map" id="map" bind:this={el}></div>

	<!-- <div class="select">
		<Select
			label="name"
			itemId="link"
			placeholder="Choose Agency"
			groupBy={a => a.name.substring(0,2)}
			items={data.agencies}
			bind:value={val}
		/>
	</div> -->
</div>


<style lang="scss">
	.app {
		height: 100%;
		width: 100%;
		position: relative;
		#map {
			position: absolute;
			top: 0;
			bottom: 0;
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
