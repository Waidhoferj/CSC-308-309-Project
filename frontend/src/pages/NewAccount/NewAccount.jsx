import "./NewAccount.scss";

import { useMutation, gql } from "@apollo/client";
import { useForm, Controller, useController } from "react-hook-form";

const CREATE_REPORT_MUTATION = gql`
  mutation addReport(
      $reportedIdType: String!
      $reportedId: String!
      $userId: String!
      $reason: String!
      $description: String!
    )  {
    createReport(
      reportData: {
        reportedIdType: $reportedIdType
        reportedId: $reportedId
        userId: $userId
        reason: $reason
        description: $description
      }
    ) {
      report {
        reportedIdType
        reportedId
        userId
        reason
        description
      }
    }  
  }
`;

const NEW_ACCOUNT_MUTATION = gql`
  mutation addUser (
    $email: String!
    $name: String!
    $password: String!
  )
  {
    createUser(
      userData: {
        email: $email
        name: $name
        password: $password
      }
    ) 
    {
      user {
        id
        name
      }
    }  
  }
`;

export default function NewAccount() {
  const [submitReport] = useMutation(NEW_ACCOUNT_MUTATION);
 
  const { register, handleSubmit, control, errors } = useForm();

  function onSubmit(data) {
    const payload = {
      email: data.email,
      name: data.name,
      password: data.password,
    };

    console.log("success");
    console.log(data.email);
    console.log(data.name);

    submitReport({ variables: payload })
  }

  return (
    <article className="NewAccount">
      <header>
        <h2>Sign Up</h2>
      </header>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="input">
          <label htmlFor="email">Email</label><br/>
          <input
            type="text"
            name="email"
            id="email"
            ref={register({
              required: true,
            })}
          />
        </div>

        <div className="input">
          <label htmlFor="username">Username</label><br/>
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
          <label htmlFor="password">Password</label><br/>
          <input
            type="password"
            name="password"
            id="password"
            ref={register({
              required: true,
            })}
          />
        </div>

        <input
          type="submit"
        />
      </form>
    </article>
  );
}
