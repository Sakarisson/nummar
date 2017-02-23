const request = require('request')   // For making the actual requests to the servers
const async = require('async')       // To avoid callback hell
const cheerio = require('cheerio')   // To get data from DOM
const _ = require('underscore')      // Because I'm lazy

/**
 * Get info from nummar.fo from a certain parameter string
 *
 * Input:  string
 *
 * Return: callback (either an error or the body of the page)
 */
function getInfo (params, callback) {
  const url = `http://nummar.fo/?s=${params}`
  request(url, (error, response, body) => {
    if (!error) {
      if (response.statusCode === 200) {
        callback(null, body)
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
 * Parse the page body from getInfo() and get JSON data for results
 *
 * Input:  string (body HTML)
 *
 * Return: callback (JSON object)
 */
function getJSON (body, callback) {
  const $ = cheerio.load(body) // Parse body
  const scripts = $('script').filter(() => true) // Split all scripts into an array
  const jsonScript = _.filter(scripts, (s) => cheerio.load(s).html().includes('var json_body'))[0] // Get the first (only) element, which contains the words 'var json_body'

  const jsonBody = JSON.parse(cheerio.load(jsonScript).text().replace('var json_body = ', '')) // Parse everything after the variable declaration to JSON

  callback(null, jsonBody)
}

/**
 * Search function. Runs an async-waterfall and returns either an error or a result
 *
 * Input:  string (search parameters)
 *
 * Return: callback (either an error or an array of JSON objects)
 */
exports.search = (param, callback) => {
  async.waterfall([
    (callback) => { callback(null, param) }, // Anonymous callback function to pass parameters
    getInfo,
    getJSON
  ], (error, result) => {
    callback(error, result)
  })
}
