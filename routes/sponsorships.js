var Type = require('../type'),
    Resource = require('../resource'),
    common = require('../common'),
    __ = require("underscore"),
    knex = common.knex;

var spec = {
    tableName : 'sponsor_registry',
    primary_key : 'id',
    schema : {
        "id" : { type : Type.Int, props : ["default", "read_only"]},
        "sponsor_id" : { type : Type.Int, props : ["default"]},
        "group_id" : { type : Type.Int, props : ["default"]},
        "event_id" : { type : Type.Int, props : ["default"]},
        "global_event_id" : { type : Type.Int, props : ["default"]},
        "level" : { type : Type.Int, props : ["default"]},
        "status" : { type : Type.Str, props : ["default"] },
        
        "sponsor" : { type : Type.Sponsor, rel : "belongs_to", props : ["default"], mapping : "sponsor_id" },
        "grp" : { type : Type.Group, rel : "belongs_to", props : ["default"], mapping : "group_id" },
        "event" : { type : Type.Event, rel : "belongs_to", props : ["default"], mapping : "event_id" },
    }
};

var resource = new Resource(spec);
Type.Sponsorship.init(resource);

var single_handler = function (result) {
    if (__.has(result, "image") && __.has(result.image, "filename")) {
        result.image.uri = common.media_base_uri + result.image.filename;
    }
    return result;
};

var collection_handler = function (result_set, resp, next) {
    if(result_set.length > 0 
        && __.has(result_set[0], "sponsor") 
        && __.has(result_set[0].sponsor, "image_id") ) {

        var query = knex('pd_media').select('id', 'filename');
        
        __.each(result_set, function (result) {
            var id = result.sponsor.image_id;
            query.orWhere('id', id);

            if( __.has(result,'event') && __.has(result.event,'id') && __.isNull(result.event.id)) {
                delete result.event;
            }

            if( __.has(result,'grp') && __.has(result.grp,'id') && __.isNull(result.grp.id)) {
                delete result.grp;
            }
        });

        query.then(function (results) {
            __.each(results, function (result){
                var image_id = result.id;
                var sponsorships = __.filter(result_set, function (sponsorship) {
                    return sponsorship.sponsor.image_id === image_id;
                });

                __.each(sponsorships, function(sponsorship) {
                    sponsorship.sponsor.image_uri = common.media_base_uri + result.filename;
                });
            });

            resp.send(result_set);
            next();
            return;
        });

        return false;
    }
    return result_set;
};

exports.find_all = function (req, resp, next) {
    return resource.find_all(req, resp, next, collection_handler);
};

exports.find_by_primary_key = function (req, resp, next) {
    return resource.find_by_primary_key(req, resp, next);
};

// exports.create = function (req, resp, next) {
//     return resource.create(req, resp, next);
// };

// exports.delete_by_primary_key = function (req, resp, next) {
//     return resource.delete_by_primary_key(req, resp, next);
// };