var _ = require('lodash');

/**
 * Walk through object, execute callback on every primtive types.
 * @param {Object} object
 * @param {Function} callback
 * @param {Object} thisArg
 */
exports.walk = function(object, callback, thisArg) {
    _.forEach(object, function(value, key) {
        if (_.isObject(object[key])) {
            exports.walk(object[key], callback, thisArg);
        } else {
            // primtive types
            callback.call(thisArg, value, key, object);
        }
    });
};

/**
 * Exampe:
 *     var object = {
 *         a: {
 *             b: [0]
 *         }
 *     };
 *     set(object, 'a.b.0', 1);
 *     =>
 *     object.a.b === 1
 * @param {Object} object
 * @param {string} keys
 * @param {*} value
 */
exports.set = function(object, keys, value) {
    keys = keys.split('.');
    keys.reduce(function(obj, key, index) {
        if (index === keys.length - 1) {
            // last element
            obj[key] = value;
            return;
        }

        return obj[key] || (obj[key] = {});
    }, object);
    return object;
};
