campsite-api
============

RESTful API for campsite.org

### Setup and configuration:

Background: The Campsite API is written in Javascript using Node.js.  Dependencies are managed by npm (Node package manager) using the packages.json configuration file. 

Dependiences used:
* restify.js: Similar to the express framework but much smaller and targeted for simple RESTful APIs
* knex.js: Simple database interface with support for functional patterns like promises and raw SQL support.
* crypto.js: To handle password salting and hashing
* bunyan: Simple logger to trace connection requests.
* underscore.js: utility functions: find, filter, each, map, join, etc (very usefull)

There are no hard version requirements on node beyond what the dependiences require.

### Install and configuration 
##### Development Environment: 
To start the service run the api.js file using:
> node api.js

Send requests to localhost:3000 from the same machine.

For testing I recommend using node-inspector, a web based debugging environment. To install:
> sudo npm install node-inspector -g

To use node-inspector start node inspector then start the api with the  '--debug' flag:

> node-inspector&

> node --debug api.js

Finally visit `http://127.0.0.1:8080/debug?port=5858` to step through the code.

I also recommend a few Chrome plugins:
* `JSONView`: To see JSON API responses nicely formatted
* `POSTMAN`: To send API requestes with custom headers and bodies.  You can also use the commandl line tool cURL if you prefer.

##### Production Environment
To start the service in a production environment you may wish to use forever.js to start the API as a daemon service.  Forever.js will automatically restart the API if it crashed.  To install forever run 
> sudo npm install forever -g
 
Basic commands to start/stop the API:
* `forever list`: Displays process information about the running api process.
* `forever start api.js`: Starts the file api.js.  Note this must be run from the node-api directory.
* `forever stopall`: Stops stops the service.

On the production server there is a virtual host entry to proxy requests from the hostname `api.campsite.org:80` to `localhost:3000` so api.campsite.org is accessable from anywhere.

Now you can go to localhost:3000 from your browser.  You should see:
{
    code: "ResourceNotFound",
    message: "/ does not exist"
}

### API Usage

##### Basic resources:

***Sponsors*** are basically a company name, an image link, and a company url.
Ex. `http://api.campsite.org/sponsors/31`

    {
        id: 31,
        creator_id: 5,
        image_id: 211,
        name: "IBM",
        url: "http://www.ibm.com",
        image: 
        {
            id: 211,
            owner_id: 5,
            name: "IBM",
            description: null,
            mimeType: "image/jpeg",
            filename: "ibm-logo-3-v3-200x142.jpg",
            size: 6693,
            uri: "http://platformd-public.s3.amazonaws.com/media/ibm-logo-3-v3-200x142.jpg"
        }
    }


***Sponsorships*** show a sponsors connection to a Campsite group or event.  Sponsorships contain a sponsor id and either a group or an event id.  The api call will automatically expand the group/event and the sponsor.  
Ex: http://api.campsite.org/sponsorships/21

    {
        id: 21,
        sponsor_id: 11,
        group_id: 21,
        event_id: null,
        global_event_id: null,
        level: 1,
        status: "sponsoring",
        sponsor: {
            id: 11,
            creator_id: 5,
            image_id: 41,
            department_id: 2641,
            name: "Alpine Data Labs",
            url: "http://www.alpinenow.com"
        },
        grp: {
            id: 21,
            name: "BigDataCamp",
            category: "topic",
            slug: "bigdatacamp",
            featured: 1,
            location_id: 21
        },
        event: {}
    }
 
***Sessions*** have an event id, a name, and a start and end time. 
For example: http://api.campsite.org/sessions/41

    {
        id: 41,
        name: "Intro to Big Data",
        starts_at: "2014-03-01T18:00:00.000Z",
        ends_at: "2014-03-01T18:30:00.000Z",
        event_id: 401
    }

Beyond sponsors, sponsorships, and sessions there are also events, groups, users, lists, and entries to name a few.  

You can control the information that is returned in two ways.  

First there are some details that are not returned by default which you can access with the ***verbose*** query parameter:
* http://api.campsite.org/sponsors/31?verbose
* http://api.campsite.org/sponsorships/21?verbose
* http://api.campsite.org/sessions/41?verbose

If instead you want the api to return less information you can select the specific fields you want returned using the ***fields*** query parameter along with a list of the fields you are interested in.  This is particularly useful when api calls are slow to load such as listing all sponsorships.
Examples requesting only a few fields:
* http://api.campsite.org/sponsors/31?fields=id,name,url
* http://api.campsite.org/sponsorships/21?fields=fields=id,sponsor.name,grp.name
* http://api.campsite.org/sessions/41?fields=name,starts_at,ends_at

##### Collections:

Now that you know how to get information about individual entities using the form `api.campsite.org/<sessions|sponsors|etc>/<id number>` we can talk about ***collections*** of entities.  For each entity type you can request all values by leaving out the id number.  For example:
* http://api.campsite.org/sponsors
* http://api.campsite.org/sponsorships
* http://api.campsite.org/sessions

**Note:** The second call here is particularly slow.

The first thing you can do with collections is control the sorting of the results by including a ***sort_by*** query parameter:
* http://api.campsite.org/sessions?sort_by=-name,starts_at
* http://api.campsite.org/sponsors?sort_by=level,-name
* http://api.campsite.org/sponsorships?sort_by=level,-sponsor.name&limit=100

Note use of **limit** here to reduce the amount of data returned and consequently the response time.

You can include a minus sign ‘-’ to change from descending to ascending.  Also you can include additional fields names, separated by comma, to use as tie breakers when elements have the same value.
 
***Pagination*** is a way of requesting subsets of the full response without altering the ordering of the full response.  This feature consists of two query parameters: `limit`, and `offset`.  For example a request for all sponsorships would return 2973 individual entries.  We can restrict the response to just 10 by using `‘limit=10’`.  To request the next 10 sponsorships after that (elements 20 through 30) we would use `‘offset=10’`. To get the next page of 10 entries after that use `offset=20`, then `offset=30` and so on.
* http://api.campsite.org/sponsorships
* http://api.campsite.org/sponsorships?limit=10
* http://api.campsite.org/sponsorships?limit=10&offset=10
* http://api.campsite.org/sponsorships?limit=10&offset=20

***Filtering*** is another way to reduce the response size of potentially large requests.  This feature lets you request entities matching certain conditions.  Say for example you want a list of all sessions with ‘data’ in the name. For this you would use the query parameter `‘name=~data’`.

    http://localhost:3000/sessions?name=~data

Most fields of a resource are filterable.  For sessions can you filter by: `name`, `id`, `starts_at`, `ends_at`, `event_id`, `speaker_id`, `room`, `slides_link`, and `speaker_bio`.  Similarly for sponsorships and sponsors you can filter by basically every field.

Technically speaking each field of a resource is filterable by default unless the `no-filter` property is added. Resources are defined in the `Routes` directory.

Each field has an associated data type and each data type has different filtering features.  For example `string` types such as `session.name` can be filtered using an exact match or using a substring match as in our example above (exact match is the default, use the ‘~’ after the ‘=’ for substring match). 
`Integer` type filters such as `session.id` can be filtered using an exact match, or a less than or greater than match.  For example all sponsors with id number below 100:
> http://api.campsite.org/sponsors?id=<100

Similarly date types like `session.starts_at` can use less than and greater than. 

Additionally you can include multiple matches by including a comma delimited list.  For example if you want to show exactly sponsors 21,31,and 41 you would use this api call:
> http://api.campsite.org/sponsors?id=21,31,41

One more powerful feature is the ability to filter by expanded resources. Some resources such as groups contain subresources in their response. For example `http://api.campsite.org/groups/1391?fields=id,owner`

    {
        id: 1391,
        owner: 
        {
            id: 1044,
            username: "eric",
            email: "eric+1@platformd.com",
            name: "Eric Price"
        }
    }

You cannot filter a group by it’s owner’s name in the same way you would filter by a direct attribute of the group.  Fortunately there is a way for performing these types of filters:
> http://api.campsite.org/groups?owner=’username=eric’

The notation is a bit weird with the two equals but you should read it as owner.username = ‘eric’.  For technical reasons the subfield ‘username’ needs to be on the right side of the first equals sign along with the filter value ‘eric’ so the ‘=’ character is used to separate these two values. 

Note however that you cannot filter by any additional levels of indirection. So for example it would not be possible to list groups containing events owned by a particular user.
