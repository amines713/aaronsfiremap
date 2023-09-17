<script lang="ts">
	import { createEventDispatcher } from 'svelte'

	export let formatDisplay = function(a: any) {return a}
	export let option = ''
	export let multiple = false
	export let value: string | string[] = []
	export let disabled = false
	export let theme = 'stump'
	export let inline = false
	
	const dispatch = createEventDispatcher()

	$: displayOption = formatDisplay(option)
	$: isActive = multiple ? value.includes(option) : value === option

	const handleClick = (option: string) => () => {
		dispatch('click', option)
	}
</script>


<div
	class="text theme-{theme}"
	class:inline={inline}
	class:active={isActive}
	class:disabled={disabled}
	on:click={handleClick(option)}
>
	{displayOption}
</div>


<style lang="scss">
	.text {
		padding: 6px 16px;
		flex: 1 0 auto;
		transition: background-color 300ms, color 300ms;
		color: lighten(black, 25%);
		background-color: rgb(230, 230, 230);
		font-weight: 600;
		&:first-child {
			border-radius: 2px 0 0 2px;
		}
		&:last-child {
			border-radius: 0 2px 2px 0;
		}
		&.active {
			color: white;
		}
		&.disabled {
			color: lighten(black, 60%);
		}	
		&.theme-tline.active {
			background-color: steelblue;
		}
		&.theme-stump.active {
			background-color: steelblue;
		}
		&.inline {
			padding: 3px 10px;
		}
	}
</style>

