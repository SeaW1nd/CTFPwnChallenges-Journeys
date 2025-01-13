#!/usr/bin/env node
const express = require('express')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const crypto = require("crypto")
const app = express()

app.use(express.json())
app.use(cookieParser())

const SECURE_KEY = crypto.randomBytes(64).toString('hex');

function createLoginData(body) {
    const loginData = {}
    for (const key of Object.keys(body)) {
        loginData[key] = body[key]
    }
    return loginData
}

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/login', (req, res) => {
    if (req.body.isAdmin) {
        res.json({"result": "login as admin is not permitted"})
    }

    const loginData = createLoginData(req.body);
    console.log(loginData.isAdmin)
    const jwtKey = jwt.sign({
        username: loginData.username,
        isAdmin: loginData.isAdmin || false
    }, SECURE_KEY);
    res.json({"jwt": jwtKey, "key": SECURE_KEY})
})

app.get('/admin', (req, res) => {
    if (!req.cookies["jwtkey"]) {
        res.json({"result":"You are not logged in!"});
    }

    const jwtKey = req.cookies["jwtkey"];
    if (jwtKey) {
        try {
            const payload = jwt.verify(jwtKey, SECURE_KEY);
            if (payload.isAdmin) {
                return res.json({"result":"logged in, your flag is " + process.env.FLAG});
            }

            return res.json({"result":"logged in as " + payload.username});
        } catch (e) {
            res.json({"result":"error occured"})
        }
    }
})

app.listen(3001, "0.0.0.0", () => {
  console.log(`Example app listening on port 3000`)
})