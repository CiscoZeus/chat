# SimpleChat

Built with:

  - <strong>Server side:</strong> Node.js, Socket.io, Express, Redis
  - <strong>Client side:</strong> HTML5 Boilerplate, Bootstrap, Handlebars and jQuery

If you just want to see it running, visit: http://www.tegioz.com:8888

### Requires

  - Node.js
  - NPM (Node Package Manager)
  - Redis

### Get the code

    git clone git@github.com:tegioz/chat.git

### Run

Fetch dependencies:

    npm install

Launch Redis:
    
    redis-server

Launch chat server:
    
    (don't forget to launch Redis before!)

    node chatServer.js

Now open this URL in your browser:

    http://localhost:8888/

and you're done ;)

### Broadcast API

Send messages to all connected users:

    Content-Type: application/json
    POST /api/broadcast/

    {"msg": "Hello!"}