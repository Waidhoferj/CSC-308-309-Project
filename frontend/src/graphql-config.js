import { ApolloClient, InMemoryCache } from "@apollo/client";
const uri =
  process.env.NODE_ENV === "production"
    ? "https://csc-309-geoart.herokuapp.com/graphql?"
    : "http://localhost:8080/graphql?";
export const client = new ApolloClient({
  uri, // We will change this for production
  cache: new InMemoryCache(),
});
