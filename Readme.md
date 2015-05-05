# mock-response [![NPM version][npm-image]][npm-url] [![build status][travis-image]][travis-url] [![Test coverage][coveralls-image]][coveralls-url]

> Response renderer

## Installation

    npm install mock-response

## Usage

    var Response = require('mock-response');
    var response = new Response('./test/fixtures/deal/26701138.GET.json');
    // response.status => 200
    // response.body =>
    // {
    //     "hello": "world"
    // }


For more info, see [docs](browse/docs/Home.md).

## License

MIT

[npm-image]: https://img.shields.io/npm/v/mock-response.svg?style=flat
[npm-url]: https://npmjs.org/package/mock-response
[travis-image]: https://img.shields.io/travis/meituan/mock-response.svg?style=flat
[travis-url]: https://travis-ci.org/meituan/mock-response
[coveralls-image]: https://img.shields.io/coveralls/meituan/mock-response.svg?style=flat
[coveralls-url]: https://coveralls.io/r/meituan/mock-response?branch=master
