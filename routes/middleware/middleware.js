/**
 * Routes generiche. Questa classe contiene tutti gli import alle sottoroutes.
 **/

const endpoint = require('../endpoint/endpoint.js');
var app = undefined;

module.exports = {

	setApp: function (localApp) {
		app = localApp;
    },

	/**
	 * Users routes.
	 */
	isLoggedIn : function isLoggedIn(req, res, next) {

		app.locals.user = req.user;

		// if user is authenticated in the session, carry on
		if (req.isAuthenticated())
			return next();

		// if they aren't redirect them to the home page
		res.redirect('/');
	},

    /**
     * this function allow or block api call based on user id
     * if the current user has the id passed in the params, it allow the call
     * possible id -> 0,1,2
     *
     * diritto 0 -> tutto
     * diritto 1 -> tutto tranne creare utenti
     * diritto 2 -> panoramica classi elenco studenti e export-->
     *
     * @param role array of id
     * @returns {Function}
     */
    restrictTo :function(role) {
    return function (req, res, next) {

        var userId = req.user.diritti;
        var hasRights = false;
        for (var index = 0; index < role.length; index++) {
            if (userId === role[index]) {
                hasRights = true;

            }
        }
        if(hasRights)next();
        else res.redirect(endpoint.utenti.unauthorized);
    }
}



};