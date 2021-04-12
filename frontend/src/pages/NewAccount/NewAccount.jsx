import "./NewAccount.scss";

import { useMutation, gql } from "@apollo/client";

export default function NewAccount() {

  function createAccount() {

    const NEW_ACCOUNT_MUTATION = gql`
    mutation {
      createUser(
        userData: {
          name: "Branden"
          bio: "Sweet Hater of Science"
        }
      ) 
      {
        id
        user {
          name
        }
      }  
    }
    `;
  }

  return (
    <article className="NewAccount">
      <header>
        <h2>Sign Up</h2>
      </header>

      <form>
        <div className="input">
          <label htmlFor="email">Email</label><br></br>
          <input
            type="text"
            name="email"
            id="email"
          />
        </div>

        <div className="input">
          <label htmlFor="username">Username</label><br></br>
          <input
            type="text"
            name="username"
            id="username"
          />
        </div>

        <div className="input">
          <label htmlFor="password">Password</label><br></br>
          <input
            type="password"
            name="password"
            id="password"
          />
        </div>

        <input
          type="button"
          value="Submit"
          onclick="createAccount()"
        />
      </form>
    </article>
  );
}
