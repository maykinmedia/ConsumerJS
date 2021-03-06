[![Build Status](https://travis-ci.org/maykinmedia/consumerjs.svg?branch=master)](https://travis-ci.org/maykinmedia/consumerjs)
[![Coverage Status](https://coveralls.io/repos/github/maykinmedia/consumerjs/badge.svg?branch=master)](https://coveralls.io/github/maykinmedia/consumerjs?branch=master)
[![Code Climate](https://codeclimate.com/github/maykinmedia/consumerjs/badges/gpa.svg)](https://codeclimate.com/github/maykinmedia/consumerjs)

[![NPM](https://nodei.co/npm/consumerjs.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/consumerjs/)
[![Sauce Test Status](https://saucelabs.com/browser-matrix/consumerjs.svg)](https://saucelabs.com/u/consumerjs)

# ConsumerJS
Consumerjs simplifies [REST](https://en.wikipedia.org/wiki/Representational_state_transfer) with an ORM like approach.
Built on top of Axios.

Consumerjs is an ORM-like repository/entity mapper that aims to make using RESTful JSON API's simple and 
[DRY](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself). It supports basic
[CRUD](https://en.wikipedia.org/wiki/Create,_read,_update_and_delete) operations on remote resources and can easiy be
extended with custom behaviour. 

ConsumerJS out of the box supports ([Django](https://www.djangoproject.com))
[CSRF](https://en.wikipedia.org/wiki/Cross-site_request_forgery) protection.

## Installation

Install with [npm](https://www.npmjs.com/).

```sh
$ npm i consumerjs --save
```

*As of 2.0.0: [@babel/polyfill](https://babeljs.io/docs/en/babel-polyfill) needs to be installed in your project  in
order to support older browsers like Internet Explorer 11.*

## Usage

*See [doc](doc/) for full API documentation.*

**Example:**

*data/post.js*
```js
import { CrudConsumer, CrudConsumerObject } from 'consumerjs';


class Post extends CrudConsumerObject {}


class PostConsumer extends CrudConsumer {
    constructor(endpoint='http://example.com/api/v1/posts/', objectClass=Post) {
        super(endpoint, objectClass);
    }
;}


export default PostConsumer;
```


**examples/my-app.js**
```js
import PostConsumer from '../data/post.js';


let postConsumer = new PostConsumer();
postConsumer.create()
    .then(someFunction)  // When promise resolves, call someFunction with new Post object
    .catch(errorFunction);  // When promise rejects, call errorFunction

    
//
// When a consumer receives a JSON array as result, an array of consumer objects is returned.
//

    
postConsumer.read()
    .then(someFunction)  // When promise resolves, call someFunction with all resolved Post objects
    .catch(errorFunction);  // When promise rejects, call errorFunction
    
    
let id = 1;
postConsumer.read(id)
    .then(someFunction)  // When promise resolves, call someFunction with resolved Post (with id 1)
    .catch(errorFunction);  // When promise rejects, call errorFunction
```


**examples/my-app2.js**
```js
// Internally, id is resolved using either "pk" or "id" field

post.title = 'some new title';
post.update()  // Saves changed fields to API using partial PATCH request
post.save()  // Save all fields to API using full PUT request
post.delete()  // Deletes this post using DELETE request
```

## Pagination

 > TODO: Document the usage of various `List` types and pagination. For now please see the [tests](test/) for examples.


## Concepts


ConsumerJS defines a few built-in classes, all of those should preferably be extended by a custom class implementing 
domain specific behaviour (if any):

- [Consumer](doc/consumer.md)
- [CrudConsumer](doc/crud-consumer.md)
- [ConsumerObject](doc/consumer-object.md)
- [CrudConsumerObject](doc/crud-consumer-object.md)

**Consumers (Consumer, CrudConsumer):**

*"Consumers" are classes that define how to perform operations on the remote API. It converts the results to* *"Consumer object" which contains a statefull representation of the API result.*

A consumer:
- Acts a data store fore fetching remote data.
- Can be used to convert human readable methods into DELETE, GET, PATCH POST and PUT requests.
- All requests return promises.
- Successfull API requests return promises for either an array (list) or a single consumer object (scalar).
- Failed API requests cause the promise to reject.
- Objects are cast to instances of a configurable consumer object class referenced by the consumers "objectClass" key.

*Consumers should be preferably be extended, configured and optionally, methods can be overwritten to change default
behaviour. Configuration should preferably be done in de constructor method:*


```js
/**
 * Configures Consumer instance
 * @param {string} endpoint Base endpoint for this API
 * @param {AbstractConsumerObject} objectClass Class to cast results to
 * @param {Object} [options] Additional configuration
 */
constructor(endpoint='http://example.com/api/v1/posts/', objectClass=Post, options=null) {
    super(endpoint, objectClass);
}
```

- Consumer: Simple "bare" consumer intended for use with custom methods.
- CrudConsumer: "Consumer with base methods for common CRUD operations.
    - `create([object])`, creates objecs.
    - `read([id])`, fetches all objects or a single object by id.

**Consumer objects (ConsumerObject, CrudConsumerObject):**

*"Consumer objects" are classes that define how to perform object specific operations on the remote API.*
*Consumer objects should be extended, configured and optionally methods can be overwritten to change default behaviour.*

A consumer object:
- Is the result of a resolved promise, gets passed to the promise's then() method.
- If the API returns an array (list), an array of object classes is returned.
- If the API returns a single object (scalar), a single object is returned.
- The consumer object class can have methods.
- The consumer object class keeps a reference to it's consumer using the "\__consumer__" key, this allows methods to talk back to the API.


*A reference to the consumer is kept using the \_\_consumer\_\_ property, (custom) methods can use this to communicate with the API.*

```js
customMethod(data) {
    return this.__consumer.__.post('/path/', data);  // CrudConsumerObject instances can use this.getPath() as path.
}
```

- ConsumerObject: Simple "bare" consumer object intended for use with custom methods.
- CrudConsumerObject: "Consumer object with base methods for common CRUD operations.
    - `update()`, persists changes made to object.
    - `save()`, fully saves object.
    - `delete()`, deletes this object.
