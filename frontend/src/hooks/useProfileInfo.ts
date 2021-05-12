import { useQuery, gql } from "@apollo/client";
import { useEffect, useState } from "react";
import auth from "../auth";

let listeners: React.Dispatch<React.SetStateAction<string | null>>[] = [];
let email: string | null = auth.currentUser()?.email || null;

const GET_USER_QUERY = gql`
  query fetchUser($email: String!) {
    users(email: $email) {
      edges {
        node {
          id
          name
          bio
          profilePic
          metrics {
            worksFound
            worksVisited
          }
        }
      }
    }
  }
`;

type UserProfile = {
  name: string;
  id: string;
  bio: string;
  profilePic: string;
  metrics: { worksFound: number; worksVisited: number };
};

export default function useProfileInfo() {
  const listener = useState<string | null>("")[1];
  const { data, error } = useQuery(GET_USER_QUERY, {
    variables: { email },
  });

  let profile: UserProfile | undefined = data?.users.edges[0]?.node;
  function setUser(new_email: string | null) {
    email = new_email;
    listeners.forEach((l) => l(email));
  }

  useEffect(() => {
    listeners.push(listener);
    return () => void (listeners = listeners.filter((l) => l !== listener));
  }, [listener]);

  return { profile, error, setUser };
}
