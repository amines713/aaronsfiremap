<script lang="ts">
	import { createEventDispatcher } from 'svelte'

	import SwitchProp from './switchprop.svelte'

	export let value: string | string[] = ''
	export let multiple = false
	export let disabled = false
	export let disabledOptions: string[] = []
	export let options: string[] = []
	export let formatDisplay = function(a: any) {return a}
	export let inline = false

	const dispatch = createEventDispatcher()

	const handleClick = (e: CustomEvent) => {
		const option = e.detail

		if (disabled === true) {
			return
		}

		if (multiple) {
			const val = Array.from(value || [])

			if (!disabledOptions.includes(option)) {
				if (val.includes(option)) {
					const i = val.findIndex((p) => p === option)
					val.splice(i, 1)
				}
				else {
					val.push(option)
				}

				dispatch('change', { value: val })
				value = val
			}
		}
		else {
			if (value !== option && !disabledOptions.includes(option)) {
				dispatch('change', { value: option })
				value = option
			}
		}
	}

	const checkOptions = (opts: string[]) => {
		if (Array.isArray(opts)) {
			return opts
		}

		return ['One']
	}

	$: confirmedOptions = checkOptions(options)
</script>


<div class="switch">
	<div class="wrapper">
		{#each confirmedOptions as option}
			<SwitchProp
				on:click={handleClick}
				{formatDisplay}
				option={option}
				multiple={multiple}
				value={value}
				disabled={disabledOptions.includes(option)}
				inline={inline}
			/>
		{/each}
	</div>
</div>


<style lang="scss">
	.switch {
		display: inline-block;
		cursor: pointer;
		margin: 1px ;
		.wrapper {
			display: flex;
		}
	}
</style>
