# Microservice

This project is a nodejs microservice, which consists of two servers, the admin (nodejs, express, typeorm and postgres) and the main (nodejs, express, typeorm and mongodb) and they both communicate via a message broker RabbitMQ.

## How to run the project

### Running admin server.

```bash
cd admin
yarn install -- to install node modules
# To run the server
yarn start
```
### Running main server.

```bash
cd main
yarn install -- to install node modules
# To run the server
yarn start
```
## Usage

```javascript
# Use postman or any other platform that makes requests to an API
# We will create a product on the admin server and the created product will be added on the main servers database as well.

API endpoint: http://localhost:8000/api/product
Type of request: POST
The request body (JSON): 
   {
    "title": "Test",
    "image": "test-image",
    "likes": "7"
   }

# After making the request the created product will be added to main and will be displayed on the terminal.
