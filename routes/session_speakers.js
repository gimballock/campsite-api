var Type = require('../type'),
    Resource = require('../resource');

var spec = {
    tableName : 'session_speakers',
    primary_key : 'id',
    schema : {
        "id" : { type : Type.Int, props : ["read_only", "default"] },
        "role" : { type : Type.Str, props : ["default"] },
        "biography" : { type : Type.Str, props : ["default"] },
        "session_id" : { type : Type.Int, props : ["required", "default"] },
        "speaker_id" : { type : Type.Int, props : ["required", "default"] },

        "speaker" : { type : Type.User, rel : "belongs_to", mapping : 'speaker_id' },
        "session" : { type : Type.Session, rel : "belongs_to", mapping : 'session_id' }
    }
};

var resource = new Resource(spec);
Type.SessionSpeaker.init(resource);

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