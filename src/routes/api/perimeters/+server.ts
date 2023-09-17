import urlencode from 'urlencode'

export async function GET({ url }) {
	const zoom = url.searchParams.get('zoom')
	const [n, e] = url.searchParams.get('ne').split(',')
	const [s, w] = url.searchParams.get('sw').split(',')

	let q = `attr_InitialLatitude > ${s} AND attr_InitialLatitude < ${n} AND attr_InitialLongitude < ${e} AND attr_InitialLongitude > ${w}`

	if (zoom < 8) {
		const acres = (-12.5 * zoom) + 100
		q = `${q} AND attr_CalculatedAcres > ${acres}`
	}

	const _url = `https://services3.arcgis.com/T4QMspbfLg3qTGWY/ArcGIS/rest/services/WFIGS_Interagency_Perimeters_YearToDate/FeatureServer/0/query?where=${urlencode(q)}&objectIds=&time=&geometry=&geometryType=esriGeometryPolygon&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&relationParam=&returnGeodetic=false&outFields=&returnGeometry=true&returnCentroid=false&featureEncoding=esriDefault&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&defaultSR=&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnQueryGeometry=false&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=standard&f=pgeojson&token=`

	const _post = await fetch(_url, {
		method: "GET",
		mode: 'cors'
	})

	const r = await _post.json()
	return new Response(JSON.stringify(r))
}
