import "./ArtReview.scss";

import { useMutation, gql } from "@apollo/client";
import Rating from "react-rating-stars-component";
import { useState } from "react";
import { ArrowLeft } from "react-feather";
import { useParams, useHistory } from "react-router-dom";
import { useForm, Controller, useController } from "react-hook-form";
import usePhotoLibrary from "../../hooks/usePhotoLibrary";
import useProfileInfo from "../../hooks/useProfileInfo";
//import PropTypes from 'prop-types';

import Tag from "../../components/Tag/Tag";

const CREATE_ART_REVIEW_MUTATION = gql`
  mutation addArtworkReview(
    $artworkId: ID!
    $author: ID!
    $content: String!
    $rating: Float!
    $tags: [String]
  ) {
    addArtworkReview(
      reviewData: {
        artworkId: $artworkId
        comment: { author: $author, content: $content }
        rating: $rating
        tags: $tags
      }
    ) {
      artwork {
        id
      }
    }
  }
`;

export default function ArtReview({ artwork }) {
  /* Give a ref to each input field that we got from useForm hook.
   */
  const { register, handleSubmit, control, errors } = useForm();
  const {
    field: { onChange: updateTagsForm, value: tags },
  } = useController({
    name: "tags",
    control,
    rules: { required: true },
    defaultValue: [],
  });
  const [tagInputVal, setTagInputVal] = useState("");
  const history = useHistory();
  const [uploadArtReview] = useMutation(CREATE_ART_REVIEW_MUTATION);
  const { profile } = useProfileInfo();

  //onSubmit function is passed to handleSubmit function
  function onSubmit(data) {
    const payload = {
      artworkId: artwork.id, //Follow bradens ex from reportArtwork, grab from url
      author: profile?.id, //Ask john how to grab this from user state
      content: data.description,
      rating: data.rating * 20,
      tags: data.tags,
    };
    uploadArtReview({ variables: payload });
    history.push("/artwork/" + artwork.id);
  }

  function handleTagSubmit(e) {
    e.preventDefault();

    if (tags.length > 4 || tagInputVal.length === 0) return;

    setTagInputVal("");
    const newTags = [...tags, tagInputVal];
    updateTagsForm(newTags);
  }

  return (
    <section className="ArtReview">
      <header>
        <nav>
          <button className="wrapper" onClick={history.goBack}>
            <ArrowLeft />
          </button>
        </nav>
        <img src={artwork.pictures[0]} alt="Art" />
        <h1>Review</h1>
      </header>
      <form onSubmit={handleSubmit(onSubmit)}>
        {errors.title && errors.title.type === "required" && (
          <p className="errorMsg" style={{ color: "Red" }}>
            Artwork Title is required.
          </p>
        )}
        <label>
          <p className="rating">Rating</p>
          <Controller
            control={control}
            name="rating"
            rules={{ required: true }}
            render={({ onChange }) => (
              <Rating
                count={5}
                onChange={onChange}
                size={24}
                isHalf={false}
                activeColor="#ffd700"
              />
            )}
          />
        </label>

        <label className="art-tags">
          {/* Note: "Add Tag" moves around when adding tags, even if position is set to "fixed" or "absolute" */}
          <p className="field-label">Tags</p>
          <input
            value={tagInputVal}
            onChange={(e) => setTagInputVal(e.target.value)}
            type="text"
            placeholder="Tag"
            style={{ clear: "both" }}
          />
          <button onClick={handleTagSubmit} style={{ clear: "both" }}>
            Add Tag
          </button>
          <div className="tags">
            {tags.map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </div>
        </label>

        <label>
          <p className="field-label">Description</p>
          <textarea
            cols="30"
            rows="8"
            name="description"
            placeholder="Tell us about the art"
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

        {/* give an id since there's multiple input tags */}
        <input type="submit" value="Post Art" id="postArt" />
      </form>
    </section>
  );
}
