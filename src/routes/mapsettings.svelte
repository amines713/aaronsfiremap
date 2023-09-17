<script lang="ts">
	import Switch from '@/lib/switch/index.svelte'

	export let tiles: string
	// export let showFeatures: string
	// export let showParks: string
	// export let showStorage: boolean
	// export let showLandmarks: boolean

  let active = false

  const toggleActive = () => {
    active = !active
  }

  const tileOptions = ['Satellite', 'Topo']
</script>


<div class="mapsettings" class:active>
  <div class="mapsettingsbutton" title="Map Settings" on:click={toggleActive}>Map Settings</div>
	
	<div class="mapsettingsoptions">
		<div class="title">Imagery</div>
		<div class="tiles">
			<Switch options={tileOptions} bind:value={tiles} />
		</div>

		<!-- <div class="set sm">
			<div class="field">
				<label for="mapsettings-features">Features</label>
				<Select id="mapsettings-features" options={['All', 'Single Park']} bind:value={showFeatures} />
			</div>
			<div class="field">
				<label for="mapsettings-parks">Parks</label>
				<Select id="mapsettings-parks" options={['Active', 'Inactive', 'All']} bind:value={showParks} />
			</div>
			<div class="field">
				<label for="mapsettings-storage">Storage</label>
				<OnOff id="mapsettings-storage" bind:value={showStorage} />
			</div>
			<div class="field">
				<label for="mapsettings-lm">Landmarks</label>
				<OnOff id="mapsettings-lm" bind:value={showLandmarks} />
			</div>
		</div> -->
  </div>
</div>


<style lang="scss">
	// $tline-brown: #DA993E;

	.mapsettings {
		position: absolute;
		top: 14px;
		left: 14px;
		z-index: 47;
		.mapsettingsbutton {
			cursor: pointer;
			padding: 6px 8px;
			background-color: rgba(white, 0.72);
			border-radius: 4px;
			&:after {
				display: block;
				content: attr(title);
				font-weight: bold;
				height: 1px;
				color: transparent;
				overflow: hidden;
				visibility: hidden;
			}
			&:hover {
				background-color: steelblue;
				color: white;
			}
		}
		.mapsettingsoptions {
			display: none;
			position: absolute;
			top: 42px;
			left: 0;
			background-color: rgba(white, 0.72);
			padding: 12px 20px;
			border-radius: 4px;
			flex-direction: column;
			width: 220px;
			&:before {
				bottom: 100%;
				content: '';
				position: absolute;
				left: 10px;
				border-bottom: 12px solid rgba(white, 0.72);
				border-left: 12px solid transparent;
				border-right: 12px solid transparent;
			}
			// .dimensions {
			// 	padding: 8px 0 10px 0;
			// }
			.tiles {
				padding: 8px 0 10px 0;
			}
			.title {
				font-variant: small-caps;
			}
		}
		&.active {
			z-index: 478;
			.mapsettingsbutton {
				background-color: steelblue;
				color: white;
			}
			.mapsettingsoptions {
				display: flex;
			}
		}
	}
</style>
