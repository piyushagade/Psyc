'use strict'

const Promise = require('pinkie-promise')
const sliced = require('sliced')

function cb2promise () {
  let args = sliced(arguments)
  const fn = args.shift()
  let resolve
  let reject

  function callbackHandle () {
    let err
    args = sliced(arguments)
    err = args.shift()
    return (!err) ? resolve.apply(null, args) : reject(err)
  };

  function promiseFactory (resolvePromise, rejectPromise) {
    resolve = resolvePromise
    reject = rejectPromise
    return fn.apply(null, args)
  }

  args.push(callbackHandle)

  return new Promise(promiseFactory)
};

module.exports = cb2promise
