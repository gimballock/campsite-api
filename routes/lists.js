var Type = require('../type'),
    Resource = require('../resource'),
    common = require('../common'),
    knex = common.knex,
    __ = require('underscore');

Type.List.Type.init(
    //validator
    function (value) {
        return (value === 'idea' || value === 'session' || value === 'thread');
    },
    //default operator
    function (column, query, value) {
        query.where(column, value);
    },
    //prefix operator
    {}
);

var list_size_spec = {
    tableName : "(SELECT entrySet_id, count(entrySet_id) as size FROM campsite.idea GROUP BY entrySet_id)",
    primary_key : 'entrySet_id',
    schema : {
        //"id" : { type : Type.Int, props : [] },
        "size" : { type : Type.Int, props : ["default"] },
    }
};
Type.List.Size.init(new Resource(list_size_spec));


var group_parent_spec = {
    tableName : "(SELECT groups.*, reg.id as reg_id FROM campsite.pd_groups as groups JOIN campsite.entry_set_registry as reg ON groups.id = reg.containerId)",
    primary_key : 'reg_id',
    schema : {
        //"id" : { type : Type.Int, props : [] },
        "name" : { type : Type.Str, props : ["default"] },
    }
};
Type.List.GroupParent.init(new Resource(group_parent_spec));

var event_parent_spec = {
    tableName : "(SELECT events.*, reg.id as reg_id FROM campsite.group_event as events JOIN campsite.entry_set_registry as reg ON events.id = reg.containerId)",
    primary_key : 'reg_id',
    schema : {
        //"id" : { type : Type.Int, props : [] },
        "name" : { type : Type.Str, props : ["default"] },
    }
};
Type.List.EventParent.init(new Resource(event_parent_spec));


var spec = {
    tableName : 'entry_set',
    primary_key : 'id',
    user_mapping : { user : 'id', me : 'creator_id'},
    schema : {
        "id" : { type : Type.Int, props : ["default", "read_only"] },
        "name" : { type : Type.Str, props : ["default", "required"] },
        "type" : { type : Type.List.Type, props : ["default"] },
        "isVotingActive" : { type : Type.Bool, props : [] },
        "isSubmissionActive" : { type : Type.Bool, props : [] },
        "allowedVoters" : { type : Type.Str, props : ["default"] },
        "description" : { type : Type.Str, props : ["default", "required"] },
        "entrySetRegistration_id" : { type : Type.Int, props : ["default", "required"] },
        "creator_id" : { type : Type.Int, props : ["read_only"] },

        "creator" : { type : Type.User, rel : "belongs_to", mapping : "creator_id" },
        "list_size" : { type : Type.List.Size, rel : "belongs_to", mapping : 'id' },
        "entrySetRegistration" : { type : Type.Registry, rel : "belongs_to", mapping : "entrySetRegistration_id" },
        "group_parent" : { type : Type.List.GroupParent, rel : "belongs_to", mapping : "entrySetRegistration_id" },
        "event_parent" : { type : Type.List.EventParent, rel : "belongs_to", mapping : "entrySetRegistration_id" }
    }
};

var resource = new Resource(spec);
Type.List.init(resource);

var pre_single_handler = function (req) {
    if (__.has(req.query, 'fields')) {
        var fields = req.query.fields.split(',');
        // var i_g = array.indexOf('group_parent');
        // var i_e = array.indexOf('group_event');
        var i_p = fields.indexOf('parent');
        if (i_p > -1) {
            fields.splice(i_p, 1);
            fields.push("entrySetRegistration");
            fields.push("group_parent");
            fields.push("event_parent");
            req.query.fields = fields.join(',');
        }
    }
};

var single_handler = function (result) {
    if (__.has(result, "entrySetRegistration") &&
            __.has(result.entrySetRegistration, "scope") &&
            __.has(result, "group_parent") &&
            __.has(result, "event_parent")) {

        var scope = result.entrySetRegistration.scope;
        if (scope === 'GroupBundle:Group') {
            result.parent = result.group_parent;
            result.parent.type = "Group";
        } else if (scope === 'EventBundle:GroupEvent') {
            result.parent = result.event_parent;
            result.parent.type = "Event";
        } else {
            result.parent = {};
            result.parent.type = scope.split(":")[1];
        }

        result.parent.id = result.entrySetRegistration.containerId;
        delete result.event_parent;
        delete result.group_parent;
        delete result.entrySetRegistration;
    }

    if (__.has(result, "list_size")) {
        var size = result.list_size.size;
        delete result.list_size;
        result.list_size = (size === null) ? 0 : size;
    }
    return result;
};

var pre_group_handler = function (req) {
    //strip out the quotes, add new param, then add quotes back
    var scope_block_filter;
    if (__.has(req.query, 'entrySetRegistration')) {
        /*jslint regexp: true*/
        scope_block_filter = req.query.entrySetRegistration.replace(/['|"]([^'"]*)['|"]/, "'$1,scope=!~site'");
    } else { scope_block_filter = "'scope=!~site'"; }
    req.query.entrySetRegistration = scope_block_filter;

    pre_single_handler(req);

    if (__.has(req.query, 'sort_by')) {
        var sort_by = req.query.sort_by.split(',');
        var i = sort_by.indexOf('list_size');
        if (i > -1) {
            sort_by.splice(i, 1);
            sort_by.push("list_size.size");
            req.query.sort_by = sort_by.join(',');
        }
    }
};

var group_handler = function (result_set) {
    __.each(result_set, single_handler);
    return result_set;
};

exports.find_all = function (req, resp, next) {
    pre_group_handler(req);
    return resource.find_all(req, resp, next, group_handler);
};

exports.find_by_primary_key = function (req, resp, next) {
    pre_single_handler(req);
    return resource.find_by_primary_key(req, resp, next, single_handler);
};

exports.create = function (req, resp, next) {
    return resource.create(req, resp, next);
};

exports.delete_by_primary_key = function (req, resp, next) {
    return resource.delete_by_primary_key(req, resp, next);
};

exports.find_popular = function (req, resp, next) {
    knex('idea')
        .join('entry_set', 'entry_set.id', '=', 'idea.entrySet_id')
        .select('entry_set.id', 'entry_set.name')
        .count('idea.id AS popularity')
        .groupBy('entry_set.id')
        .orderBy('popularity', 'DESC')
        .then(function (results) {
            resp.send(results);
            next();
            return;
        });
};

exports.get_sorted_entries = function (req, resp, next) {

    var query = knex('follow_mappings')
        .join('idea', 'idea.id', '=', 'follow_mappings.idea')
        .select('idea.id', 'idea.name', 'idea.entrySet_id')
        .count('follow_mappings.idea AS popularity')
        .groupBy('follow_mappings.idea')
        .orderBy('popularity', 'DESC')
        .where('idea.entrySet_id', req.params.id);

    query.then(function (results) {
        resp.send(results);
        next();
        return;
    });
};