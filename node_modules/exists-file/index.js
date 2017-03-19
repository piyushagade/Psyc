'use strict'

var fs = require('fs')
var promise = require('cb2promise')

function isString (str) {
  return typeof str === 'string'
}

function existeFile (filepath, cb) {
  if (!isString(filepath)) throw new TypeError('path must be a string')
  if (!cb) return promise(existeFile, filepath)

  fs.stat(filepath, function (err, stats) {
    if (!err) return cb(null, true)
    if (err.code === 'ENOENT') return cb(null, false)
    return cb(err, stats)
  })
}

existeFile.sync = function existeFileSync (filepath) {
  if (!isString(filepath)) throw new TypeError('path must be a string')
  try {
    fs.statSync(filepath)
    return true
  } catch (err) {
    if (err.code === 'ENOENT') return false
    throw err
  }
}

module.exports = existeFile
