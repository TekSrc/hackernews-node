const jwt = require('jsonwebtoken')
// Secret used to sign the JWTs which I'm issuing to my users
const APP_SECRET = process.env.APP_SECRET

/** helper function that I'll call in resolvers which require authentication(post for ex).
 * First retrieves Authorization header (which contains the User's JWT) from the context.
 * Then verifies the JWT and retrieves the User's ID from it.
 * If that process is not successful for any reason, the function will throw an exception.
 * Therefore I can use it to "protect" the resolvers which require authentication
*/
function getUserId(context) {
    const Authorization = context.request.get('Authorization')
    if (Authorization) {
        const token = Authorization.replace('Bearer ', '')
        const { userId } = jwt.verify(token, APP_SECRET)
        return userId
    }
    throw new Error('Not authenticated')
}

module.exports = {
    APP_SECRET,
    getUserId,
}
