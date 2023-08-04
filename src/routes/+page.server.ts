import { error } from '@sveltejs/kit'
import cheerio from 'cheerio'

export async function load({ params }) {
	const _post = await fetch("http://wildcad.net/wildcadweb.asp", {
		mode: 'cors'
	})

	const post = await _post.text()

	// CHEERIO
	const c = cheerio.load(post)

	const agencies = []
	c('table tr').each((_idx, el) => {
		const agency = {}

		c(el).children('td').each((i, td) => {
			if (i === 0) {
				agency.name = c(td).text()
			}
			if (i === 2) {
				if (c(td).children('a').attr('href')) {
					agency.link = c(td).children('a').attr('href').trim()
				}
			}
		})

		if (['Center', 'WildCAD-E WildWeb Dispatch Center'].includes(agency.name)) {
			return
		}

		if (agency.name.indexOf('WildWeb is an optional feature included') >= 0) {
			return
		}

		if (agency.link && !/wildwebe/.test(agency.link)) {
			return
		}

		agencies.push(agency)
	})

	return { agencies }

	throw error(404, 'Not found');
}
