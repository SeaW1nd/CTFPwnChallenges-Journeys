import http from 'http';
import queryString from 'querystring';
import fs from 'fs';
import pug from 'pug';

const HTTP_USERNAME = process.env.HTTP_USERNAME
const HTTP_PASSWORD = process.env.HTTP_PASSWORD

global.replace_bad_char = str_to_replace => {
    return str_to_replace.replace(/[#,{,",:,(,`]/gm, "")
}
Promise.prototype.then = ()=>null


const server = http.createServer(async (req, res) => {

    // if (!req.headers["authorization"]) {
    //     res.setHeader("WWW-Authenticate", 'Basic realm="Login required"');
    //     res.writeHead(401, { 'Content-Type': 'text/plain' });
    //     res.end("Login required!");
    //     return;
    // } else {
    //     const [username, password] = Buffer.from(req.headers["authorization"].slice(6), 'base64').toString().split(':');
    //     if (username !== HTTP_USERNAME && password !== HTTP_PASSWORD) {
    //         res.writeHead(401, { 'Content-Type': 'text/plain' });
    //         res.end("Login required!");
    //         return
    //     }
    // }
    if (req.url.startsWith("/eval")) {
        try {
            const queries = queryString.parse(req.url.substring(req.url.indexOf("?")+1));
            const result = pug.render(replace_bad_char(queries["p"]));

            if (result.indexOf("W1") != -1) {
                res.writeHead(403, { 'Content-Type': 'text/plain' });
                res.end("Cool, but not so fast...");
                return
            }
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end(result);
        } catch (e) {
            console.log(e)
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end("error occured: " + e);
        }
    } else {
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.end(fs.readFileSync("index.html"))
    }
});
const PORT = process.env.PORT || 3000
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});

//setTimeout(() => process.exit(), process.env.TIMEOUT ? process.env.TIMEOUT*1000: 60000);
