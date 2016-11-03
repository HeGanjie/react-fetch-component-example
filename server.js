var express = require('express')
var app = express()

app.use(express.static('public'))

app.get(['/hello/:name', '/hello'], function (req, res) {
  let sayHelloTo = req.params.name || 'world'
  res.send(`Hello ${sayHelloTo}!`)
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
