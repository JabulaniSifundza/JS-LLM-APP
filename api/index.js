const app = require('express')();
const { v4 } = require('uuid');
app.use(express.static('public'))

app.get('/home', (req, res) => {
    //res.send('Hello, World!');
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/', (req, res) => {
    //res.send('Hello, World!');
    res.sendFile(__dirname + '/public/index.html');
});

module.exports = app;