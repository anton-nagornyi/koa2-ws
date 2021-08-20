# Prerequisites

Should implement a simple chat service based on sockets, which can receive, persist into the database
and deliver to users of chat messages with handling their statuses. There are two statuses of each
message: new - just received on service and saved into the database, readed - a client has asked the
message from service.
You should use the Koa2 framework. For the database, you should use what you prefer: SQL/NoSQL.

# How to run

1. Create postgres database. Name it `koa2-ws-test`

2. Open `src/db/db.js` and change connection properties: `username` and `password`.

3. Install and run:
 
```shell script
npm install
npm run start
```

# Considerations

* Why not using `Typescript`? 
Koa2 (https://www.npmjs.com/package/koa2) was published 5 years ago and it does not even have types published separately. 
I made an assumption that I am also bound to javascript and is not supposed to used typescript.
* There is no input data validation, error and client disconnection handling in this implementation. Those were sacrificed for time saving.
* There is also no client provided to test client-server interaction. Please use latest `Postman` versions to test 
websockets interaction or any other tool you prefer for that. Keep in mind that to make `Postman` function correctly 
choose Socket.IO as a communication type and select v3 in the request settings. You can find more here: https://blog.postman.com/postman-now-supports-socket-io/
* I am using Sequelize because I am not using typescript. Otherwise it would be Typeorm.
* Why to use `ORM` at all? 
The main reason is to sync schema automatically when you start the app.

# User read flow 

1. User starts client, connects to the server and is automatically placed inside the `chat_room`.
2. User sends `loadMore` to get messages on the last page in his feed. 
He is required to provide `before` - the id of his last received message and `last` - the amount of messages 
he is going to receive per page.
3. Once user received messages from server and read them he might send `read` event with the array of read message 
ids to mark them with the appropriate status. It is important to compose id list only from messages with the `new` status.

# What happens when user sends a message

1. User sends `message` event with text he wrote.
2. New record in `messages` table is placed.
3. Find all other connected users in the `chat_room`.
4. For each found user create record in the `client_message` table and link it with the message id.
It will store the message status for that message and that user.
5. For each found user send message.

