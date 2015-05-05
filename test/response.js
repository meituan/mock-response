var fs = require('fs');
var Response = require('..');

describe('Response', function() {
    var mount = './test/fixtures';

    it('should allow mock data with out meta data', function() {
        var res = new Response('shop/:id.GET.json', {
            mount: mount,
        });
        res.status.should.equal(200);
        res.body.should.be.type('object');
        res.body.shopId.should.be.ok;
    });

    it('should read the content of JSON response', function() {
        var res = new Response('deal/26701138.GET.json', {
            mount: mount,
        });
        res.status.should.equal(200);
        res.body.should.be.type('object');
    });

    it('should always use newest version of JSON response', function() {
        var res = new Response('cache.json', {
            mount: mount,
        });
        res.status.should.equal(200);
        res.body.hello.should.eql('world');
        // change content of the file
        fs.writeFileSync('test/fixtures/cache.json', '{"hello":"world2"}', 'utf8');
        res = new Response('cache.json', {
            mount: mount,
        });
        res.status.should.equal(200);
        res.body.hello.should.eql('world2');
        // restore change
        fs.writeFileSync('test/fixtures/cache.json', '{"hello":"world"}\n', 'utf8');

        // Nodejs module
        res = new Response('cache.js', {
            mount: mount,
        });
        res.status.should.equal(200);
        res.body.hello.should.eql('world');
        // change content of the file
        fs.writeFileSync('test/fixtures/cache.js', 'module.exports = {"hello":"world2"};', 'utf8');
        res = new Response('cache.js', {
            mount: mount,
        });
        res.status.should.equal(200);
        res.body.hello.should.eql('world2');
        // restore change
        fs.writeFileSync('test/fixtures/cache.js', 'module.exports = {"hello":"world"};\n', 'utf8');
    });

    it('should allow data simulation with MockJS', function() {
        var res = new Response('response/mockjs.js', {
            mount: mount,
            params: {param1: 'world'},
        });
        res.body.function.should.equal(res.body.title);
        res.body.param.should.equal('world');
    });

    it('should parse handlebar template', function() {
        var res = new Response('response/template.hbs', {
            mount: mount,
            params: {param1: 'world'},
        });
        res.body.hello.should.equal('world');
    });

    it('should parse Node.js module', function() {
        var res = new Response('response/module.js', {
            mount: mount,
        });
        res.body.hello.should.equal('world');
    });

    it('should handle Node.js module as function', function() {
        var res = new Response('response/function.js', {
            mount: mount,
            params: {param1: 'world'},
        });
        res.body.hello.should.equal('world');
    });

    it('should handle response exception', function() {
        var res = new Response('response/exception.json', {
            mount: mount,
        });
        res.status.should.equal(500);
        res.body.message.should.ok;
    });

    describe('wildcard', function() {
        it('should extract data from wildcard match', function() {
            var res = new Response('shop/:id.GET.json', {
                mount: mount,
            });
            res.body.shopId.should.equal(123456);
        });
    });

    describe('overrides', function() {
        it('should merge additional magic querystring', function() {
            var res = new Response('overrides.json', {
                mount: mount,
                overrides: {'a.1.c': 'world2'},
            });
            res.body.a[0].b.should.equal('hello');
            res.body.a[1].c.should.equal('world2');
        });

        it('should override after random data generated', function() {
            var res = new Response('overrides.json', {
                mount: mount,
                overrides: {'random.1.hello': 'world2'},
            });
            res.body.random[0].hello.should.equal('world');
            res.body.random[1].hello.should.equal('world2');
        });

        it('should work after atom expandsion', function() {
            var res = new Response('atom.json', {
                mount: mount,
                overrides: {'deal.price': 300},
            });
            res.body.deal.price.should.equal(300);
        });
    });

    describe('mixin', function() {
        it('should mixin parent dataset', function() {
            var res = new Response('mixin.json', {
                mount: mount,
            });
            res.mixin.should.eql('base.json');
            res.body.should.eql({
                base: 'base',
                child: 'child',
            });
        });

        it('should handle multiple mixins', function() {
            var res = new Response('multi-mixin.json', {
                mount: mount,
            });
            res.mixin.should.eql(['base.json', 'head.json']);
            res.body.should.eql({
                base: 'base',
                head: 'head',
                child: 'child',
            });
        });

        it('should override mixin property', function() {
            var res = new Response('override-mixin.json', {
                mount: mount,
            });
            res.mixin.should.eql('base.json');
            res.body.should.eql({
                base: 'not base',
            });
        });
    });

    describe('atom', function() {
        it('should recursively expand atom', function() {
            var res = new Response('atom.json', {
                mount: mount,
            });
            res.status = 200;
            res.body.should.eql({
                deal: {
                    id: '123456',
                    price: 200,
                }
            });
        });
    });
});
