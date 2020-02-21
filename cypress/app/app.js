const fs = require('fs');
const dylan = require('dylan');
const static = require('@dylan/static');
const app = dylan();
const parser = require('@dylan/parser');
const files = fs.readdirSync('cypress/app/dist');
const frontendJS = files.find(file => /^frontend\..+\.js$/.test(file));
const headJS = files.find(file => /^head\..+\.js$/.test(file));
const mainCSS = files.find(file => /^main\..+\.css$/.test(file));
const headCSS = files.find(file => /^head\..+\.css$/.test(file));

app.use(parser());


const menu = `
  <nav>
    <a href="/">Home</a>
    <a href="/about">About Link</a>
    <a href="/about" data-swap="h1">About Header</a>
    <a href="/about" data-swap="div, h1, h2">About Elements</a>
    <a href="/about" data-swap=".content">About Body</a>
    <a href="/about" data-swap=".content, .header">About Header and Body</a>
    <a href="/about" data-swap-inline=".content">Inline About</a>
    <a href="/head">Head Link</a>
    <a href="/delayed">Delayed Link</a>
    <a href="/delayed" data-swap="false">Hard Delay</a>
    <a href="https://www.desiringgod.org">External Link</a>
    <a href="/arrive">Arrive Link</a>
    <a href="/route-on">Route Link</a>
    <a href="/events">Events Link</a>
    <a href="/about#layout">Anchor Link</a>
    <a>Nothing Link</a>
  </nav>
`;

const layout = (content) => `
    <div id="layout">
      ${content}
    </div>
  `;

app.use(static('cypress/app/dist'));

app.get('/', (req, res) => res.send(`
  <html>
    <head>
      <title>Home</title>
      <script src="/${frontendJS}" type="application/javascript"></script>
      <link rel="stylesheet" href="/${mainCSS}">
    </head>
    <body>
      ${menu}
      ${layout(`
        <h1>Hi</h1>
        <div class="header">Home Header</div>
        <div class="content">Home Content</div>
      `)}
    </body>
  </html>
`));


app.get('/about', (req, res) => res.send(`
  <html>
    <head>
      <title>About</title>
      <script src="/${frontendJS}" type="application/javascript"></script>
      <link rel="stylesheet" href="/${mainCSS}">
    </head>
    <body>
    ${menu}
    ${layout(`
      <span id="tag">${Math.random()}</span><br>
      <div class="header">Header</div>
      <div class="content">
        About page
      </div>
    `)}
    </body>
  </html>
`));


app.get('/head', (req, res) => res.send(`
  <html>
    <head>
      <title>Head</title>
      <meta charset="UTF-8">
      <meta name="description" content="About page">
      <meta name="keywords" content="about,swap">
      <meta name="author" content="Shane Thacker">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <script src="/${frontendJS}" type="application/javascript"></script>
      <script src="/${headJS}" type="application/javascript"></script>
      <link rel="stylesheet" href="/${mainCSS}">
      <link rel="stylesheet" href="/${headCSS}">
    </head>
    <body>
    ${menu}
    ${layout(`
      <div class="change-from-remote-script">Should change</div>
      <div class="change-from-inline-script">Should change</div>
      <div class="header">Header</div>
      <div class="content">
        About page
      </div>
      <script>document.querySelector('.change-from-inline-script').innerText = 'changed';</script>
    `)}
    </body>
  </html>
`));

app.get('/delayed', (req, res) => {
  setTimeout(() => {
    res.send(`
      <html>
        <head>
          <title>Delayed</title>
          <script src="/${frontendJS}" type="application/javascript"></script>
        </head>
        <body>
        ${menu}
        ${layout(`
          <div class="header">Header</div>
          <div class="content">
            Delayed page
          </div>
        `)}
      </body>
      </html>
    `);
  }, 50);
});


app.get('/arrive', (req, res) => res.send(`
  <html>
    <head>
      <title>Elements</title>
      <script src="/${frontendJS}" type="application/javascript"></script>
    </head>
    <body>
    ${menu}
    ${layout(`
      <div class="arrive">Arrive</div>
    `)}
    </body>
  </html>
`));


app.get('/leave', (req, res) => res.send(`
  <html>
    <head>
      <title>Elements</title>
      <script src="/${frontendJS}" type="application/javascript"></script>
    </head>
    <body>
    ${menu}
    ${layout(`
      <div class="leave">Leave/div>
      <a href="/about">About</a>
    `)}
    </body>
  </html>
`));


app.get('/route-on', (req, res) => res.send(`
  <html>
    <head>
      <title>On</title>
      <script src="/${frontendJS}" type="application/javascript"></script>
    </head>
    <body>
    ${menu}
    ${layout(`
      <div>On route</div>
    `)}
    </body>
  </html>
`));

app.get('/route-off', (req, res) => res.send(`
  <html>
    <head>
      <title>Off</title>
      <script src="/${frontendJS}" type="application/javascript"></script>
    </head>
    <body>
    ${menu}
    ${layout(`
      <div>Off route</div>
      <a href="/">Home</a>
    `)}
    </body>
  </html>
`));


app.get('/events', (req, res) => res.send(`
  <html>
    <head>
      <title>Events</title>
      <script src="/${frontendJS}" type="application/javascript"></script>
    </head>
    <body>
    ${menu}
    ${layout(`
      <div>Events</div>
      <a href="/">Home</a>
    `)}
    </body>
  </html>
`));


app.get('/accounts', (req, res) => res.send(`
  <html>
    <head>
      <title>Accounts</title>
      <script src="/${frontendJS}" type="application/javascript"></script>
      <link rel="stylesheet" href="/${mainCSS}">
    </head>
    <body>
      ${menu}
      ${layout(`
        <a href="/account" data-swap-pane=".Main -> .PaneContent">View Account</a>
        <a href="/edit-account" data-swap-pane=".Main -> .PaneContent">Edit Account</a>
        <a href="/edit-donation" data-swap-pane=".Main -> .PaneContent">Edit Donation</a>
      `)}
    </body>
  </html>
`));

app.get('/account', (req, res) => res.send(`
  <html>
    <head>
      <title>Account</title>
      <script src="/${frontendJS}" type="application/javascript"></script>
    </head>
    <body>
      ${menu}
      ${layout(`
        <div class="Main">
          <span id="tag">${Math.random()}</span><br>
          Account Info
          <a href="/donation" data-swap-pane=".Main -> .PaneContent">View Donation</a>
          <a href="/edit-account" data-swap-pane=".Main -> .PaneContent">Modify Account</a>
        </div>
      `)}
    </body>
  </html>
`));

app.get('/edit-account', (req, res) => res.send(`
  <html>
    <head>
      <title>Account</title>
      <script src="/${frontendJS}" type="application/javascript"></script>
    </head>
    <body>
      ${menu}
      ${layout(`
        <div class="Main">
          <span id="tag">${Math.random()}</span><br>
          Edit Account
          <a href="/add-relationship" data-swap-pane=".Main -> .PaneContent">Add Relationship</a>
          <a href="/donation" data-swap-pane=".Main -> .PaneContent">View Donation</a>
          <a href="/edit-donation" data-swap-pane=".Main -> .PaneContent">Modify Donation</a>
          <form action="/edit-account" method="post">
            <input type="text" name="account" value="Joe">
            <input type="submit">
          </form>
        </div>
      `)}
    </body>
  </html>
`));

app.post('/edit-account', (req, res) => res.redirect('/edit-account'));

app.get('/edit-donation', (req, res) => res.send(`
  <html>
    <head>
      <title>Donation</title>
      <script src="/${frontendJS}" type="application/javascript"></script>
    </head>
    <body>
      ${menu}
      ${layout(`
        <div class="Main">
        <span id="tag">${Math.random()}</span><br>
          Donation Editing
          <form action="/edit-donation" method="post">
            <input type="submit" value="Change">
            <input type="checkbox" name="fail">
            <button data-swap-continue="true">Save and Continue</button>
          </form>
        </div>
      `)}
    </body>
  </html>
`));

app.post('/edit-donation', (req, res) => {
  if (req.body && req.body.fail) {
    res.sendStatus(403);
  } else {
    res.redirect(req.get('pane-url'));
  }
});

app.get('/add-relationship', (req, res) => res.send(`
  <html>
    <head>
      <title>Donation</title>
      <script src="/${frontendJS}" type="application/javascript"></script>
    </head>
    <body>
      ${menu}
      ${layout(`
        <div class="Main">
        <span id="tag">${Math.random()}</span><br>
          Add relationship
          <form action="/add-relationship" method="post">
            <button data-swap-continue="true">Save and Continue</button>
          </form>
        </div>
      `)}
    </body>
  </html>
`));

app.post('/add-relationship', (req, res) => {
  res.redirect('/edit-account');
});

app.get('/donation', (req, res) => res.send(`
  <html>
    <head>
      <title>Account</title>
      <script src="/${frontendJS}" type="application/javascript"></script>
    </head>
    <body>
      ${menu}
      ${layout(`
        <div class="Main">
          Donation Info
        </div>
      `)}
    </body>
  </html>
`));

app.get('/get-form', (req, res) => res.send(`
  <html>
    <head>
      <title>Get Form</title>
      <script src="/${frontendJS}" type="application/javascript"></script>
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
    <script src="/${frontendJS}" type="application/javascript"></script>
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
      <script src="/${frontendJS}" type="application/javascript"></script>
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
    <script src="/${frontendJS}" type="application/javascript"></script>
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
