const http = require('http');
const fs = require('fs');
const path = require('path');


const server = http.createServer((req, res) => {
    console.log(req.url);
    let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url + '.html');
    if (!fs.existsSync(filePath)) {
        filePath = path.join(__dirname, '404.html');
    }

    fs.readFile(filePath, (err, data) => {
        if (err) throw err;
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
    });
});
 

const PORT = 8080;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));