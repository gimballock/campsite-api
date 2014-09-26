var Type = require('../type'),
    Resource = require('../resource'),
    common = require('../common'),
    __ = require('underscore');

var spec = {
    tableName : 'fos_user',
    primary_key : 'id',
    schema : {
        "id" : { type : Type.Int, props : ["default", "read_only"]},
        "username" : { type : Type.Str, props : ["default","required"]},
        "email" : { type : Type.Str, props : ["default","required"]},

        "username_canonical" : { type : Type.Str, props : ["required"]},
        "email_canonical" : { type : Type.Str, props : ["required"]},

        "country" : { type : Type.Str, props : []},
        "created" : { type : Type.Date, props : ["read_only"]},
        "updated" : { type : Type.Date, props : ["read_only"]},
        "about_me" : { type : Type.Str, props : []},
        "name" : { type : Type.Str, props : ["default"]},
        "organization" : { type : Type.Str, props : []},
        "title" : { type : Type.Str, props : []},
        "industry" : { type : Type.Str, props : []},
        "linkedIn" : { type : Type.Str, props : []},
        "professionalEmail" : { type : Type.Str, props : []},
        "twitterUsername" : { type : Type.Str, props : []},
        "website" : { type : Type.Str, props : []},
        "mailingAddress" : { type : Type.Str, props : []},

        "enabled" : { type : Type.Bool, props : [], initial : false },
        "salt" : { type : Type.Str, props : [] },
        "password" : { type : Type.Str, props : ["required"] },
        "roles" : { type : Type.Str, props : [] },
        "locale" : { type : Type.Str, props : [], initial : "en" },
        "created" : { type : Type.Date, props : [] },
        "updated" : { type : Type.Date, props : [] },
        "displayProfile" : { type : Type.Bool, props : [] },
        "displayPrivateInfoToOrganizers" : { type : Type.Bool, props : [] }

        //"confirmation_token" : { type : Type.Str, props : ["default"]},
        //"password_requested_at" : { type : Type.Date, props : ["default"]},
        //"roles" : { type : Type.Str, props : ["default"]},
        //"ipAddress" : { type : Type.Str, props : [, "read_only"]},
        //"uuid" : { type : Type.Str, props : [, "read_only"]},
        //"gallary_id" : { type : Type.Int, props : []},
        //"faceprintId" : { type : Type.Int, props : [, "read_only"]},
        //"faceprint_image" : { type : Type.Int, props : [, "read_only"]},
    }
};

var resource = new Resource(spec);
Type.User.init(resource);

var get_now = function () {
    return new Date();
};

var single_handler = function (result) {
    delete result.username;
    delete result.username_canonical;
    delete result.email;
    delete result.email_canonical;
    delete result.salt;
    delete result.password;
    delete result.roles;

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

    var process_user = function (user) {
        //use random salt regardless of value
        user.salt = common.make_salt();

        //Can only create standard users
        user.roles = 'a:0:{}';

        var now = new Date();
        user.created = now;
        user.updated = now;

        if(!user.locale)
            user.locale = 'en';

        //replace plain text password with salted hashed password
        if(user.password) {
            user.password = common.hash_password(req.body.password, req.body.salt)
        }

        if(!user.displayProfile) {
            user.displayProfile = true;
        }

        if(!user.displayPrivateInfoToOrganizers) {
            user.displayPrivateInfoToOrganizers = true;
        }
    };

    if( __.isArray(req.body) ) {
        __.each(req.body, process_user);
    } else {
        process_user(req.body);
    }

    return resource.create(req, resp, next);
};

exports.delete_by_primary_key = function (req, resp, next) {
    return resource.delete_by_primary_key(req, resp, next);
};