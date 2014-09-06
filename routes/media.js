var Type = require('../type'),
    Resource = require('../resource'),
    common = require('../common'),
    __ = require("underscore");

var spec = {
    tableName : 'pd_media',
    primary_key : 'id',
    deleted_col : 'removed',
    schema : {
        "id" : { type : Type.Int, props : ["default", "read_only"]},
        "owner_id" : { type : Type.Int, props : ["default"]},
        "name" : { type : Type.Str, props : ["default"]},
        "description" : { type : Type.Str, props : ["default"]},
        "mimeType" : { type : Type.Str, props : ["default"]},
        "filename" : { type : Type.Str, props : ["default"]},
        "size" : { type : Type.Int, props : ["default"]},
        "createdAt" : { type : Type.Date, props : ["read_only"]},
        "updatedAt" : { type : Type.Date, props : ["read_only"]}
    }
};

var resource = new Resource(spec);
Type.Media.init(resource);

var single_handler = function (result) {
    if (__.has(result, "filename") ) {
        result.uri = common.media_base_uri + result.filename;
    }
    return result;
};

var collection_handler = function (result_set) {
    __.each(result_set, single_handler);
    return result_set;
};

exports.find_all = function (req, resp, next) {
    return resource.find_all(req, resp, next, collection_handler);
};

exports.find_by_primary_key = function (req, resp, next) {
    return resource.find_by_primary_key(req, resp, next, single_handler);
};

exports.create = function (req, resp, next) {
    return resource.create(req, resp, next);
};

exports.delete_by_primary_key = function (req, resp, next) {
    return resource.delete_by_primary_key(req, resp, next);
};