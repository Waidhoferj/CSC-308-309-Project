import "./ReportArtwork.scss";
// still have all the work to do
import { useMutation, gql } from "@apollo/client";
// import { useState } from "react";
import { ArrowLeft } from "react-feather";
import { useParams, useHistory } from "react-router-dom";
import { useForm, Controller, useController } from "react-hook-form";
import useProfileInfo from "../../hooks/useProfileInfo";

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

// $name has to match payload name

export default function ArtSubmission() {
  /* Give a ref to each input field that we got from useForm hook.
   */
  const { register, handleSubmit, control, errors } = useForm();
  const history = useHistory();
  const [submitReport] = useMutation(CREATE_REPORT_MUTATION);
  const { profile } = useProfileInfo();
  const { id } = useParams();

  //onSubmit function is passed to handleSubmit function
  function onSubmit(data) {
    const payload = {
      reportedIdType: "report",
      reportedId: id,
      userId: profile?.id,
      reason: data.reason,
      description: data.description
    };
    
    //debugger
    //console.log(payload)
    submitReport({ variables: payload }).then((res) => {
      history.push("/artwork/" + id);
    });
  }

  return (
    <section className="ReportArtwork">
      <header>
        <nav>
          <button className="wrapper" onClick={history.goBack}>
            <ArrowLeft />
          </button>
        </nav>
        <h1>Report Artwork</h1>
      </header>
      <form onSubmit={handleSubmit(onSubmit)}>

        <label>
          <p className="field-label">Reason</p>
          <select id="reason" name="reason" ref={register({
            required: true
          })}>
            <option value="duplicate">Duplicate</option>
            <option value="inappropriate">Inappropriate</option>
            <option value="not art">Not Art</option>
          </select>
        </label>
        
        
        <label>
          <p className="field-label">Description</p>
          <textarea
            cols="30"
            rows="8"
            name="description"
            placeholder="Tell us what happened"
            ref={register({
              required: true,
              minLength: 10,
            })}
          ></textarea>
        </label>

        {errors.description && errors.description.type === "required" && (
          <p className="errorMsg" style={{ color: "Red" }}>
            Description is required.
          </p>
        )}

        {errors.description && errors.description.type === "minLength" && (
          <p className="errorMsg" style={{ color: "Red" }}>
            Description should be at-least 10 characters.
          </p>
        )}

        <input type="submit" value="Submit Report" id="submitReport" />
      </form>
    </section>
  );
}
