require('dotenv').config()

// Resolvers
const Query = require('./resolvers/Query')
const Mutation = require('./resolvers/Mutation')
const User = require('./resolvers/User')
const Link = require('./resolvers/Link')

const { GraphQLServer } = require('graphql-yoga')
const { prisma } = require('./generated/prisma-client')
const fs = require('file-system')


/*
The typeDefs constant defines your GraphQL schema. Here, it defines a simple Query type with one field called info. This field has the type String!. (The exclamation mark in the type definition means that this field can never be null.)
NOW INSIDE schema.graphql file and GraphQLServer updated for instantiation
*/

/*
The resolvers object is the actual implementation of the GraphQL schema. Its structure is identical to the structure of the type definition inside typeDefs: Query.info.
*/

// New integer variable to generate unique IDs for newly created Link elements.
const resolvers = {
    Query,
    Mutation,
    User,
    Link

    // Flush code due to moving resolvers out
    // Query: {
    //     info: () => `This is the API or a Hackernews clone.`,
    //     feed: (root, args, context, info) => {
    //         return context.prisma.links()
    //     },
    // },
    // Mutation: {
    //     // ost resolver creates a new link object, adds to existing links list, & returns new link
    //     post: (root, args, context) => {
    //         // args carries the arguments for the operation.
    //         // In this case, the url & description of the Link to be created.
    //         // We didn't need args for feed and info resolvers before because the corresponding root fields don't specify any arguments in the schema definition.
    //         // const link = {
    //         //     id: `link-${idCount++}`,
    //         //     description: args.description,
    //         //     url: args.url,
    //         // }
    //         // links.push(link)
    //         // return link

    //         // Modified for Prisma client
    //         return context.prisma.createLink({
    //             url: args.url,
    //             description: args.description,
    //         })
    //     },
    //     updateLink: (parent, args) => {
    //         // Need logic to update existing link by id
    //     },
    //     deleteLink: (parent, args) => {
    //         // Need logic to delete a link by id
    //     }
    // },
}

/*
the schema and resolvers are bundled and passed to the GraphQLServer which is imported from graphql-yoga. This tells the server what API operations are accepted and how they should be resolved.
*/

const typeDefs = fs.readFileSync('./src/schema.graphql','utf8')
const server = new GraphQLServer({
    typeDefs,
    resolvers,
    context: request => {
      return {
        ...request,
        prisma,
      }
    },
  })
  

server.start(() => console.log(`Server is running on http://localhost:4000`))
/**
 * node src/index.js
 * query { info } query response is the info from the resolver?
 * ! in typeDefs means the field could never be null
 * This is in fact one of the core benefits of GraphQL in general: It enforces that the API actually behaves in the way that is promised by the schema definition! This way, everyone who has access to the GraphQL schema can always be 100% sure about the API operations and data structures that are returned by the API.
 * Every GraphQL schema has three special root types, these are called Query, Mutation and Subscription. The root types correspond to the three operation types offered by GraphQL: queries, mutations and subscriptions. The fields on these root types are called root field and define the available API operations.
 * When sending queries, mutations or subscriptions to a GraphQL API, these always need to start with a root field! In this case, we only have one root field, so there’s really only one possible query that’s accepted by the API.
*/

/**
 * Posting:
 * mutation {
        post(
            url: "www.prisma.io"
            description: "Prisma replaces traditional ORMs"
        ) {
            id
        }
    }
*/

/**
 * Checking Feed:
 * query {
        feed {
            id
            url
            description
        }
    }
 */
