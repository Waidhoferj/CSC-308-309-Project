import "./Login.scss";

import { useForm } from "react-hook-form";
import { useHistory } from "react-router-dom";
import useProfileInfo from "../../hooks/useProfileInfo";
import auth from "../../auth";
import { useState } from "react";

export default function Login() {
  const { setUser } = useProfileInfo();
  const { push } = useHistory();
  const [submitDisabled, setSubmitDisabled] = useState(false);
  const { register, handleSubmit } = useForm();

  async function onSubmit(data) {
    try {
      setSubmitDisabled(true);
      const user = await auth.login(data.email, data.password, true);
      setUser(user.email);
      setTimeout(() => {
        push("/map");
      }, 300);
    } catch (err) {
      alert(err.message);
      setSubmitDisabled(false);
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
            autoComplete="current-password"
            ref={register({
              required: true,
            })}
          />
        </div>

        <input type="submit" disabled={submitDisabled} />
      </form>
      <h4>New user?</h4>
      <div>
        <button onClick={() => push("/sign-up")}>Sign Up</button>
      </div>
    </article>
  );
}
