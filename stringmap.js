// stringmap.js
// MIT licensed, see LICENSE file
// Copyright (c) 2013 Olov Lassus <olov.lassus@gmail.com>

// A stringmap that handles problematic keys just fine
// For now "__proto__" is the only key that is handled specially
// Other problematic keys, if available in a JS VM near you (let me know),
//   can easily be moved to the aux object
var StringMap = (function() {
    "use strict";

    function stringmap(optional_object) {
        if (!(this instanceof stringmap)) {
            return new stringmap(optional_object);
        }
        this.obj = Object.create(null);
        this.aux = Object.create(null);
        if (optional_object) {
            this.setMany(optional_object);
        }
    }
    stringmap.prototype.get = function(key) {
        return (key === "__proto__" ? this.aux.proto : this.obj[key]);
    };
    stringmap.prototype.has = function(key) {
        return (key === "__proto__" ? "proto" in this.aux : key in this.obj);
    };
    stringmap.prototype.set = function(key, value) {
        if (key === "__proto__") {
            this.aux.proto = value;
        } else {
            this.obj[key] = value;
        }
    };
    stringmap.prototype.setMany = function(object) {
        if (object === null || (typeof object !== "object" && typeof object !== "function")) {
            throw new Error("StringMap expected Object");
        }
        var keys = Object.keys(object);
        for (var idx = 0; idx < keys.length; idx++) {
            var key = keys[idx];
            this.set(key, object[key]);
        }
        return this;
    };
    stringmap.prototype.merge = function(map) {
        var keys = map.keys();
        for (var idx = 0; idx < keys.length; idx++) {
            var key = keys[idx];
            this.set(key, map.get(key));
        }
        return this;
    };
    stringmap.prototype['delete'] = function(key) {
        var existed = this.has(key);
        if (key === "__proto__") {
            delete this.aux.proto;
        } else {
            delete this.obj[key];
        }
        return existed;
    };
    stringmap.prototype.keys = function() {
        var keys = Object.keys(this.obj);
        if (this.aux.proto) {
            keys.push("__proto__");
        }
        return keys;
    };
    stringmap.prototype.values = function() {
        var arr = this.keys();
        for (var idx = 0; idx < arr.length; idx++) {
            arr[idx] = this.get(arr[idx]);
        }
        return arr;
    };
    stringmap.prototype.items = function() {
        var arr = this.keys();
        for (var idx = 0; idx < arr.length; idx++) {
            arr[idx] = [arr[idx], this.get(arr[idx])];
        }
        return arr;
    };
    stringmap.prototype.map = function(fn) {
        var arr = this.keys();
        for (var idx = 0; idx < arr.length; idx++) {
            arr[idx] = fn(this.get(arr[idx]), arr[idx]);
        }
        return arr;
    };
    stringmap.prototype.forEach = function(fn) {
        var arr = this.keys();
        for (var idx = 0; idx < arr.length; idx++) {
            fn(this.get(arr[idx]), arr[idx]);
        }
    };
    stringmap.prototype.clone = function() {
        var other = stringmap();
        return other.merge(this);
    };
    stringmap.prototype.isEmpty = function() {
        for (var key in this.obj) {
            return false;
        }
        return !("proto" in this.aux);
    };
    stringmap.prototype.size = function() {
        var len = 0;
        for (var key in this.obj) {
            ++len;
        }
        return ("proto" in this.aux ? len + 1 : len);
    };
    stringmap.prototype.toString = function() {
        var self = this;
        return "{" + this.keys().map(function(key) {
            return JSON.stringify(key) + ":" + JSON.stringify(self.get(key));
        }).join(",") + "}";
    }
    return stringmap;
})();

if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
    module.exports = StringMap;
}
