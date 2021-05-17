import "./SignUp.scss";
import { gql, useMutation } from "@apollo/client";
import { useForm } from "react-hook-form";
import { useHistory } from "react-router-dom";
import auth from "../../auth";
import useProfileInfo from "../../hooks/useProfileInfo";
import { useState } from "react";

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

export default function SignUp() {
  const [submitUser] = useMutation(NEW_ACCOUNT_MUTATION);
  const { push } = useHistory();
  const { setUser } = useProfileInfo();
  const { register, handleSubmit } = useForm();
  const [submitDisabled, setSubmitDisabled] = useState(false);

  async function onSubmit(data) {
    setSubmitDisabled(true);
    const payload = {
      email: data.email,
      name: data.name,
      password: data.password,
    };
    try {
      await auth.signup(data.email, data.password, { name: data.name });
      await auth.login(data.email, data.password, true);
      await submitUser({ variables: payload });

      const user = await auth.login(data.email, data.password, true);
      setUser(user.email);
      push("/map");
    } catch (err) {
      setSubmitDisabled(false);
      alert(err.message);
    }
  }

  return (
    <article className="SignUp">
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
            autoComplete="username"
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
            autoComplete="password"
            id="password"
            ref={register({
              required: true,
            })}
          />
        </div>

        <input type="submit" disabled={submitDisabled} />
      </form>
      <h4>Already have an account?</h4>
      <div>
        <button onClick={() => push("/login")}>Log In</button>
      </div>
    </article>
  );
}
