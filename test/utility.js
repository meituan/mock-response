var utility = require('../lib/utility');

describe('utility', function() {
    describe('walk', function() {
        it('should only execute callback with primitive value', function() {
            utility.walk({
                arr: ['a', 'b'],
                obj: {
                    a: 'a',
                    b: 'b',
                }
            }, function(value) {
                value.should.be.type('string');
            });
        });
    });

    describe('set', function() {
        it('should handle nested object', function() {
            var object = {
                a: {
                    b: {
                        c: 0
                    }
                }
            };
            utility.set(object, 'a.b.c', 1);
            object.a.b.c.should.equal(1);
        });

        it('should handle array key index', function() {
            var object = {
                a: [{
                    b: 0
                }, {
                    c: 1
                }]
            };
            utility.set(object, 'a.0.b', 2);
            object.a[0].b.should.equal(2);
            object.a[1].c.should.equal(1);
        });

        it('should handle property don\'t exist', function() {
            var object = {};
            utility.set(object, 'a.b.c', 1);
            object.a.b.c.should.equal(1);
        });
    });
});
