async function feed(parent, args, context, info) {
    const where = args.filter ? {
      OR: [
        { description_contains: args.filter },
        { url_contains: args.filter },
      ],
    } : {}

    const links = await context.prisma.links({
      where,
      skip: args.skip,
      first: args.first,
      orderBy: args.orderBy
    })

    const count = await context.prisma
    .linksConnection({
      where,
    })
    .aggregate()
    .count()

    return {
        links,
        count
    }
  }


module.exports = {
    feed,
}

/**
 * If no filter string is provided, then the where object will be just an empty object and no filtering conditions will be applied by the Prisma engine when it returns the response for the links query.
 * In case there is a filter carried by the incoming args, we’re constructing a where object that expresses my two filter conditions from above. This where argument is used by Prisma to filter out those Link elements that don’t adhere to the specified conditions.
 * using the provided filtering, ordering and pagination arguments to retrieve a number of Link elements.
 * using the linksConnection query from the Prisma client API to retrieve the total number of Link elements currently stored in the database.
 * The links and count are then wrapped in an object to adhere to the Feed type added to the GraphQL schema.
 */
