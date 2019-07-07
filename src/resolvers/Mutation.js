const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { APP_SECRET, getUserId } = require('../utils')

async function signup(parent, args, context, info) {
    // Encrypt password using bcryptjs lib
    const password = await bcrypt.hash(args.password, 10)
    // use prisma client instance to store the new User in my db.
    const user = await context.prisma.createUser({ ...args, password })
    // generate JWT which is signed with a secret.
    const token = jwt.sign({ userId: user.id }, APP_SECRET)
    // return token and the user in an object that adheres to the shape of an AuthPayload object from my GQL Schema.
    return {
        token,
        user,
    }
}

async function login(parent, args, context, info) {
    // Instead of creating a new User shape, I'm using prisma client to retrive the existing User record by the email address sent as an arg in the login mutation.
    const user = await context.prisma.user({ email: args.email})
    // No User with this email address found, error
    if (!user) { throw new Error('No such user found') }
    // Compare provided password with one that is stored in db.
    const valid = await bcrypt.compare(args.password, user.password)
    // error if they do not match
    if (!valid) { throw new Error('Invalid password') }
    // generate JWT with a signed secret.
    const token = jwt.sign({ userId: user.id }, APP_SECRET)
    // return token and user again if no error.
    return {
        token,
        user,
    }
}

function post(parent, args, context, info) {
    // Retrieve the ID for the User, which is stored in the JWT that's set as the Authorization header of the incoming HTTP request. I'll know which User is creating the Link.
    const userId = getUserId(context)
    // Using userId to connect the Link to be created with the User who is creating it through a `nested object write`
    return context.prisma.createLink({
        url: args.url,
        description: args.description,
        postedBy: { connect: { id: userId } },
    })
}

async function vote(parent, args, context, info) {
    // validate the incoming JWT with the getUserId helper function.
    const userId = getUserId(context)
    // If it’s valid, the function will return the userId of the User who is making the request.
    const linkExists = await context.prisma.$exists.vote({
        user: { id: userId },
        link: { id: args.linkId },
    })
    // If the JWT is not valid, the function will throw an exception.
    if (linkExists) { throw new Error(`Already voted for link: ${args.linkId}`) }

    /**
     * The prisma client instance not only exposes CRUD methods for your models, it also generates one $exists function per model.
     * $exists function takes a where filter object that allows to specify certain conditions about elements of that type.
     * Only if the condition applies to at least one element in the database, the $exists function returns true.
     * In this case, I'm using it to verify that the requesting User has not yet voted for the Link that’s identified by args.linkId.
     * If exists returns false, the createVote method will be used to create a new Vote that’s connected to the User and the Link.
     */
    return context.prisma.createVote({
        user: { connect: { id: userId } },
        link: { connect: { id: args.linkId } },
    })
}

module.exports = {
    signup,
    login,
    post,
    vote,
}
