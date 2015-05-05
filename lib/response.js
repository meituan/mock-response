var fs = require('fs');
var path = require('path');
var _ = require('lodash');
var handlebars = require('handlebars');
var generator = require('mock-generator');
var Utility = require('./utility');

/**
 * @constructor
 * @param {string} locator Match file path
 * @param {Object} options
 *     {
 *         params: Object
 *         overrides: Object
 *     }
 * @return
 *     {
 *         status: number
 *         body: Object
 *     }
 */  
function Response(location, options) {
    this.options = options || {};
    this.options.mount = this.options.mount || '';
    this.options.overrides = this.options.overrides || {};
    this.options.params = this.options.params || {};

    this.read(path.join(this.options.mount, location));

    ['mixin', 'atom', 'override'].forEach(function(func) {
        this[func]();
    }, this);

    return this.data;
}

Response.EXTENSIONS = ['json', 'js', 'hbs'];

/**
 * Read the content of file and parse it into json.
 * @param {string} location
 * @return {Object}
 */
Response.prototype.read = function(location) {
    var json, extension;

    extension = path.extname(location).slice(1);

    try {
        if (Response.EXTENSIONS.indexOf(extension) !== -1) {
            json = this[extension](location);
        } else {
            // treate mock file as json by default
            json = this.json(location);
        }
    } catch (err) {
        json = {
            status: 500,
            body: {
                message: 'Parse error',
                stack: err.stack,
            },
        };
    } finally {
        // prevent atom or mixin data override
        json = _.clone(json);

        if (json.body) {
            this.data = json;
        } else {
            this.data = {
                status: 200,
                body: json,
            };
        }

        // Merge wildcard match and magic `mk_` querystring into response.
        _.forOwn(this.options.params, function(value, key) {
            if (this.data.body[key] === undefined) {
                this.data.body[key] = value;
            }
        }, this);
        // Expand random data with mock-random.
        this.data.body = generator(this.data.body);
    }
};

Response.prototype.json = function(location) {
   return JSON.parse(fs.readFileSync(location, 'utf8'));
};

Response.prototype.hbs = function(location) {
    var source = fs.readFileSync(location, 'utf8');
    var data = _.merge({}, this.options.params, this.options.overrides);
    var json = handlebars.compile(source)(data);
    return JSON.parse(json);
};

Response.prototype.js = function(location) {
    location = path.join(process.cwd(), location);
    var mod = require(location);
    // remove cache
    delete require.cache[require.resolve(location)];
    if (typeof mod === 'function') {
        return mod(_.merge({}, this.options.params, this.options.overrides));
    }
    return mod;
};

/**
 * Expand mixin and atom to a response object.
 */
Response.prototype.expand = function(location) {
    return new Response(location, {
        mount: this.options.mount
    });
};

/**
 * Recursively mix body data from other dataset.
 */
Response.prototype.mixin = function() {
    var data = this.data;
    var mixin, mixins;
    if (data.mixin) {
        if (typeof data.mixin === 'string') {
            mixins = [data.mixin];
        } else {
            mixins = data.mixin.slice();
        }
        while (mixin = mixins.shift()) {
            // recursively merge parent dataset
            mixin = this.expand(mixin);
            // only affect body data
            data.body = _.assign(mixin.body, data.body);
        }
    }
};

/**
 * Recursively expand data entry with atom data.
 */
Response.prototype.atom = function() {
    Utility.walk(this.data.body, function(value, key, object) {
        if (typeof value === 'string' && value.indexOf('atom://') === 0) {
            var atom = this.expand(value.slice(7));
            // only merge atom body
            object[key] = atom.body;
        }
    }, this);
};

/**
 * Override response field by magic overrides.
 */
Response.prototype.override = function() {
    _.forOwn(this.options.overrides, function(value, key) {
        Utility.set(this.data.body, key, value);
    }, this);
};

module.exports = Response;
