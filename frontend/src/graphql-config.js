import { ApolloClient, InMemoryCache } from "@apollo/client";

export const client = new ApolloClient({
  uri: "http://127.0.0.1:5000/graphql?", // We will change this for production
  cache: new InMemoryCache(),
});
