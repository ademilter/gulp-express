const express = require('express')
const app = express()
const router = express.Router()

app.set('views', './source/views')
app.set('view engine', 'pug')

app.get('/', function (req, res) {
  res.render('index')
})

app.listen(1234)