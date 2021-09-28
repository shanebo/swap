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

// enable _method override
app.use((req, res, next) => {
  if (req.body && req.body._method) {
    req.method = req.body._method.toUpperCase();
  }

  next();
});

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
    <a href="/delayed" data-swap-ignore>Hard Delay</a>
    <a href="https://www.desiringgod.org">External Link</a>
    <a href="/arrive">Arrive Link</a>
    <a href="/route-on">Route Link</a>
    <a href="/events">Events Link</a>
    <a href="/events#anchor">Anchor Events Link</a>
    <a href="/about#layout">Anchor Link</a>
    <a href="/notice">Notice Link</a>
    <a href="/confirm">Confirm</a>
    <a>Nothing Link</a>
    <a href="#">Blank Anchor Link</a>
  </nav>
`;

const layout = (content) => `
    <div id="layout">
      ${content}
    </div>
  `;

app.use(static('cypress/app/dist'));

app.get('/favicon.ico', (req, res) => res.sendStatus(200));

app.get('/', (req, res) => res.send(`
  <html>
    <head>
      <title>Home</title>
      <meta property="og:type" content="article">
      <meta property="og:url" content="http://127.0.0.1:8888/">
      <meta property="og:title" content="Swap">
      <meta charset="UTF-8">
      <script src="/${frontendJS}" type="application/javascript"></script>
      <link rel="stylesheet" href="/${mainCSS}">
    </head>
    <body>
      ${menu}
      ${layout(`
        <h1>Hi</h1>
        <span id="tag">${Math.random()}</span><br>
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
      <meta property="og:url" content="http://127.0.0.1:8888/about">
      <meta property="og:title" content="About | Swap">
      <meta charset="UTF-8">
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


app.get('/operators', (req, res) => res.send(`
  <html>
    <head>
      <title>Elements Swap</title>
      <meta property="og:url" content="http://127.0.0.1:8888/about">
      <meta property="og:title" content="Elements | Swap">
      <meta charset="UTF-8">
      <script src="/${frontendJS}" type="application/javascript"></script>
      <link rel="stylesheet" href="/${mainCSS}">
    </head>
    <body>
    ${menu}
    ${layout(`
      <a href="/about" data-swap=".header >> .content">InnerHtml Swap</a>
      <a href="/about" data-swap=".header -> .content">Append Swap</a>
      <a href="/about" data-swap=".header <> .content">Replace Adjacent Swap</a>
      <div class="content">
        Content
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
      <style>
        body {
          background-color: rgb(200, 12, 12);
        }
      </style>
    </head>
    <body>
    ${menu}
    ${layout(`
      <div class="change-from-remote-script">Should change from remote script</div>
      <div class="change-from-inline-script">Should change from inline script</div>
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
          <meta charset="UTF-8">
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
      <meta charset="UTF-8">
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
      <meta charset="UTF-8">
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
      <div class="content">Unset</div>
      <form action="/events-submit" method="post"><input type="submit" value="Submit"></form>
      <a formaction="/events-submit" formmethod="post">Formaction</a>
    `)}
    </body>
  </html>
`));


app.post('/events-submit', (req, res) => res.send(`
  <html>
    <head>
      <title>Events</title>
      <script src="/${frontendJS}" type="application/javascript"></script>
    </head>
    <body>
    ${menu}
    ${layout(`
      <div>Events Submit</div>
    `)}
    </body>
  </html>
`));


app.get('/accounts', (req, res) => res.send(`
  <html>
    <head>
      <title>Accounts</title>
      <meta charset="UTF-8">
      <script src="/${frontendJS}" type="application/javascript"></script>
      <link rel="stylesheet" href="/${mainCSS}">
    </head>
    <body>
      ${menu}
      ${layout(`
        <a href="/account" data-swap-pane=".Main">View Account</a>
        <a href="/edit-account" data-swap-pane=".Main">Edit Account</a>
        <a href="/edit-donation" data-swap-pane=".Main">Edit Donation</a>
      `)}
    </body>
  </html>
`));

app.get('/account', (req, res) => res.send(`
  <html>
    <head>
      <title>Account</title>
      <meta charset="UTF-8">
      <script src="/${frontendJS}" type="application/javascript"></script>
    </head>
    <body>
      ${menu}
      ${layout(`
        <div class="Main">
          <span id="tag">${Math.random()}</span><br>
          Account Info
          <a href="/donation" data-swap-pane=".Main">View Donation</a>
          <a href="/edit-account" data-swap-pane=".Main">Modify Account</a>
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
          <a href="/add-relationship" data-swap-pane=".Main">Add Relationship</a>
          <a href="/donation" data-swap-pane=".Main">View Donation</a>
          <a href="/edit-donation" data-swap-pane=".Main">Modify Donation</a>
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
            <button data-swap-continue>Save and Continue</button>
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
    res.redirect(req.get('Swap-Referer-Url'));
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
            <input type="submit" value="Create">
            <button data-swap-continue>Save and Continue</button>
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

app.get('/notice', (req, res) => {
  res.send(`
<html>
  <head>
    <title>Notice Page</title>
    <script src="/${frontendJS}" type="application/javascript"></script>
  </head>
  <body>
    <div class="Notice">
      A notice message
    </div>
    <div class="content">
      Notice Page
    </div>
    <a href="/update-notice" data-swap=".content">Update Content</a>
  </body>
</html>
`);
});

app.get('/no-notice', (req, res) => {
  res.send(`
<html>
  <head>
    <title>Notice Page</title>
    <script src="/${frontendJS}" type="application/javascript"></script>
  </head>
  <body>
    <div class="content">
      No Notice Page
    </div>
    <a href="/notice" data-swap=".content">Update Content and Add Notice</a>
  </body>
</html>
`);
});

app.get('/update-notice', (req, res) => {
  res.send(`
<html>
  <head>
    <title>Info Page</title>
    <script src="/${frontendJS}" type="application/javascript"></script>
  </head>
  <body>
    <div class="Notice">
      Notice message updated
    </div>
    <div class="content">
      Content Updated
    </div>
  </body>
</html>
`);
});

app.get('/asset', (req, res) => res.send(`
  <html>
    <head>
      <title>Asset change</title>
      <script src="/${frontendJS}" type="application/javascript"></script>
      <link rel="stylesheet" href="/${mainCSS}">
      <script src="/asset-${req.query.change ? '456' : '123'}.js" type="application/javascript"></script>
    </head>
    <body>
      ${menu}
      ${layout(`
        <h1>Asset Change Page</h1>
        <span id="tag">${Math.random()}</span><br>
        <a href="/asset?change=true" data-swap="h1">Change Asset</a>
      `)}
    </body>
  </html>
`));

app.get('/asset-123.js', (req, res) => {
  res.set('Content-Type', 'text/javascript');
  res.send(`console.log('123');`);
});
app.get('/asset-456.js', (req, res) => {
  res.set('Content-Type', 'text/javascript');
  res.send(`console.log('456');`);
});

app.get('/form-method', (req, res) => res.send(`
  <html>
    <head>
      <title>Button links</title>
      <script src="/${frontendJS}" type="application/javascript"></script>
      <link rel="stylesheet" href="/${mainCSS}">
    </head>
    <body>
      ${menu}
      ${layout(`
        <h1>Button links</h1>
        <div class="content">Not swapped</div>
        <button formaction="/form-method-post" formmethod="post" formbody='{"name":"charles"}'>Post Data</button>
        <button formaction="/form-method-put" formmethod="put" formbody='{"name":"john"}'>Put Data</button>
        <button formaction="/form-method-post" formmethod="post" formbody='{"name": "martin"}' data-swap=".content">Swap Data</button>
        <button formaction="http://localhost:8888/form-method-other" formmethod="post" data-swap=".content">Swap Other Domain</button>
        <button formaction="/form-method-post" formmethod="post" formbody='{"name":"jones"}' data-swap-inline=".content">Swap Data Inline</button>
        <a formaction="/form-method-post" formmethod="post" formbody='{"name":"charles"}'>Link Data</a>
        <a formaction="/form-method-post" formmethod="post" formbody='{"name":"augustine"}' data-swap=".content">Swap Link Data</a>
        <a href="/form-method-account" data-swap-pane=".Main">Pane</a>
      `)}
    </body>
  </html>
`));

app.put('/form-method-put', (req, res) => {
  res.send(`<div class="content">Put name = ${req.body.name}</div>`);
});

app.post('/form-method-post', (req, res) => {
  res.send(`<div class="content">Posted name = ${req.body.name}</div>`);
});

app.post('/form-method-other', (req, res) => {
  res.send(`<div class="content">Other domain</div>`);
});

app.get('/form-method-account', (req, res) => res.send(`
  <html>
    <head>
      <title>Account</title>
      <meta charset="UTF-8">
      <script src="/${frontendJS}" type="application/javascript"></script>
    </head>
    <body>
      ${menu}
      ${layout(`
        <div class="Main">
        <button formaction="/form-method-pane-post" formmethod="post" data-swap-pane=".Main" formbody='{"name":"charles"}'>Pane Post Data</button>
          Account Info
          <a href="/form-method-edit-account" data-swap-pane=".Main">Edit Account</a>
        </div>
      `)}
    </body>
  </html>
`));

app.get('/form-method-edit-account', (req, res) => res.send(`
  <html>
    <head>
      <title>Account</title>
      <script src="/${frontendJS}" type="application/javascript"></script>
    </head>
    <body>
      ${menu}
      ${layout(`
        <div class="Main">
          <div class="content">Not Swapped</div>
          Edit Account
          <input type="text" name="account" value="Joe">
          <button formaction="/form-action-edit-account" formmethod="post" formbody='{"name":"charles"}' data-swap-continue>Save and Continue</button>
        </div>
      `)}
    </body>
  </html>
`));

app.post('/form-method-pane-post', (req, res) => {
  res.send(`<div class="Main">Posted name = ${req.body.name}</div>`);
});

app.post('/form-action-edit-account', (req, res) => {
  if (req.body.name == 'charles') {
    res.redirect('/form-method-edit-account');
  } else {
    res.sendStatus(500);
  }
});

app.get('/confirm', (req, res) => res.send(`
  <html>
    <head>
      <title>Confirm</title>
      <meta charset="UTF-8">
      <script src="/${frontendJS}" type="application/javascript"></script>
      <link rel="stylesheet" href="/${mainCSS}">
    </head>
    <body>
      ${menu}
      ${layout(`
        <div class="Main">

          <button
            data-swap-confirm
            data-swap-confirm-title="Are you sure you'd like to cancel this partnership?"
            data-swap-confirm-cancel="Never mind"
            data-swap-confirm-ok="Yes, cancel"
            formaction="/confirm/cancel"
            formmethod="post"
            data-close
            >
              Cancel Subscription
          </button>

        </div>
      `)}
    </body>
  </html>
`));

app.post('/confirm/cancel', (req, res) => res.send(`
  <html>
    <head>
      <title>Confirm Cancel</title>
      <meta charset="UTF-8">
      <script src="/${frontendJS}" type="application/javascript"></script>
      <link rel="stylesheet" href="/${mainCSS}">
    </head>
    <body>
      ${menu}
      ${layout(`
        <div class="Main">Canceled!</div>
      `)}
    </body>
  </html>
`));

app.listen(8888);


console.log('http://127.0.0.1:8888');


module.exports = app;
