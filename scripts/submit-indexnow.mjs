const siteUrl = 'https://budgetloom.xyz'
const host = 'budgetloom.xyz'
const key = 'db72385a0c4840b6aa559005feacc25a'
const keyLocation = `${siteUrl}/${key}.txt`

async function assertOk(response, label) {
  if (!response.ok) {
    const body = await response.text()
    throw new Error(`${label} failed (${response.status}): ${body.slice(0, 300)}`)
  }
  return response
}

const keyResponse = await assertOk(await fetch(keyLocation), 'Key verification')
const hostedKey = (await keyResponse.text()).trim()

if (hostedKey !== key) {
  throw new Error(`The live key file at ${keyLocation} does not match. Deploy this project before submitting.`)
}

const sitemapResponse = await assertOk(await fetch(`${siteUrl}/sitemap.xml`), 'Sitemap fetch')
const sitemap = await sitemapResponse.text()
const urlList = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1].trim())

if (urlList.length === 0) throw new Error('No URLs were found in the live sitemap.')

for (const url of urlList) {
  const parsed = new URL(url)
  if (parsed.protocol !== 'https:' || parsed.host !== host) {
    throw new Error(`Refusing to submit an unexpected sitemap URL: ${url}`)
  }
}

const response = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'content-type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host, key, keyLocation, urlList }),
})

if (![200, 202].includes(response.status)) {
  const body = await response.text()
  throw new Error(`IndexNow submission failed (${response.status}): ${body.slice(0, 300)}`)
}

console.log(`IndexNow accepted ${urlList.length} URLs from ${siteUrl}/sitemap.xml (${response.status}).`)
