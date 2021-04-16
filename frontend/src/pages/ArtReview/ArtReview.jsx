import "./ArtReview.scss";

import { useMutation, gql } from "@apollo/client";
import Rating from "react-rating-stars-component";
import { useState } from "react";
import { ArrowLeft } from "react-feather";
import { useHistory } from "react-router-dom";
import { useForm, Controller, useController } from "react-hook-form";
import usePhotoLibrary from "../../hooks/usePhotoLibrary";
import useProfileInfo from "../../hooks/useProfileInfo";
//import PropTypes from 'prop-types';

import Tag from "../../components/Tag/Tag";

const CREATE_ARTWORK_MUTATION = gql`
  mutation addArtwork(
    $title: String!
    $description: String!
    $foundBy: String!
    $location: [Float]
    $rating: Float
    $pictures: [String]
    $tags: [String]
  ) {
    createArtwork(
      artworkData: {
        title: $title
        description: $description
        foundBy: $foundBy
        location: $location
        rating: $rating
        tags: $tags
        pictures: $pictures
      }
    ) {
      artwork {
        id
      }
    }
  }
`;

export default function ArtReview() {
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
  const [uploadArt] = useMutation(CREATE_ARTWORK_MUTATION);
  const { images, clearLibrary } = usePhotoLibrary();
  const { profile } = useProfileInfo();

  //onSubmit function is passed to handleSubmit function
  function onSubmit(data) {
    const payload = {
      pictures: images,
      location: [-120.664, 35.258], // For demo purposes. We'll attach geolocation to usePhotoLibrary later.
      foundBy: profile.id,
      ...data,
      rating: data.rating * 20,
    };
    uploadArt({ variables: payload }).then((res) => {
      clearLibrary();
      history.push("/artwork/" + res.data.createArtwork.artwork.id);
    });
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
        <img src={images[0]} alt="Art" />
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

/*
ArtReview.propTypes.shape = {
  rating: PropTypes.object.isRequired
}
*/

