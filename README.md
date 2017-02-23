# Nummar 

Nummar is a simple module that is able to fetch Faroese phone numbers, addresses and various other things from nummar.fo
The module simply takes whichever argument you use, and searches for that on nummar.fo

  - Type some Markdown on the left
  - See HTML in the right
  - Magic

# Installation
To use the module, simple install it from your favorite command line:
```
$ npm install nummar
```

Alternatively:
  - Clone it directly from [github](https://github.com/Sakarisson/nummar/)

### Usage
The module is super simple to use. Simple import it to your and you're good to go! The module only has a single function: search. You can put whatever parameters you want in the search function.
```js
const nummar = require('nummar')

nummar.search('foo bar', (error, result) => {
  if (!error) {
    console.log(result)
  } else {
    console.log(error)
  }
})
```

The results are delivered in a JSON object, which contains a bunch of data, including:
 - Name
 - Phone numbers
 - Address
 - Profession
 - ...and a bunch of other stuff

### Requirements
The module requires Node.js v4.5.0+ to run

License
----

MIT
