const http = require('http');
const fs = require('fs');
const path = require('path');

const express = require('express')
const logger = require('morgan')


const app = express()
const PORT = 8080;

app.get('/', (req, res) =>{
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/:page', (req, res) => {
    let filepath = path.join(__dirname, req.params.page);
    filepath = filepath + '.html';
    console.log(filepath);
    if (fs.existsSync(filepath)) {
        res.sendFile(filepath);
    } else {
        res.status(404).sendFile(path.join(__dirname, '404.html'));
    }
});

app.use((req, res, next) => {
    res.status(404).sendFile(path.join(__dirname, '404.html'));
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
//server.listen(PORT, () => console.log(`Server running on port ${PORT}`));