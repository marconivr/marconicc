/**
 * Routes generiche. Questa classe contiene tutti gli import alle sottoroutes.
 **/


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
	}




};