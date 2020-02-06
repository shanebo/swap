const fs = require('fs');
const dylan = require('dylan');
const static = require('@dylan/static');
const app = dylan();
const parser = require('@dylan/parser');
const files = fs.readdirSync('cypress/app/dist');
const frontendFile = files.find(file => /^frontend\..+\.js$/);

app.use(parser());

const paneHtml = `
    <div class="Pane">
      <div class="PaneHeader">
        <button class="PaneCloseBtn">Close</button>
        <button class="PaneBackBtn">Back</button>
        <a href="url/goes/here">Expand</a>
      </div>
      <div class="PaneMask">
        <div class="PanesHolder">
          <div class="PaneContent"></div>
          <div></div>
          <div></div>
        </div>
      </div>
    </div>
  `;

app.use(static('cypress/app/dist'));

app.get('/', (req, res) => res.send(`
  <html>
    <head>
      <title>Home</title>
      <script src="/${frontendFile}" type="application/javascript"></script>
    </head>
    <body>
      <a>Nothing Link</a>
      <a href="/about">About Link</a>
      <a href="/delayed">Delayed Link</a>
      <a href="/delayed" data-swap="false">Hard Delay</a>
      <a href="https://www.desiringgod.org">External Link</a>
      <a href="/arrive">Arrive Link</a>
      <a href="/route-on">Route Link</a>
      <a href="/about" data-swap="h1">About Header</a>
      <a href="/about" data-swap="div, h1, h2">About Elements</a>
      <a href="/about" data-swap=".content">About Body</a>
      <a href="/about" data-swap=".content, .header">About Header and Body</a>
      <a href="/about" data-swap-inline=".content">Inline About</a>
      <h1>Hi</h1>
      <div class="header">Home Header</div>
      <div class="content">Home Content</div>
    </body>
  </html>
`));


app.get('/about', (req, res) => res.send(`
  <html>
    <head>
      <title>About</title>
      <meta charset="UTF-8">
      <meta name="description" content="About page">
      <meta name="keywords" content="about,swap">
      <meta name="author" content="Shane Thacker">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
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

app.get('/delayed', (req, res) => {
  setTimeout(() => {
    res.send(`
      <html>
        <head>
          <title>Delayed</title>
          <script src="/${frontendFile}" type="application/javascript"></script>
        </head>
        <body>
          <div class="header">Header</div>
          <div class="content">
            Delayed page
          </div>
        </body>
      </html>
    `);
  }, 50);
});


app.get('/arrive', (req, res) => res.send(`
  <html>
    <head>
      <title>Elements</title>
      <script src="/${frontendFile}" type="application/javascript"></script>
    </head>
    <body>
      <div class="arrive">Arrive</div>
    </body>
  </html>
`));


app.get('/leave', (req, res) => res.send(`
  <html>
    <head>
      <title>Elements</title>
      <script src="/${frontendFile}" type="application/javascript"></script>
    </head>
    <body>
      <div class="leave">Leave/div>
      <a href="/about">About</a>
    </body>
  </html>
`));


app.get('/route-on', (req, res) => res.send(`
  <html>
    <head>
      <title>On</title>
      <script src="/${frontendFile}" type="application/javascript"></script>
    </head>
    <body>
      <div>On route</div>
    </body>
  </html>
`));

app.get('/route-off', (req, res) => res.send(`
  <html>
    <head>
      <title>Off</title>
      <script src="/${frontendFile}" type="application/javascript"></script>
    </head>
    <body>
      <div>Off route</div>
      <a href="/">Home</a>
    </body>
  </html>
`));


app.get('/accounts', (req, res) => res.send(`
  <html>
    <head>
      <title>Accounts</title>
      <script src="/${frontendFile}" type="application/javascript"></script>
    </head>
    <body>
      <a href="/account" data-swap-pane=".Main -> .PaneContent">View Account</a>
      <a href="/edit-account" data-swap-pane=".Main -> .PaneContent">Edit Account</a>
      <a href="/edit-donation" data-swap-pane=".Main -> .PaneContent">Edit Donation</a>

      ${paneHtml}
    </body>
  </html>
`));

app.get('/account', (req, res) => res.send(`
  <html>
    <head>
      <title>Account</title>
      <script src="/${frontendFile}" type="application/javascript"></script>
    </head>
    <body>
      <div class="Main">
        Account Info
        <a href="/donation" data-swap-pane=".Main -> .PaneContent">View Donation</a>
      </div>

      ${paneHtml}
    </body>
  </html>
`));

app.get('/edit-account', (req, res) => res.send(`
  <html>
    <head>
      <title>Account</title>
      <script src="/${frontendFile}" type="application/javascript"></script>
    </head>
    <body>
      <div class="Main">
        Edit Account
        <form action="/edit-account" method="post"><input type="submit"></form>
      </div>

      ${paneHtml}
    </body>
  </html>
`));

app.post('/edit-account', (req, res) => res.redirect('/edit-account'));

app.get('/edit-donation', (req, res) => res.send(`
  <html>
    <head>
      <title>Donation</title>
      <script src="/${frontendFile}" type="application/javascript"></script>
    </head>
    <body>
      <div class="Main">
        Edit Donation
        <form action="/edit-donation" method="post"><input type="submit"></form>
      </div>

      ${paneHtml}
    </body>
  </html>
`));

app.post('/edit-donation', (req, res) => res.redirect(req.get('pane-url')));

app.get('/donation', (req, res) => res.send(`
  <html>
    <head>
      <title>Account</title>
      <script src="/${frontendFile}" type="application/javascript"></script>
    </head>
    <body>
      <div class="Main">
        Donation Info
      </div>

      ${paneHtml}
    </body>
  </html>
`));

app.get('/get-form', (req, res) => res.send(`
  <html>
    <head>
      <title>Get Form</title>
      <script src="/${frontendFile}" type="application/javascript"></script>
    </head>
    <body>
      <div class="Main">
        <form action="/get-submit" method="get">
          <input name="name" type="text">
          <input name="email" type="text">
          <input type="submit">
        </form>
      </div>
    </body>
  </html>
`));

app.get('/get-submit', (req, res) => {
  res.send(`
<html>
  <head>
    <title>Get Form</title>
    <script src="/${frontendFile}" type="application/javascript"></script>
  </head>
  <body>
    ${JSON.stringify(req.query)}
  </body>
</html>
`);
});

app.get('/post-form', (req, res) => res.send(`
  <html>
    <head>
      <title>Post Form</title>
      <script src="/${frontendFile}" type="application/javascript"></script>
    </head>
    <body>
      <div class="Main">
        <form action="/post-submit" method="post">
          <input name="name" type="text">
          <input name="email" type="text">
          <input type="submit">
        </form>
      </div>
    </body>
  </html>
`));

app.post('/post-submit', (req, res) => {
  res.send(`
<html>
  <head>
    <title>Post Form</title>
    <script src="/${frontendFile}" type="application/javascript"></script>
  </head>
  <body>
    ${JSON.stringify(req.body)}
  </body>
</html>
`);
});

app.listen(8888);


console.log('http://127.0.0.1:8888');


module.exports = app;
