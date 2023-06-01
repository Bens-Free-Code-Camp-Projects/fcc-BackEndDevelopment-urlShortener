require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const URL = require('url').URL
const bodyParser = require('body-parser')


const dns = require('dns');


app.use(bodyParser.urlencoded({extended: false}))

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

let urlMap = new Map();
let currentKey = 0;

app.post('/api/shorturl', function(req, res) {
  let myUrl = req.body.url
  let urlHostname = new URL(myUrl).hostname

  dns.lookup(urlHostname, (err) => {
    if(err){
      console.log(err)
      res.json({ error: "invalid url"})
      return
    }

    if(urlMap.get(myUrl) === undefined){
      currentKey = currentKey + 1
      urlMap.set(myUrl, currentKey)
      urlMap.set(currentKey, myUrl)
    }
    res.json({ 'original_url' : myUrl, 'short_url' : urlMap.get(myUrl) })
    return
  })
  return
})

app.get('/api/shorturl/:shorturl?', (req, res) => {
  if(!req.params.shorturl)return

  let myUrl = urlMap.get(parseInt(req.params.shorturl))

  if(myUrl === undefined){
    res.json({ error: 'short url does not exist'})
  }
  
  res.redirect(myUrl)
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
