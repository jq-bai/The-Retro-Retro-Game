const http = require("http");
const host = 'localhost';
const port = 8000;

const fs = require('fs').promises;

const firstLoad = function(req, res) {
    if (request.url.match(".html$")) {
        fs.readFile("/Users/baijianqing/Library/CloudStorage/GoogleDrive-xiaojianbbb@gmail.com/My Drive/1.Personal/6.Workspace/VSC/VAMA/The Retro Retro Game/page/main.html")
        .then(contents => {
            res.setHeader("Content-Type", "text/html");
            res.writeHead(200);
            res.end(contents);
        });
    };
    if (request.url.match(".css$")) {
    fs.readFile("/Users/baijianqing/Library/CloudStorage/GoogleDrive-xiaojianbbb@gmail.com/My Drive/1.Personal/6.Workspace/VSC/VAMA/The Retro Retro Game/page/ds.css")
    .then(contents => {
        res.setHeader("Content-Type", "text/css");
        res.writeHead(200);
        res.end(contents);
    });
    };  
};

const server = http.createServer(firstLoad);
server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});