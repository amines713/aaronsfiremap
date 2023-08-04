import { error } from '@sveltejs/kit'
import { addLast } from 'timm'
import * as turf from '@turf/turf'

const getWildwebe = async (link) => {
	console.log('webe', link)
	const wildUrl = (code) => `https://snknmqmon6.execute-api.us-west-2.amazonaws.com/centers/${code}/incidents`

	let fires = []
	// try {
		const reg = /https:\/\/www\.wildwebe\.net\/\?dc_name=(\w+)/
		const code = reg.exec(link)[1]

		const r = await fetch(wildUrl(code))
		const _r = await r.json()

		if (_r.message === "Service Unavailable") {
			throw new Error("LAME")
		}

		if (_r.length === 0) {
			return [[],[]]
		}

		if (_r[0].data.length === 0) {
			return [[],[]]
		}

		fires = _r[0].data.filter(f => f.latitude && f.longitude && Number(f.latitude) !== 0 && Number(f.longitude) !== 0).reduce((_fires, f) => {
			const status = JSON.parse(f.fire_status)

			if (status.out !== null) {
				return _fires
			}

			if (f.type === 'False Alarm') {
				return _fires
			}

			return addLast(_fires, {
				lat: Number(f.latitude),
				lng: -Math.abs(Number(f.longitude)),
				name: f.name,
				type: f.type,
				date: new Date(f.date),
				ic: f.i || '',
				acres: Number(f.acres),
				out: status.out
			})
		}, [])
	// }
	// catch(err) {
	// 	console.error(err)
	// 	return [[], []]
	// }

	if (fires.length === 0) {
		return [[],[]]
	}

	const features = turf.points(fires.map(f => [f.lng, f.lat]))

	const center = turf.center(features)

	return [fires, center.geometry.coordinates]
}

async function getStuff(link) {
	try {
		const w = await getWildwebe(link)

		return w
	}
	catch(err) {
		return await getStuff(link)
	}
}

export async function GET({ url }) {
	const link = url.searchParams.get('link')

	const r = { fires: [] }


	if (/www.wildwebe.net/.test(link)) {
		const w = await getStuff(link)
		// const w = await getWildwebe(link)
		r.fires = w[0]
		r.center = w[1]
	}

	return new Response(JSON.stringify(r))
}



  // {
  //   ic: 'Wahlberg',
  //   date: '2023-07-30T20:24:20.195',
  //   name: 'Brushy',
  //   type: 'Wildfire',
  //   uuid: 'ceb7eaf1-c6d5-4e0b-b8ca-6a2dea507322',
  //   acres: '0.1',
  //   fuels: 'Brush',
  //   inc_num: '530',
  //   fire_num: '11',
  //   latitude: '48.751067',
  //   location: null,
  //   longitude: '113.821833',
  //   resources: [ null ],
  //   webComment: null,
  //   fire_status: '{"out": "2023-07-31T17:35:00", "contain": "2023-07-31T00:00:00", "control": "2023-07-31T17:20:00"}',
  //   fiscal_data: '{"inc_num": "530", "fire_code": "QGU9", "wfdssunit": "MTGNP", "fs_job_code": null, "fs_override": null, "fiscal_comments": null, "state_fiscal_code": null}'
  // },
