import "./ArtSubmission.scss";

import { useMutation, gql } from "@apollo/client";
import Rating from "react-rating-stars-component";
import { useEffect, useState } from "react";
import { ArrowLeft } from "react-feather";
import { useHistory } from "react-router-dom";
import { useForm, Controller, useController } from "react-hook-form";
import usePhotoLibrary from "../../hooks/usePhotoLibrary";
import useProfileInfo from "../../hooks/useProfileInfo";
import Spinner from "../../components/Spinner/Spinner";
import ConnectionErrorMessage from "../../components/ConnectionErrorMessage/ConnectionErrorMessage";
import { toast } from "react-toastify";

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

export default function ArtSubmission() {
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
  const [ location, setLocation ] = useState([0, 0]);

  //onSubmit function is passed to handleSubmit function
  function onSubmit(data) {
    if (location[0] === 0 && location[1] === 0) {
      toast("You need to activate your location to submit an artwork.");
      return;
    }
    const payload = {
      pictures: images,
      location: location,
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

  useEffect(() => {
    var options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 10000
    };

    if (!navigator.geolocation) {
      return
      // Geolocation is not supported by this browser.
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation([position?.coords.longitude, position?.coords.latitude])
      },
      (error) => {
        return
      },
      options);
  }, [])
  
  if (location === [0, 0]) {
    return (
      <div>
        <Spinner absCenter={true} />
        <ConnectionErrorMessage>
          Could not access the artwork you requested.
        </ConnectionErrorMessage>
      </div>);
  }

  return (
    <section className="ArtSubmission">
      <header>
        <nav>
          <button className="wrapper" onClick={history.goBack}>
            <ArrowLeft />
          </button>
        </nav>
        <img src={images[0]} alt="Art" />
        <h1>New Artwork</h1>
      </header>
      <form onSubmit={handleSubmit(onSubmit)}>
        <label>
          <p className="field-label">Artwork Title</p>
          <input
            name="title"
            type="text"
            placeholder="Title"
            ref={register({ required: true })}
          />
        </label>

        {errors.title && errors.title.type === "required" && (
          <p className="errorMsg" style={{ color: "Red" }}>
            Artwork Title is required.
          </p>
        )}
        <label>
          <p className="field-label">Rating</p>
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
