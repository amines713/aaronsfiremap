import { error } from '@sveltejs/kit'
import { addLast } from 'timm'
import * as turf from '@turf/turf'
import cheerio from 'cheerio'

import urlencode from 'urlencode'

const getWildcad = async (link) => {
	const cadUrl = (code) => `http://www.wildcad.net/WC${code}open.htm`

	let fires = []
	try {
		const reg = /http:\/\/www\.wildcad\.net\?WildWeb=([-\w]+)/
		const code = reg.exec(link)[1]

		const r = await fetch(cadUrl(code), {
			mode: 'cors',
			cache: "no-store",
		})

		const post = await r.text()

		const c = cheerio.load(post)

		const dealios = []

		let dateIndex = 0
		let locationIndex = 0
		let nameIndex = 0
		let acresIndex = 0
		let typeIndex = 0

		c('TABLE TR').each((_i, el) => {
			let dealio = {}

			c(el).children('TD').each((i, td) => {
				if (c(td).text() === 'Date') {
					dateIndex = i
				}

				if (c(td).text() === 'Name') {
					nameIndex = i
				}

				if (c(td).text() === 'Lat/Lon') {
					locationIndex = i
				}

				if (c(td).text() === 'Acres') {
					acresIndex = i
				}

				if (c(td).text() === 'Type') {
					typeIndex = i
				}
			})

			c(el).children('TD').each((i, td) => {
				if (i === 0) {
					if (dealio.lat && dealio.lng && dealio.type !== 'False Alarm' && dealio.type !== 'Aircraft' && dealio.type !== 'Resource Order' && dealio.type !== 'Smoke Check') {
						dealios.push(dealio)
					}

					dealio = {}
				}

				if (i === dateIndex) {
					dealio.date = c(td).text()
				}

				if (i === nameIndex) {
					dealio.name = c(td).text()
				}

				if (i === typeIndex) {
					dealio.type = c(td).text()
				}

				if (i === acresIndex) {
					dealio.acres = Number(c(td).text()) || 0
				}

				if (i === locationIndex) {
					const latlng = c(td).text()
					const reg = /([-\d]+\s[\.\d]+),\s([-\d]+\s[\.\d]+)/
					const things = reg.exec(latlng)

					if (things !== null) {
						const [latH, latM] = things[1].split(' ')
						const [lngH, lngM] = things[2].split(' ')
						const lat = Number(latH) + (Number(latM) / 60)
						const lng = Number(lngH) - (Number(lngM) / 60)

						dealio.lat = lat
						dealio.lng = lng
					}

					if (things === null) {
						const [lat, lng] = latlng.split(', ')

						dealio.lat = Number(lat) || 0
						dealio.lng = Number(lng) || 0
					}
				}
			})

			if (dealio.lat && dealio.lng && dealio.type !== 'False Alarm' && dealio.type !== 'Aircraft' && dealio.type !== 'Resource Order' && dealio.type !== 'Smoke Check') {
				dealios.push(dealio)
			}
		})

		fires = dealios
	}
	catch(err) {
		console.error(err)
		return [[], []]
	}

	if (fires.length === 0) {
		return [[],[]]
	}

	const features = turf.points(fires.map(f => [f.lng, f.lat]))

	const center = turf.center(features)

	return [fires, center.geometry.coordinates]
}

const getWildwebe = async (link) => {
	const wildUrl = (code) => `https://snknmqmon6.execute-api.us-west-2.amazonaws.com/centers/${code}/incidents`

	let fires = []
	try {
		const reg = /https:\/\/www\.wildwebe\.net\/\?dc_name=(\w+)/
		const code = reg.exec(link)[1]

		const r = await fetch(wildUrl(code), {
			mode: 'cors',
			cache: "no-store",
		})
			
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

			if (f.type === 'False Alarm' || f.type === 'Resource Order' || f.type === 'Smoke Check') {
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
	}
	catch(err) {
		console.error(err)
		return [[], []]
	}

	if (fires.length === 0) {
		return [[],[]]
	}

	const features = turf.points(fires.map(f => [f.lng, f.lat]))

	const center = turf.center(features)

	return [fires, center.geometry.coordinates]
}

async function retryWildwebe(link) {
	try {
		const w = await getWildwebe(link)

		return w
	}
	catch(err) {
		return await retryWildwebe(link)
	}
}

async function retryWildcad(link) {
	try {
		const w = await getWildcad(link)

		return w
	}
	catch(err) {
		return await retryWildcad(link)
	}
}

const validWilds = [
	'AZ-ADC',
	'IDBDC',
	'MT-BZC',
	'MT-MCC',
	'MTBDC',
	'OR-BIC',
	'ORLFC',
	'WA-NDC',
	'WA-OLC',
	'WA-PCC',
	'WA-SPC',
	'WA-TDC',
]

export async function GET({ url }) {
	const link = url.searchParams.get('link')

	const r = { fires: [], center: [0,0] }

	if (/www.wildwebe.net/.test(link)) {
		const w = await retryWildwebe(link)
		// const w = await getWildwebe(link)
		r.fires = w[0]
		r.center = w[1]
	}

	else if (validWilds.some(code => link.indexOf(code) >= 0)) {
		const w = await retryWildcad(link)
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
