var Type = require('../type'),
    Resource = require('../resource'),
    common = require('../common'),
    __ = require("underscore");

var spec = {
    tableName : 'sponsor',
    primary_key : 'id',
    schema : {
        "id" : { type : Type.Int, props : ["default", "read_only"]},
        "creator_id" : { type : Type.Int, props : ["default"]},
        "image_id" : { type : Type.Int, props : ["default"]},
        "department_id" : { type : Type.Int, props : ["default"]},
        "name" : { type : Type.Str, props : ["default"]},
        "url" : { type : Type.Str, props : ["default"]},

        "image" : { type : Type.Media, rel : "belongs_to", props : ["default"], mapping : "image_id" },
        "creator" : { type : Type.User, rel : "belongs_to", mapping : "creator_id" },
    }
};

var resource = new Resource(spec);
Type.Sponsor.init(resource);

var single_handler = function (result) {
    if (__.has(result, "image") && __.has(result.image, "filename")) {
        result.image.uri = common.media_base_uri + result.image.filename;
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