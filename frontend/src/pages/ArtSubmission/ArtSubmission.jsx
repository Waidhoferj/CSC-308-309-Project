import "./ArtSubmission.scss";
 
import Rating from "react-rating-stars-component"
import { useState, useRef } from "react";
import {ArrowLeft, Star} from "react-feather"
import {useHistory} from "react-router-dom"
import {useForm, Controller, useController} from "react-hook-form"
 
import Tag from "../../components/Tag/Tag";
 
 
 
 
export default function ArtSubmission() {
  /* Give a ref to each input field that we got from useForm hook.
  */
  const { register, handleSubmit, control, errors } = useForm();
  const history = useHistory()
  const [tagInputVal, setTagInputVal] = useState("");
  const {
    field: {onChange: updateTagsForm, value: tags}
  } = useController({
    name: "tags",
    control,
    rules: { required: true },
    defaultValue: [],
  });
 
 
  //onSubmit function is passed to handleSubmit function
  function onSubmit(data) {
    console.log("Submitted with", data)
  }
 
  function handleTagSubmit(e)  {
    e.preventDefault()
 
    if(tags.length > 4 || tagInputVal.length === 0) return
 
    setTagInputVal("")
    const newTags = [...tags, tagInputVal]
    updateTagsForm(newTags)
  }
 
  return (
    <section className="ArtSubmission">
 
      <header>
      <nav >
        <button onClick={history.goBack}><ArrowLeft/></button>
      </nav>
      <h1>New Artwork</h1>
 
      </header>
      {/* prevents reaching out to server */}
      {/* handleSubmit handles form submission, sends data to onSubmit func. which gets logged to console */}
      <form onSubmit={handleSubmit(onSubmit)}> 
        <label>
          <p>Artwork Title</p>
          <input name="title" type="text" placeholder="Title" ref={register({required: true})}/>    
        </label>
 
        {errors.title && errors.title.type === "required" && (
            <p className="errorMsg" style={{color: "Red"}}>Artwork Title is required.</p>
        )}
 
        <p>Rating</p>
        {/* Render prop calls func. that returns React elmt instead of implementing its own render logic */}
        <Controller control={control} name="rating" render={({ onChange }) =>
        (<Rating
          count={5}
          onChange={onChange}
          size={24}
          isHalf={false}
          activeColor="#ffd700"
          rules={{ required: true }}
          />)
        }
        />
 
      <section className="art-tags">
        {/* Note: "Add Tag" moves around when adding tags, even if position is set to "fixed" or "absolute" */}
        <input value={tagInputVal} onChange={e => setTagInputVal(e.target.value)} type="text" placeholder="Tag" style={{clear: "both"}}/>
        <button onClick={handleTagSubmit} style={{clear: "both"}}>Add Tag</button>
        <div className="tags">
          {tags.map(tag => <Tag key={tag}>{tag}</Tag>)}
        </div>
 
 
      </section>
 
 
 
 
 
        <label> 
          <p>Description</p>
          <textarea cols="30" 
            rows="8" 
            name="description" 
            placeholder="Tell us about the art" 
            ref={register({
              required: true,
              minLength: 10}  
              )}>
 
          </textarea>
        </label>
 
        {errors.description && errors.description.type === "required" && (
            <p className="errorMsg" style={{color: "Red"}}>Description is required.</p>
        )}
 
        {errors.description && errors.description.type === "minLength" && (
            <p className="errorMsg" style={{color: "Red"}}>
              Description should be at-least 10 characters.
            </p>
        )}
 
        {/* give an id since there's multiple input tags */}
        <input type="submit" value="Post Art" id="postArt"/>
      </form>
 
 
    </section>
 
 
  );
}