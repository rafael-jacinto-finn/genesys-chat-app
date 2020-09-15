const express = require('express');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const request = require('request');


const client_id = '352f29c2-6355-4bc5-9cb9-65e2841c0f64';
const client_secret = '-i1NsjYb4ZZbqKRGAQw9LOeMtUReOfIO0BxeaNz8_Sg';

const app = express();

const authvalidation = (req, res, next) => {
    console.log('\n['+req.method+' '+req.url+']');
    //if we don't have a session then redirect them to the login page
    if((req.cookies && !(req.cookies.session && sessionMap[req.cookies.session])) &&
            req.url.indexOf("oauth") == -1){
        //redirect the user to authorize with Genesys Cloud
        var redirectUri = "https://login.mypurecloud.com/oauth/authorize?" +
                    "response_type=code" +
                    "&client_id=" + client_id +
                    "&redirect_uri=http://localhost:3000/oauth2/callback";

        console.log("redirecting to " + redirectUri);
        res.redirect(redirectUri);

        return;
    }

    //if we do have a session, just pass along to the next http handler
    console.log("have session")
    next();
}

app.use(bodyParser.json());
app.use(cookieParser());
app.use(authvalidation);
app.use(express.static(__dirname));

var sessionMap ={};

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/../public/index.html'));
});

app.get("/oauth2/callback", (req,res) => {
    //the authorization page has called this callback and now we need to get the bearer token
    console.log("oauth callback")
    console.log(req.query.code)
    var authCode = req.query.code;

    var tokenFormData = {
        grant_type: "authorization_code",
        code: authCode, //from the query string parameters sent to this url
        redirect_uri : "http://localhost:3000/oauth2/callback"
    }

    var postData = {
        url:'https://login.mypurecloud.com/oauth/token',
        form: tokenFormData,
        auth: { //basic auth here
            user: client_id,
            pass: client_secret
        }
    }

    //post back to /oauth/token with the client id and secret as well as the auth code that was sent to us.
    request.post(postData, (err,httpResponse,body) => {
        console.log("got token data back: ")
        console.log(body);

        var tokenResponse = JSON.parse(body);

        var sessionId = uuidv4();

        //store the session id as a key in the session map, the value is the bearer token for Genesys Cloud.
        //we want to keep that secure so won't send that back to the client
        sessionMap[sessionId] = tokenResponse.access_token;

        //send the session id back as a cookie
        res.cookie('session', sessionId);
        res.redirect("/my_info.html");

    });
});

//wrap up the api/v2/users/me call inside a /me route
app.get("/me", (req, res) => {
    //get the session from map using the cookie
    var oauthId = sessionMap[req.cookies.session];

    var getData = {
        url:'https://api.mypurecloud.com/api/v2/users/me',
        auth: {
            bearer: oauthId
        }
    };

    request.get(getData, function (e, r, user) {
        console.log("Got response for /users/me");
        console.log(user);
        console.log(e);
         res.send(user);
    })
});

app.listen(3000);