var __ = require('underscore');

var Type = function () { return; };
module.exports = Type;


//---------------------------------------------
//-------- Primitave Type Declarations -------- 
//---------------------------------------------
Type.Int = new Type();
Type.Bool = new Type();
Type.Str = new Type();
Type.Date = new Type();

//--------------------------------------------



Type.prototype.init = function (validator, default_filter, prefix_filters) {
  this.validate = validator || function () { return; };
  this.default_filter = default_filter;
  this.prefix_filters = prefix_filters;
};

Type.prototype.apply_filter = function (column, query, value) {
    var filter = this.default_filter;
    var raw_value = value;

    __.find(this.prefix_filters, function (pf, prefix) {
        if (value.indexOf(prefix) === 0) {
            filter = pf;
            raw_value = value.substring(prefix.length);
            return true;
        }
        return false;
    });

    //validate or die
    if (!this.validate(raw_value)) { throw new Error("'" + raw_value + "' invalid"); }

    //apply filter
    filter(column, query, raw_value);
};

Type.prototype.list_validate = function (value, single_validate) {
    if(typeof value !== "string")
        return single_validate(value);

    var value_parts = value.split(',');
    
    if(value_parts.length <= 0) {
        return false;
    } else if(value_parts.length === 1) {
        return single_validate(value);
    } else {
        var all_good = true;
        __.each(value_parts, function (single_value) {
            all_good = all_good && single_validate(single_value);
        });
        return all_good;
    }
};

Type.prototype.list_filter = function (column, query, value, op, value_transformer) {
    if(__.isUndefined(op))
        op = '=';

    if(__.isUndefined(value_transformer))
        value_transformer = function(value) { return value; };

    var value_parts = value.split(',');
    
    if(value_parts.length <= 0) {
        return;
    } else if(value_parts.length === 1) {
        query.where(column, op, value_transformer(value));
    } else {
        query.where(function() {
            var that = this;
            __.each(value_parts, function (single_value) {
                if(!__.isUndefined(value_transformer))
                    single_value = value_transformer(single_value);

                that.orWhere(column, op, single_value);
            });
        });
        //console.log(query.toString());
    }
};

// NOTE: The order in which you define your prefix filters is important. 
// Ensure that 
//--------------------------- Primitive Types --------------------------------

Type.Int.init(
    //validator
    function (value) {
        return Type.prototype.list_validate(value, function (val) {
            return !isNaN(val);
        });
    },

    //default filter
    function (column, query, value) {
        Type.prototype.list_filter(column, query, value);
    },

    //prefix filters
    {
        '>=': function (column, query, value) {
            Type.prototype.list_filter(column, query, value, '>=');
        },
        '<=': function (column, query, value) {
            Type.prototype.list_filter(column, query, value, '<=');
        },
        '<': function (column, query, value) {
            Type.prototype.list_filter(column, query, value, '<');
        },
        '>': function (column, query, value) {
            Type.prototype.list_filter(column, query, value, '>');
        },
    }
);


Type.Bool.init(
    //validator
    function (val) {
        if (typeof val === 'boolean' || val === '1' || val === '0') {
            return true;
        }
        val = val.toLowerCase();
        return val === 'true' || val === 'false';
    },

    //default filter
    function (column, query, value) {
        value = value.toLowerCase();
        var real_value = (value === 'true' || value === '1') ? true : false;
        query.where(column, '=', real_value);
    },

    //prefix filters
    {}
);


Type.Str.init(
    //validator
    function (val) {
        return Type.prototype.list_validate(val, function (val) {
            return val !== "";
        });
    },

    //default filter
    function (column, query, value) {
        Type.prototype.list_filter(column, query, value, 'like');
    },

    //prefix filters
    {
        '!~': function (column, query, value) {
            Type.prototype.list_filter(column, query, value, 'not like', function(value) { return "%" + value + "%"; });
        },
        '~': function (column, query, value) {
            Type.prototype.list_filter(column, query, value, 'like', function(value) { return "%" + value + "%"; });
        },
        '!': function (column, query, value) {
            Type.prototype.list_filter(column, query, value, '<>');
        }
    }
);


Type.Date.init(
    //validator
    function (val) {
        return !isNaN((new Date(val)).valueOf());
    },

    //default filter
    function (column, query, value) {
        query.where(column, value);
    },

    //prefix filters
    {
        '<=': function (column, query, value) {
            query.where(column, '<=', new Date(value));
        },
        '>=': function (column, query, value) {
            query.where(column, '>=', new Date(value));
        },
        '<': function (column, query, value) {
            query.where(column, '<', new Date(value));
        },
        '>': function (column, query, value) {
            query.where(column, '>', new Date(value));
        },
    }
);