// Example express application adding the parse-server module to expose Parse
// compatible API routes.

var express = require('express')
var ParseServer = require('parse-server').ParseServer
var path = require('path')

var databaseURI = 'mongodb://' + process.env.OPENSHIFT_MONGODB_DB_USERNAME + ':' +
process.env.OPENSHIFT_MONGODB_DB_PASSWORD + '@' + process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
process.env.OPENSHIFT_MONGODB_DB_PORT + '/parse'

if (process.env.OPENSHIFT_MONGODB_USERNAME === undefined) {
  databaseURI = null
}

var api = new ParseServer({
  databaseURI: databaseURI || 'mongodb://localhost:27017/soporte_global_dev',
  cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
  appId: process.env.APP_ID || 'myAppId',
  masterKey: process.env.MASTER_KEY || '', //Add your master key here. Keep it secret!
  serverURL: process.env.SERVER_URL || 'http://localhost:1337/parse',  // Don't forget to change to https if needed
  /*liveQuery: {
    classNames: ["Posts", "Comments"] // List of classes to support for query subscriptions
  }*/
})
// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey, restAPIKey, dotNetKey, clientKey

var app = express()

// Serve static assets from the /public folder
app.use('/public', express.static(path.join(__dirname, '/public')))

// Serve the Parse API on the /parse URL prefix
var mountPath = process.env.PARSE_MOUNT || '/parse'
app.use(mountPath, api)

// Parse Server plays nicely with the rest of your web routes
app.get('/', function(req, res) {
  res.status(200).send('I dream of being a website.  Please star the parse-server repo on GitHub!')
})

// There will be a test page available on the /test path of your server url
// Remove this before launching your app
app.get('/test', function(req, res) {
  res.sendFile(path.join(__dirname, '/public/test.html'))
})

var port =  process.env.NODE_PORT || process.env.PORT || 1337
var ip = process.env.NODE_IP || process.env.IP || 'localhost'
var httpServer = require('http').createServer(app)
httpServer.listen(port, ip, function() {
    console.log('parse-server-example running on port ' + port + '.')
})

// This will enable the Live Query real-time server
ParseServer.createLiveQueryServer(httpServer)
