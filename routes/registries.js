var Type = require('../type'),
    Resource = require('../resource');

var spec = {
    tableName : 'entry_set_registry',
    primary_key : 'id',
    schema : {
        "id" : { type : Type.Int, props : ["default", "read-only"]},
        "scope" : { type : Type.Str, props : ["default", "required"]},
        "containerId" : { type : Type.Int, props : ["default", "required"]},
    }
};

var resource = new Resource(spec);
Type.Registry.init(resource);

exports.find_all = function (req, resp, next) {
    return resource.find_all(req, resp, next);
};

exports.find_by_primary_key = function (req, resp, next) {
    return resource.find_by_primary_key(req, resp, next);
};

exports.create = function (req, resp, next) {
    return resource.create(req, resp, next);
};

exports.delete_by_primary_key = function (req, resp, next) {
    return resource.delete_by_primary_key(req, resp, next);
};