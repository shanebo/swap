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
      <title>Hi</title>
      <script src="/${frontendFile}" type="application/javascript"></script>
    </head>
    <body>
      <a href="/dos" data-swap="h1">Swap h1 with /dos h1</a>
      <h1>Hi</h1>
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
