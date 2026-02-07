import { createServer } from 'http';
import { readFile } from 'fs';
import { extname as _extname } from 'path';

const PORT = 8000;

createServer((req, res) => {
    let filePath = '.' + req.url;
    if (filePath === './') filePath = './dashboard.html';
    
    const extname = _extname(filePath);
    let contentType = 'text/html';
    
    switch(extname) {
        case '.js': contentType = 'text/javascript'; break;
        case '.css': contentType = 'text/css'; break;
        case '.json': contentType = 'application/json'; break;
        case '.png': contentType = 'image/png'; break;
        case '.jpg': contentType = 'image/jpg'; break;
        case '.env': contentType = 'text/plain'; break;
    }
    
    readFile(filePath, (error, content) => {
        if(error) {
            if(error.code === 'ENOENT') {
                res.writeHead(404);
                res.end('File not found');
            } else {
                res.writeHead(500);
                res.end('Server error: ' + error.code);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
}).listen(PORT);

console.log(`Server running at http://localhost:${PORT}/`);
console.log(`Open: http://localhost:${PORT}/dashboard.html`);