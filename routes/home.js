/**
 * Created by mattiacorradi on 11/02/2017.
 */
/**
 * Created by matti on 10/11/2016.
 */


middleware = require ('./middleware/middleware');

module.exports = function (app,passport) {

    /**
     * home page
     */
    app.get('/test', function(req, res){
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({ a: 1 }));
    });

};