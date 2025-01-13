 
const express = require('express');
const app = express();
const PORT = 3000;
 
// For parsing application/json
app.use(express.json());
 
// For parsing application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));
 
app.post('/profile', function (req, res) {
    console.log(req.body);
    res.send();
});
 
app.listen(PORT, function (err) {
    if (err) console.log(err);
    console.log("Server listening on PORT", PORT);
});
