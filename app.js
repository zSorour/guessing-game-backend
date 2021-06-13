const express = require('express');
const jwt = require('jsonwebtoken');

//For using .env files and the process.env variable
require('dotenv').config();

const app = express();
const port = 8080;

//Parse incoming request data (request body) in json format
app.use(express.json());


//Route for handling questions asked by the client
app.get('/ask', authenticateToken, (req, res) => {

    //get question
    let question = req.body.question;
    let answer;
    //get answer of question
    if (question === "has_hair") {
        answer = "yes";
    }
    else if (question === "has_flaws") {
        answer = "no";
    }

    res.json({
        answer: answer
    });
});


//Route for getting a JWT
app.post('/auth', (req, res) => {

    const connection = req.body.connectionID;

    const prologConnection = {
        targetCharacter: "Sayed",
        connectionID: connection
    }

    //Create and sign a token. The token would encapsulate the data of the connection, similar to a session, betweem the client and the server.
    const token = jwt.sign(prologConnection, process.env.ACCESS_SECRET_TOKEN);
    //Reply to the client with the generated token.
    res.json({ accessToken: token });
});



//Middleware for authenticating tokens sent from the client
function authenticateToken(req, res, next) {

    //By standard, the token sent from the client for authentication is sent in the authorization header of the request.
    //So we first get the authorization header.
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        //If there is no authorization header in the request, send response with failure
        return res.sendStatus(401).send('unauthorized!!!');
    }
    //Following JWT authentication standards, the token is typically sent with the value of: "BEARER TOKEN",
    //This means that the token is the second 'word' in the authorization header value.
    //Split authorization header, and get the second value, which holds the token value.
    const token = authHeader.split(' ')[1];

    //If for some reason there is no token send in the request, send response with failure
    if (token == null) {
        return res.sendStatus(401).send('unauthorized!!!');
    }

    //Finally, we have a token. We now verify it.
    jwt.verify(token, process.env.ACCESS_SECRET_TOKEN, (err, data) => {
        if (err) {
            return res.send(403).send('invalid token');
        }
        //Since there is no error, I get the data that came from verifying the token and store it in the request variable
        //so that it can be accessed in the next request handler/middleware
        req.data = data;
        next();
    });
}

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`)
})