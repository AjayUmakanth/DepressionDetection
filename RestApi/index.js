var app = require('./app');

function App(req,res) {
    if (!req.url) {
        req.url = '/';
        req.path = '/';
    }
    return app(req,res);
}

var helloWorld = App;

module.exports = {
    helloWorld
};
