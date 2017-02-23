const request = require('request')
const async = require('async')
const cheerio = require('cheerio')

function getInfo (params, callback) {
  const url = `http://nummar.fo/?s=${params}`
  console.log(url)
  request(url, (error, response, body) => {
    if (!error) {
      if (response.statusCode === 200) {
        callback(null, body)
      } else {
        const errorMsg = `Invalid status code: ${response.statusCode}`
        callback(errorMsg)
      }
    } else {
      callback(error)
    }
  })
}

function getResults (body, callback) {
  const htmlResults = []
  const results = []
  let $ = cheerio.load(body)
  $('.mdCardPerson').each(function () {
    htmlResults.push({ html: $(this).html() })
  })
  htmlResults.forEach((r) => {
    const newResult = {}
    let $ = cheerio.load(r.html)
    newResult.name = $('.fn').text()
    newResult.streetAddress = $('.street-address').text()
    newResult.postalCode = $('.postal-code').text()
    newResult.locality = $('.locality').text()
    newResult.region = $('.region*').text()

    results.push(newResult)
  })
  callback(null, results)
}

function search(param, callback) {
  async.waterfall([
    (callback) => { callback(null, param) },
    getInfo,
    getResults
  ], (error, result) => {
    callback(error, result)
  })
}

search('kristian sakarisson', (error, result) => {
  if(!error) {
    console.log(result)
  } else {
    console.log(error)
  }
})
