# Info

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/ovidiuionut94/djin/master/LICENSE) 
[![NSP Status](https://nodesecurity.io/orgs/djin/projects/a1c8849c-bf3d-4cdc-9e6c-262e388ca165/badge)](https://nodesecurity.io/orgs/djin/projects/a1c8849c-bf3d-4cdc-9e6c-262e388ca165)
[![Code Climate](https://codeclimate.com/github/ovidiuionut94/djin/badges/gpa.svg)](https://codeclimate.com/github/ovidiuionut94/djin)

Magical MySql query builder that takes as input a json object and makes it blossom into real data

# First steps
- Install the 'wish granter' (Obviously)

```
npm install --save djin
```
        
- Easy peasy lemon squeezy

```js
const Djin = require('djin')

const djin = new Djin({
  host: <database_server>
  user: <database_user>
  password: <database_password>
  databse: <database_name>
})

```

### Initialize the djin
   
```js
// This operation must be done only once.
// Shortly, under the hood, the djin will take the database structure, together with all the foreign keys 
// from the given database (so, be sure that all the related tables have the required foreign keys created) 
// and cache them in a JSON file, on the running server, so the queries can be created asap.

djin.initialize()
  .then(() => {
    // We have the djin initialized
  })
  .catch((error) => {
    // Do something with this ^
  })
```

or you can try

```js
(async () => {
  await djin.initialize()
})()
```

ooooor

```js
async function initializeDjin() {
  await djin.initialize()
}
initializeDjin()
```

### Let the games begin
In order to explain how this query builder works, a small database diagram will be used as an example. <b> (eyes down) </b>
![databasediagram](https://user-images.githubusercontent.com/11486739/27407362-ae69782c-56e0-11e7-92d7-e3690f09035d.jpg)

So, we can easily say that a user can have multiple roles, a role can be used for 
multiple users and a user can have assigned multiple messages.

Now, let's say that we only want to have the users. We'll use djin for the getting all the users in the following way... (Just hold on)
```js
async function getUsers() {
  const queryAsJson = {
    users: {}
  }
  const users = await djin.select(queryAsJson)
  // Aaaaaaand we have it
}
```
### Custom select
If we want to retreave only some specific fields from the database, we can use the following methods
```js
const queryAsJson = {
  users: '*'
}
//This json forces the djin to select all the fields from each user (just like an empty object, as above)
```

```js
const queryAsJson = {
  users: ['name', 'email']
}
```

```js
const queryAsJson = {
  users: {
    select: ['name', 'email']
  }
}
```

```js
const queryAsJson = {
  users: {
    select: 'email'
  }
}
```

### Select from multiple tables <b>(JOINS)</b>
When using Djin, you don't have to think about making the jois between the tables manually, for it will figure out on
its own, the path from a table to another (if it exists).
Let's have an example...

```js
const queryAsJson = {
  users: {
    roles: ['name']
  }
}
// The result of this query will contain every user from the database, together with its role
// The Djin will figure out that from 'users' table to the 'roles' table exists an intermediate, 
// and it will first join the intermediate one in the query, before including the 'roles' table 
// (Hoping this is clearer than dirt)
```

```js
const queryAsJson = {
  users: {
    select: 'name',
    roles: {},
    messages: ['message']
  }
}
// Guess what this query does...
// It will retreave all the users (only the name), together with its roles 
// (all the fields from the roles table) and messages (only the message field)
```

### Conditions
If you want to apply a 'WHERE' clause on one of the queries, you can do it like in the following example
```js
const queryAsJson = {
  users: {
    where: 'id = 125'
  }
}
// This query will provide all the information about the user with the id = 125
```

```js
const queryAsJson = {
  users: {
    roles: {},
    where: 'users.id = 125'
  }
}
// In the current version, if you want to retreave data from multiple tables, the query must
// be more specific... for now
```

### Many others will come...

