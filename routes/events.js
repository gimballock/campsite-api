var Type = require('../type'),
    Resource = require('../resource');

Type.Event.RegOpt.init(
    //validator
    function (value) {
        return value === 'REGISTRATION_3RDPARTY' || value === 'REGISTRATION_ENABLED';
    },
    //default filter
    function (column, query, value) {
        query.where(column, value);
    },
    //prefix_filters
    {}
);

var spec = {
    tableName : 'group_event',
    primary_key : 'id',
    user_mapping : { user : 'id', me : 'user_id' },
    deleted_col : 'deleted',
    schema : {
        "id" : { type : Type.Int, props : ["default", "read-only"] },
        "name" : { type : Type.Str, props : ["required", "default"] },
        "content" : { type : Type.Str, props : ["default", "required"] },
        "online" : { type : Type.Bool, props : ["default"], initial : true },
        "location" : { type : Type.Str, props : ["default"] },
        "address1" : { type : Type.Str, props : ["default"] },
        "address2" : { type : Type.Str, props : ["default"] },
        "private" : { type : Type.Bool, props : [], initial : false },
        
        "registration_option" : { type : Type.Event.RegOpt, props : ["no-filter"], initial : 'REGISTRATION_ENABLED' },
        "external_url" : { type : Type.Str, props : ["no-filter"] },
        
        "starts_at" : { type : Type.Date, props : ["default"] },
        "ends_at" : { type : Type.Date, props : ["default"] },
        
        // ---- hard coded / unused features ----
        "timezone" : { type : Type.Str, props : ["read-only"], initial : 'UTC'},
        "active" : { type : Type.Int, props : ["read-only"], initial : true },
        "approved" : { type : Type.Int, props : ["read-only"], initial : true },
        
        // ---- context mappings ----
        "user_id" : { type : Type.Int, props : [] },
        "group_id" : { type : Type.Int, props : ["default", "required"] },
        "entrySetRegistration_id" : { type : Type.Int, props : ["default"] },
     
        // ---- Read-only ----
        "attendeeCount" : { type : Type.Int, props : ["read-only"] },
        "latitude" : { type : Type.Str, props : ["read-only"] },
        "longitude" : { type : Type.Str, props : ["read-only"] },
        "created_at" : { type : Type.Date, props : ["read-only"] },
        "updated_at" : { type : Type.Date, props : ["read-only"] },
        "currentRound" : { type : Type.Int, props : ["read-only"] },
        
        // ---- Belongs to relations ----
        "parent_group" : { type : Type.Group, rel : "belongs_to", mapping : 'group_id' },
        "user" : { type : Type.User, rel : "belongs_to", mapping : 'user_id' },
        "entrySetRegistration" : { type : Type.Registry, rel : "belongs_to", mapping : "entrySetRegistration_id" }
    }
};

var resource = new Resource(spec);
Type.Event.init(resource);


exports.find_all = function (req, resp, next) {
    return resource.find_all(req, resp, next);
};

exports.find_by_primary_key = function (req, resp, next) {
    return resource.find_by_primary_key(req, resp, next);
};

exports.create = function (req, resp, next) {
    //create event
    //create registry entry
    //update event w/ registry entry
    return resource.create(req, resp, next);
};

exports.delete_by_primary_key = function (req, resp, next) {
    return resource.delete_by_primary_key(req, resp, next);
};