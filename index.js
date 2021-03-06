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
      books: ['book_1', 'book_2']
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
  
  union SearchResult = Book | Author
  type Query {
    books: [Book]
    authors: [Author]
    bookById(id: String!): Book
    authorById(id: String!): Author
    search(text: String): [SearchResult]
  }
  
  input BookInput {
    title: String!
  }
  type Mutation {
    addAuthor(name: String!, books: [BookInput]): Author!
  }
`;

// Resolvers define the technique for fetching the types in the
// schema.  We'll retrieve books from the "books" array above.
const resolvers = {
  Query: {
    books: () => Object.values(database.books),
    authors: () => Object.values(database.authors),
    bookById: (_, { id }) => database.books[id],
    authorById: (_, { id }) => database.authors[id],
    search: (_, { text }) => ([
      ...Object.values(database.books).filter((book) => book.title.toLowerCase().includes(text.toLowerCase())),
      ...Object.values(database.authors).filter((author) => author.name.toLowerCase().includes(text.toLowerCase()))
    ]),
  },
  Author: {
    books: ({ id }) => Object.values(database.books).filter(book => book.authorId === id),
  },
  SearchResult: {
    __resolveType: searchResult => (searchResult.name ? 'Author' : 'Book'),
  },
  Mutation: {
    addAuthor: (_, { name, books = [] }) => {
      const authorId = uuid();
      const booksWithId = books.reduce(
          (acc, book) => {
            const bookId = uuid();
            acc[bookId] = {
              id: bookId,
              title: book.title,
              authorId,
            };
            return acc;
          },
          {}
      );
      const author = {
        id: authorId,
        name,
        books: Object.keys(booksWithId),
      };
      database.authors[author.id] = author;
      Object.assign(database.books, booksWithId);
      return author;
    },
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
