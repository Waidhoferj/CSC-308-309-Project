import "./GroupsList.scss";
import { useMutation, useQuery } from "@apollo/client";
import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState } from "react";
import { useHistory } from "react-router";
import { useForm } from "react-hook-form";
import { Plus } from "react-feather";
import { toast } from "react-toastify";

import useProfileInfo from "../../../hooks/useProfileInfo";
import ConnectionErrorMessage from "../../../components/ConnectionErrorMessage/ConnectionErrorMessage";
import Spinner from "../../../components/Spinner/Spinner";
import Popup from "../../../components/Popup/Popup";
import { GROUP_LIST_QUERY, CREATE_GROUP_MUTATION, resolveGroups } from "./gql";

export default function GroupsList() {
  const { profile } = useProfileInfo();
  const { loading, data, refetch } = useQuery(GROUP_LIST_QUERY, {
    variables: { id: profile?.id },
    notifyOnNetworkStatusChange: true,
  });
  const groups = useMemo(() => resolveGroups(data), [data]);
  const [popupShouldOpen, setPopupShouldOpen] = useState(false);
  let history = useHistory();

  function openGroup(id) {
    history.push("group/" + id);
  }

  if (loading) return <Spinner absCenter={true} />;
  return (
    <article className="GroupsList">
      <header>
        <h1>Groups</h1>
        <button className="wrapper" onClick={() => setPopupShouldOpen(true)}>
          <Plus size={35} />
        </button>
      </header>
      {groups.length ? (
        <ul className="groups">
          {groups.map((group, key) => (
            <GroupCard
              key={key}
              {...group}
              onClick={() => openGroup(group.id)}
            />
          ))}
        </ul>
      ) : (
        <ConnectionErrorMessage>
          Doesn't look like you've joined any groups
        </ConnectionErrorMessage>
      )}

      <AnimatePresence>
        {popupShouldOpen && (
          <CreateGroupPopup
            onClose={() => {
              setPopupShouldOpen(false);
              refetch();
            }}
          />
        )}
      </AnimatePresence>
    </article>
  );
}

/**
 * Widget used for creating new groups. The new group will be added to the user's group list.
 */
function CreateGroupPopup({ onClose }) {
  const [createGroup] = useMutation(CREATE_GROUP_MUTATION);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit } = useForm();
  const { profile } = useProfileInfo();

  async function onSubmit(data) {
    setLoading(true);
    try {
      await createGroup({
        variables: {
          name: data.name,
          bio: data.description,
          creator: profile.id,
        },
      });
      toast(
        `Created ${data.name}! Open the group page and invite your friend via URL`
      );
      onClose();
    } catch (err) {
      console.error(err);
      toast("Something went wrong, try again in a few minutes");
    }
    setLoading(false);
  }

  return (
    <Popup onClose={onClose}>
      <h1>Create New Group</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="create-group-form">
        <label>
          <p className="field-title">Group Name:</p>

          <input
            name="name"
            required
            type="text"
            ref={register({ required: true })}
          />
        </label>
        <label>
          <p className="field-title">Description:</p>
          <textarea
            name="description"
            required
            placeholder="What does this group do?"
            ref={register({
              required: true,
            })}
          ></textarea>
        </label>
        <input type="submit" value="Create Group" disabled={loading} />
      </form>
    </Popup>
  );
}

/**
 * Represents a group in the Group List
 */
function GroupCard({ name, pictures, metrics, id, onClick }) {
  return (
    <li className="GroupCard" onClick={onClick}>
      <div className="images">
        {pictures.map((picture, key) => (
          <img key={key} src={picture} alt="Group profile" />
        ))}
      </div>
      <motion.div className="info" whileTap={{ scale: 0.9 }}>
        <h2>{name}</h2>
        <div className="metrics">
          <p>{metrics.memberCount} members</p>
          <p>{metrics.artworkCount} artworks</p>
        </div>
      </motion.div>
    </li>
  );
}
