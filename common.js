var knex = require('knex'),
    crypto = require('crypto'),
    config = require('./config_data.json');

var knexInstance = knex.initialize( config.db_config );

exports.knex = knexInstance;

var baseHost = 'localhost';
exports.baseHost = baseHost;

var basePort = 3000;
exports.basePort = basePort;

var baseProtocol = 'http';
exports.baseProtocol = baseProtocol;

var baseUrl = baseProtocol + '://' + baseHost + ':' + basePort;
exports.baseUrl = baseUrl;

var default_page_limit = 20;
exports.default_page_limit = default_page_limit;

exports.uuid_regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
exports.security_relm_login = "www.campsite.org";
exports.security_relm_token = "api.campsite.org, user:<api-key>, pass:<none>";

exports.media_base_uri = 'http://platformd-public.s3.amazonaws.com/media/';

var password_algorithm = 'sha512';
var password_iterations = 1;
var password_encoding = 'hex';

exports.hash_password = function (password, salt) {
    var merged_pass = password + "{" + salt + "}";

    var digest = crypto.createHash(password_algorithm)
        .update(merged_pass)
        .digest();

    var i;
    for (i = 1; i < password_iterations; i++) {
        digest = crypto.createHash(password_algorithm, digest + merged_pass).digest();
    }

    var new_hashed_password = new Buffer(digest).toString(password_encoding);
    return new_hashed_password;
};

exports.make_salt = function() {
    return crypto.createHash('md5').update(""+Date.now()/1000).digest('hex');
};