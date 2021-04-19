import { useQuery, gql } from "@apollo/client";
import { useEffect, useState } from "react";

let uid = "VXNlclR5cGU6am9obkBqb2huLmNvbQ==";
let listeners: React.Dispatch<React.SetStateAction<string>>[] = [];
const GET_USER_QUERY = gql`
  query fetchUser($id: ID!) {
    users(id: $id) {
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
  const listener = useState("")[1];
  const { data, error } = useQuery(GET_USER_QUERY, {
    variables: { id: uid },
  });

  const profile: UserProfile | undefined = data?.users.edges[0].node;

  function setUser(id: string) {
    uid = id;
    listeners.forEach((l) => l(id));
  }

  useEffect(() => {
    listeners.push(listener);
    return () => void (listeners = listeners.filter((l) => l !== listener));
  }, [listener]);

  return { profile, error, setUser };
}
