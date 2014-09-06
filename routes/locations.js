var Type = require('../type'),
    Resource = require('../resource');

var spec = {
    tableName : 'pd_locations',
    primary_key : 'id',
    schema : {
        "id"             : { type : Type.Int, props : ["read_only", "default"] },
        "address1"       : { type : Type.Str, props : ["default"] },
        "address2"       : { type : Type.Str, props : ["default"] },
        "city"           : { type : Type.Str, props : ["default"] },
        "state_province" : { type : Type.Str, props : ["default"] },
        "metro_area"     : { type : Type.Str, props : ["default"] },
        "latitude"       : { type : Type.Str, props : ["default"] },
        "longitude"      : { type : Type.Str, props : ["default"] },
    }
};

var resource = new Resource(spec);
Type.PdLocation.init(resource);

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
