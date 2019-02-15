const { ApolloServer, gql } = require('apollo-server');
const uuid = require('uuid/v4');

// This is a (sample) collection of books we'll be able to query
// the GraphQL server for.  A more complete example might fetch
// from an existing data source like a REST API or database.
const database = {
  books: {
    'book_1': {
      id: 'book_1',
      title: 'Cien años De soledad',
      authorId: 'author_1',
    },
    'book_2': {
      id: 'book_2',
      title: 'El amor en los tiempos del cólera',
      authorId: 'author_1',
    }
  },
  authors: {
    'author_1': {
      id: 'author_1',
      name: 'Gabriel García Márquez',
      books: ['b9d110ec-b3c1-4ecc-9fc7-fd1c22b4521a', '73488bd3-44fa-412b-94a1-2be9d0441c45']
    }
  },
};
// Type definitions define the "shape" of your data and specify
// which ways the data can be fetched from the GraphQL server.
const typeDefs = gql`
    type Book {
      id: String!
      title: String!
      authorId: String!
    }
    
    type Author {
      id: String!
      name: String!
      books: [Book]
    }
    
    type Query {
      books: [Book]
      authors: [Author]
    }
  `;

// Resolvers define the technique for fetching the types in the
// schema.  We'll retrieve books from the "books" array above.
const resolvers = {
  Query: {
    books: () => Object.values(database.books),
    authors: () => Object.values(database.authors),
  },
  Author: {
    books: ({ id }) => Object.values(database.books).filter(book => book.authorId === id),
  },
};

// In the most basic sense, the ApolloServer can be started
// by passing type definitions (typeDefs) and the resolvers
// responsible for fetching the data for those types.

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// This `listen` method launches a web-server.  Existing apps
// can utilize middleware options, which we'll discuss later.
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
