const request = require('request')
const async = require('async')
const cheerio = require('cheerio')

function getInfo (params, callback) {
  const url = `http://nummar.fo/?s=${params}`
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
    htmlResults.push($(this).html())
  })
  htmlResults.forEach((r) => {
    const newResult = {}
    let $ = cheerio.load(r)
    newResult.name = $('.fn').text()
    newResult.streetAddress = $('.street-address').text()
    newResult.postalCode = $('.postal-code').text()
    newResult.locality = $('.locality').text()
    newResult.region = $('.region*').text()
    newResult.numbers = {}
    $('.tel').each(function (i, e) {
      let $ = cheerio.load(e)
      const type = $('.type').text()
      if (type === 'Fartelefon') {
        newResult.numbers.mobile = $('.value').text()
      } else if (type === 'Fastnet') {
        newResult.numbers.fastnet = $('.value').text()
      }
    })

    results.push(newResult)
  })
  callback(null, results)
}

exports.search = (param, callback) => {
  async.waterfall([
    (callback) => { callback(null, param) },
    getInfo,
    getResults
  ], (error, result) => {
    callback(error, result)
  })
}
