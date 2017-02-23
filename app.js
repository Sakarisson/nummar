const request = require('request')   // For making the actual requests to the servers
const async = require('async')       // To avoid callback hell
const cheerio = require('cheerio')   // To get data from DOM
const _ = require('underscore')      // Because I'm lazy

const searchUrl = 'http://nummar.fo/?s='

/**
 * Get info from nummar.fo from a certain parameter string
 */
function getPage (params, callback) {
  const info = {
    params: params
  }
  const url = `${searchUrl}=${params}`
  request(url, (error, response, body) => {
    if (!error) {
      if (response.statusCode === 200) {
        info.body = body
        callback(null, info)
      } else {
        const errorMsg = new Error(`Invalid status code: ${response.statusCode}`)
        callback(errorMsg)
      }
    } else {
      callback(error)
    }
  })
}

/**
 * Get number of pages matchin any given search parameter
 */
function getNumberOfPages (param, callback) {
  async.waterfall([
    (callback) => { callback(null, param) }, // Anonymous callback function to pass parameters
    getPage,
    getJSON
  ], (error, result) => {
    if (!error) {
      const pages = Math.ceil(result.jsonBody.total / 10)
      if (pages <= 10) {
        callback(null, param, pages)
      } else {
        callback(new Error(`Too wide of a search. Expected result is ${pages} pages. Maximum is 10. Please narrow your search`))
      }
    } else {
      callback(error)
    }
  })
}

/**
 * Parse the page body from getInfo() and get JSON data for results
 */
function getJSON (info, callback) {
  const $ = cheerio.load(info.body) // Parse body
  const scripts = $('script').filter(() => true) // Split all scripts into an array
  const jsonScript = _.filter(scripts, (s) => cheerio.load(s).html().includes('var json_body'))[0] // Get the first (only) element, which contains the words 'var json_body'

  const jsonBody = JSON.parse(cheerio.load(jsonScript).text().replace('var json_body = ', '')) // Parse everything after the variable declaration to JSON

  info.jsonBody = jsonBody

  callback(null, info)
}

/**
 * Go through all pages and log data
 */
function searchAll (params, pages, callback) {
  const results = []
  async.times(pages, (page, callback) => {
    const url = `${params}&page=${page + 1}`
    async.waterfall([
      (callback) => { callback(null, url) }, // Anonymous callback function to pass parameters
      getPage,
      getJSON
    ], (error, result) => {
      if (!error) {
        _.each(result.jsonBody.contacts, (r) => {
          results.push(r)
        })
      }
      callback(error)
    })
  }, (error, result) => {
    callback(error, results)
  })
}

/**
 * Search function. Runs an async-waterfall and returns either an error or a result
 */
exports.search = (param, callback) => {
  async.waterfall([
    (callback) => { callback(null, param) },
    getNumberOfPages,
    searchAll
  ], (e, r) => {
    callback(e, r)
  })
}
