# express-bem-xjst
BEMHTML engine for ExpressJS

## Options

#### levels

Use blocks in outher directories

```js
bemhtml({ levels: ['./views/blocks'] });
```

```
./my-site/views/
├── blocks
│   ├── button
│   │   └── button.bemhtml.js
│   ├── form
│   │   └── form.bemhtml.js
│   ├── input
│   │   └── input.bemhtml.js
│   ├── link
│   │   └── link.bemhtml.js
│   └── page
│       └── page.bemhtml.js
├── index.bemhtml.js
└── login.bemhtml.js
```

## Example

```js
var express = require('express');
var bemhtml = require('express-bem-xjst').bemhtml;

var app = express();

app.engine('bemhtml.js', bemhtml({ levels: ['./views/blocks'] }));
app.set('view engine', 'bemhtml.js');

app.get('/', function(req, res) {
    res.render('index', { text: 'Hello world' });
});

app.listen(3000, function() {
    console.log('Example app listening on port 3000!');
});
```
