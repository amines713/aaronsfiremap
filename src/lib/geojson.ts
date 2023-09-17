// import type { FeatureCollection } from 'mapbox-gl'

const toMapDisplay = (n: string) => {
	const splitter = n.split(' ')
	const text = splitter.length >= 2 ? `${splitter[0].charAt(0).toUpperCase()}${splitter[1].charAt(0).toUpperCase()}` : `${splitter[0].charAt(0).toUpperCase()}${splitter[0].charAt(1).toLowerCase()}`
	return text
}

const toGeoJsonEXPOSURE = (arr: null | any[] = [], props: any[] = []) => {
	if (arr === null) {
		return {
			type: 'FeatureCollection',
			features: []
		}
	}

	const collection: any = {
		type: 'FeatureCollection',
		features: arr.map(s => {
			const splitter = s.name.split(' ')
			const display = splitter.length >= 2 ? `${splitter[0].charAt(0).toUpperCase()}${splitter[1].charAt(0).toUpperCase()}` :  `${splitter[0].charAt(0).toUpperCase()}${splitter[0].charAt(1).toLowerCase()}`

			const setProps = props.reduce((fin, prop) => {
				fin[prop] = s[prop]

				return fin
			}, {})

			return {
				type: 'Feature',
				geometry: {
					type: "Point",
					coordinates: [s.position[1], s.position[0]]
				},
				properties: {
					id: s.id,
					title: s.name,
					mapdisplay: toMapDisplay(s.name),
					display: display,
					...setProps
				}
			}
		})
	}

	return collection
}

const toGeoJson = (arr: null | any[] = [], props: any[] = []) => {
	if (arr === null) {
		return {
			type: 'FeatureCollection',
			features: []
		}
	}

	const collection: any = {
		type: 'FeatureCollection',
		features: arr.map(a => {
			const splitter = a.name.split(' ')
			const display = splitter.length >= 2 ? `${splitter[0].charAt(0).toUpperCase()}${splitter[1].charAt(0).toUpperCase()}` :  `${splitter[0].charAt(0).toUpperCase()}${splitter[0].charAt(1).toLowerCase()}`

			return {
				type: 'Feature',
				geometry: {
					type: "Point",
					coordinates: [a.lng, a.lat]
					// coordinates: [a.lat, a.lng]
				},
				properties: {
					type: a.type,
					mapdisplay: toMapDisplay(a.name),
					name: a.name,
					acres: a.acres,
				}
			}
		})
	}

	return collection
}

export { toGeoJson }
