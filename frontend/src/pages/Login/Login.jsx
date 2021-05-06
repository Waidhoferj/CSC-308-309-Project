import "./Login.scss";

import { useMutation, gql } from "@apollo/client";
import { useForm } from "react-hook-form";
import { useHistory } from "react-router-dom";
import useProfileInfo from "../../hooks/useProfileInfo";

const GET_USER_MUTATION = gql`
  mutation getUser($email: String!, $password: String!) {
    authenticateUser(email: $email, password: $password) {
      user {
        id
      }
      success
    }
  }
`;



export default function Login() {
  const { setUser } = useProfileInfo(); 
  const { push } = useHistory();

  const { register, handleSubmit } = useForm();

  const [userLogin] = useMutation(GET_USER_MUTATION);

  async function onSubmit(data) {
    // If encrypting, we would encrypt the password here
    
    const payload = {
      email: data.email,
      password: data.password
    };

    const login = await userLogin({variables: payload});

    if (login["data"]["authenticateUser"]["success"]) {
      setUser(login["data"]["authenticateUser"]["user"]["id"]);
      push("/map");
    }
    else {
      alert("Unrecognized email/password combination.");
    }
  }

  return (
    <article className="Login">
      <header>
        <h2>Log In</h2>
      </header>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="input">
          <label htmlFor="email">Email</label>
          <br />
          <input
            type="email"
            name="email"
            id="email"
            ref={register({
              required: true,
            })}
          />
        </div>

        <div className="input">
          <label htmlFor="password">Password</label>
          <br />
          <input
            type="password"
            name="password"
            id="password"
            ref={register({
              required: true,
            })}
          />
        </div>

        <input type="submit" />
      </form>
      <h4>New user?</h4>
      <div>
        <button onClick={() => push("/sign-up")}>Sign Up</button>
      </div>
    </article>
  );
}