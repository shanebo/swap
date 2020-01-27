const fs = require('fs');
const dylan = require('dylan');
const static = require('@dylan/static');
const app = dylan();
const files = fs.readdirSync('test/app/dist');
const frontendFile = files.find(file => /^frontend\..+\.js$/);


app.use(static('test/app/dist'));


app.get('/', (req, res) => res.send(`
  <html>
    <head>
      <title>Home</title>
      <script src="/${frontendFile}" type="application/javascript"></script>
    </head>
    <body>
      <a href="/about">About Link</a>
      <a href="/about" data-swap="h1">About Header</a>
      <a href="/about" data-swap="div, h1, h2">About Elements</a>
      <a href="/about" data-swap=".content">About Body</a>
      <a href="/about" data-swap=".content, .header">About Header and Body</a>
      <a href="/about" data-swap-inline=".content">Inline About</a>
      <a href="/dos" data-swap="h1">Swap h1 with /dos h1</a>
      <h1>Hi</h1>
      <div class="header"></div>
      <div class="content"></div>
    </body>
  </html>
`));


app.get('/about', (req, res) => res.send(`
  <html>
    <head>
      <title>About</title>
      <script src="/${frontendFile}" type="application/javascript"></script>
    </head>
    <body>
      <div class="header">Header</div>
      <div class="content">
        About page
      </div>
    </body>
  </html>
`));


app.get('/dos', (req, res) => res.send(`
  <html>
    <head>
      <title>Hi</title>
      <script src="/${frontendFile}" type="application/javascript"></script>
    </head>
    <body>
      <a href="/foo" data-swap="h1">Swap h1 with /foo h1</a>
      <h1>Dos</h1>
      <p>should not be on /</p>
    </body>
  </html>
`));


app.get('/foo', (req, res) => res.send(`
  <html>
    <head>
      <title>Hi</title>
      <script src="/${frontendFile}" type="application/javascript"></script>
    </head>
    <body>
      <a href="/" data-swap="h1">Swap h1 with / h1</a>
      <h1>Foo</h1>
    </body>
  </html>
`));


app.get('/foo', (req, res) => res.send('<h1>Pane</h1>'));


app.listen(8888);


console.log('http://127.0.0.1:8888');


module.exports = app;
