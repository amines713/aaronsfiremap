import urlencode from 'urlencode'

export async function GET({ url }) {
	const [n, e] = url.searchParams.get('ne').split(',')
	const [s, w] = url.searchParams.get('sw').split(',')

	const q = `InitialLatitude > ${s} AND InitialLatitude < ${n} AND InitialLongitude < ${e} AND InitialLongitude > ${w}`

	const _url = `https://services3.arcgis.com/T4QMspbfLg3qTGWY/ArcGIS/rest/services/WFIGS_Incident_Locations_Current/FeatureServer/0/query?where=${urlencode(q)}&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=standard&distance=0.0&units=esriSRUnit_Meter&relationParam=&returnGeodetic=false&outFields=IncidentName%2CDiscoveryAcres%2CPercentContained%2CFinalAcres%2CIncidentSize%2CIncidentTypeKind%2CIncidentTypeCategory%2CFireCause&returnGeometry=true&featureEncoding=esriDefault&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&defaultSR=&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnQueryGeometry=false&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=true&returnM=true&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=standard&f=pgeojson&token=`

	const _post = await fetch(_url, {
		method: "GET",
		mode: 'cors'
	})

	const r = await _post.json()
	return new Response(JSON.stringify(r))
}
