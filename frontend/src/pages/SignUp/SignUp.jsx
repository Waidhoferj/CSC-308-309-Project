import "./SignUp.scss";

import { useMutation, gql } from "@apollo/client";
import { useForm } from "react-hook-form";
import { useHistory } from "react-router-dom";
import useProfileInfo from "../../hooks/useProfileInfo";

const NEW_ACCOUNT_MUTATION = gql`
  mutation addUser($email: String!, $name: String!, $password: String!) {
    createUser(userData: { email: $email, name: $name, password: $password }) {
      user {
        id
      }
      success
    }
  }
`;

export default function NewAccount() {
  const [submitUser] = useMutation(NEW_ACCOUNT_MUTATION);
  const { setUser } = useProfileInfo();
  const { push } = useHistory();

  const { register, handleSubmit } = useForm();

  async function onSubmit(data) {
    const payload = {
      email: data.email,
      name: data.name,
      password: data.password,
    };

    let resp = await submitUser({ variables: payload });
    if (resp.data.createUser.success) {
      setUser(resp.data.createUser.user.id);
      push("/map");
    }
    else {
      alert("An account already exists with that email.");
    }
  }

  return (
    <article className="NewAccount">
      <header>
        <h2>Sign Up</h2>
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
          <label htmlFor="username">Username</label>
          <br />
          <input
            type="text"
            name="name"
            id="username"
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
      <h4>Already have an account?</h4>
      <div>
        <button onClick={() => push("/login")}>Log In</button>
      </div>
    </article>
  );
}
