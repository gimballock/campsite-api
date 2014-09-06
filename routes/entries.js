var Type = require('../type'),
    Resource = require('../resource');

var spec = {
    tableName : 'idea',
    primary_key : 'id',
    user_mapping : { user : 'id', me : 'creator_id' },
    schema : {
        "id" : { type : Type.Int, props : ["default", "read_only"] },
        "image_id" : { type : Type.Int, props : ["no-filter"] },
        "name" : { type : Type.Str, props : ["default", "required"] },
        "createdAt" : { type : Type.Date, props : ["read_only"] },
        "description" : { type : Type.Str, props : ["required"] },
        "members" : { type : Type.Str, props : ["default"] },
        "highestRound" : { type : Type.Int, props : ["read_only"] },
        "isPrivate" : { type : Type.Bool, props : ["default", "no-filter"] },
        "entrySet_id" : { type : Type.Int, props : ["required"] },
        "creator_id" : { type : Type.Int, props : ["default", "read_only"] },

        "entrySet" : { type : Type.List, rel : "belongs_to", mapping : 'id' },
        "creator" : { type : Type.User, rel : "belongs_to", mapping : 'id' },

        // "voters" : { type : Type.User,    
        //                   rel : "belongs-to-many",
        //                   via : Type.Vote, mapping : { "user" : Type.User, "idea" : Type.Entry},      
        //                   limit : 10, sort_by : "name" },
    }
};

var resource = new Resource(spec);
Type.Entry.init(resource);

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