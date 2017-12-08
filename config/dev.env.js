var merge = require('webpack-merge')
var prodEnv = require('./prod.env')
var secretEnv = require('./secret.env.js')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"'
}, secretEnv)
