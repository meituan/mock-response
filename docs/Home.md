### Response
`Response` constructor accept a path to simulate data, read the content of the file, do extra transformation and return `response`.

`Response(string: location, Object: options)`

For example, simulate data file in `./test/fixtures/deal/26701138.GET.json` has the content

```json
{
    "status": 200,
    "body": {
        "hello": "world"
    }
}
```

We can access simulate data by

```js
var Response = require('mock-response');
var response = new Response('./test/fixtures/deal/26701138.GET.json');
// response.status => 200
// response.body =>
// {
//     "hello": "world"
// }
```

`Response` has the format:

```
{
    status: number
    // additional meta data
    // ...
    body: Object
}
```

For convenience, you can focus on simulation data without meta data

```json
{
   "hello": "world"
}
```

equals to


```json
{
    "status": 200,
    "body": {
        "hello": "world"
    }
}
```


#### format
Besides JSON simulate data files, `mock-response` also support  Node.js module and handlebar template.



#### params and overrides
You can supply addition parameter to fill simulate data.

For example, empty simulate data

```json
{}
```

with additional data,

```js
var Response = require('mock-response');
var response = new Response('test/fixtures/response/template.hbs', {
    params: {param1: 'blanblan'}
});
```

have result

```json
{
    param1: "blanblan"
}
```

Both `params` and `overrides` can be used in simulate data, with following priority

`params < simulate data < overrides`

For example

```json
{
    "key2": "data"
    "key3": "data"
}
```

```js
var Response = require('mock-response');
var response = new Response('path/to/file.json', {
    params: {key1: 'param', key2: 'param', key3: 'param'},
    overrides: {key3: 'override'}
});
```

have the result

```json
{
    "key1": "param",
    "key2": "data",
    "key3": "override"
}
```


In handlebar and Node.js modules, you can also access `params` and `overrides`,

For example

Simulate data file `test/fixtures/response/template.hbs`

```hbs
{
    "hello": "{{param1}}"
}
```

```js
var Response = require('mock-response');
var response = new Response('test/fixtures/response/template.hbs', {
    params: {param1: 'blanblan'}
});
```

have the result

```json
{
    "hello": "blanblan",
    "param1": "blanblan"
}
```

Node.js example

`test/fixtures/response/function.js`

```js
module.exports = function(data) {
    return {
        hello: data.param1,
        world: data.param2,
    };
};
```

```js
var Response = require('mock-response');
var response = new Response('test/fixtures/response/function.js', {
    params: {param1: 'blanblan'},
    overrides: {param2: 'blanblan2'}
});
```

result

```json
{
    "hello": "blanblan",
    "world": "blanblan2",
    "param1": "blanblan",
    "param2": "blanblan2"
}
```


#### random
To reduce the cost to create a simulate data, mock-response provide random data generator. 

For example,

```json
{
    "key|4": ["value"]
}
```

will be expanded to

```json
{
    "key": ["value", "value", "value", "value"]
}
```

see `mock-random` for more info.


#### mixin
Common used dataset can be reused by `mixin`.

For example,

`index.json`

```json
{
   "status": 404,
   "mixin": "base.json",
   "body": {
       "hello": "world"
   }
}
```

`base.json`

```json
{
   "key1": "value1",
   "key2": "value2"
}
```

The result `response` will be

```json
{
   "status": 404,
   "body": {
       "hello": "world",
       "key1": "value1",
       "key2": "value2"
   }
}
```

**Note**: to use `mixin` and `atom`, you should specify simulate data directory `mount` in `options`

```js
var Response = require('mock-response');
var response = new Response('data/use/mixin.json', {
    mount: 'path/to/simulate/data/directory'
});
```


#### atom
Some data are used so frequently that you can extract it as `atom`

For example,

`index.json`

```json
{
    "deals|3": ["atom:///atomDeal.json"]
}
```

`atomDeal.json`

```json
{
    "id": "@RANDOM", // random data
    "name": "hi, what are you doing"
}
```

result

```json
{
    "deals": [{
        "id": 123,
        "name": "hi, what are you doing"
    }, {
        "id": 456,
        "name": "hi, what are you doing"
    }, {
        "id": 789,
        "name": "hi, what are you doing"
    }]
}
```
