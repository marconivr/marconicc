/**
 * Routes generiche. Questa classe contiene tutti gli import alle sottoroutes.
 **/




module.exports = {

	/**
	 * Users routes.
	 */
	isLoggedIn : function isLoggedIn(req, res, next) {

		// if user is authenticated in the session, carry on
		if (req.isAuthenticated())
			return next();

		// if they aren't redirect them to the home page
		res.redirect('/');
	}




};