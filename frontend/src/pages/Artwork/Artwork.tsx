import "./Artwork.scss";
import {
  ArrowLeft,
  Upload,
  Maximize2,
  Star,
  MessageSquare,
  AlertCircle,
  Users,
  Camera as CamIcon,
} from "react-feather";
import { useQuery, useMutation } from "@apollo/client";
import ArtReview from "../ArtReview/ArtReview";
import Discussion from "../Discussion/Discussion";
<<<<<<< HEAD
import Camera from "../Camera/Camera";
import { toast } from "react-toastify";
||||||| merged common ancestors
=======
import ArtGallery from "../ArtGallery/ArtGallery";
>>>>>>> Fix Routing
import {
  ADD_PHOTOS,
  GET_ARTWORK_DISCUSSION,
  POST_DISCUSSION_MESSAGE,
  GET_ARTWORK,
  GET_GROUPS,
  ADD_ARTWORK_TO_GROUP,
  artCommentResolver,
  ArtworkQueryData,
  groupOptionsResolver,
} from "./gql";
import MetricBadge from "../../components/MetricBadge/MetricBadge";
import Tag from "../../components/Tag/Tag";
import ConnectionErrorMessage from "../../components/ConnectionErrorMessage/ConnectionErrorMessage";
import { useParams, useHistory, Route, Switch } from "react-router-dom";
import Spinner from "../../components/Spinner/Spinner";
import Drawer from "../../components/Drawer/Drawer";
import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import useProfileInfo from "../../hooks/useProfileInfo";
import usePhotoLibrary from "../../hooks/usePhotoLibrary";

export default function Artwork() {
  const { goBack, push } = useHistory();
  const { id } = useParams<{ id: string }>();
  const [showGroupDrawer, setShowGroupDrawer] = useState(false);
  const [addPhotos] = useMutation(ADD_PHOTOS);
  const { images, clearLibrary } = usePhotoLibrary();

  const { loading, error, data } = useQuery<ArtworkQueryData>(GET_ARTWORK, {
    variables: { id },
  });

  if (loading) return <Spinner absCenter={true} />;
  if (error || !data)
    return (
      <ConnectionErrorMessage>
        Could not access the artwork you requested.
      </ConnectionErrorMessage>
    );

  const artwork = data.artwork.edges[0]?.node;

  if (!artwork)
    return (
      <ConnectionErrorMessage>
        Error: Artwork does not exist
      </ConnectionErrorMessage>
    );

  const metrics = [
    { value: artwork.metrics.totalVisits, unit: "Total Visits" },
    { value: artwork.rating / 20, unit: "Stars" },
  ];

  const pic_src = artwork.pictures[0];

  function artPostResolver(postInfo: { message: string; author: string }) {
    return { content: postInfo.message, author: postInfo.author, id };
  }

  function uploadImages() {
    const payload = {
      artworkId: id, 
      pictures_to_add: images,
    };
    addPhotos({ variables: payload }).then((res) => {
      clearLibrary();
      push("/artwork/" + res.data.updateArtwork.artwork.id);
      toast("Images successfully submitted!");
    });
  }

  return (
    <Switch>
      <Route exact path="/artwork/:id">
        <article className="Artwork">
          <header>
            <img src={pic_src} alt="Art" />
            <button className="wrapper back-button" onClick={goBack}>
              <ArrowLeft />
            </button>
            <h1>{artwork.title}</h1>
            <div className="options">
              <button className="wrapper">  
                <Upload />
              </button>
              <button className="wrapper">
                <Maximize2 onClick={() => push("/artwork/" + id + "/art-gallery")}/>
              </button>
            </div>
          </header>

          <div className="content">
            <p className="description">{artwork.description}</p>

            <ul className="tags">
              {artwork.tags?.map((tag) => (
                <li key={tag}>
                  <Tag key={tag}>{tag}</Tag>
                </li>
              ))}
            </ul>
            <button onClick={() => push("/map/lat=" + artwork.location?.coordinates[0]
                                        + "/long=" + artwork.location?.coordinates[1])}
              disabled={!artwork.location}>
              View On Map
            </button>
            <h2>Stats</h2>
            <div className="metric-badges">
              {metrics.map((metric, key) => (
                <MetricBadge key={key} {...metric} />
              ))}
            </div>

            <div className="actions">
              <button onClick={() => push("/artwork/" + id + "/art-review")}>
                <Star />
              </button>
              <button onClick={() => push("/artwork/" + id + "/discussion")}>
                <MessageSquare />
              </button>
              <button onClick={() => push("/artwork/" + id + "/report")}>
                <AlertCircle />
              </button>
              <button onClick={() => push("/artwork/" + id + "/add-photos")}>
                <CamIcon />
              </button>
              <button onClick={() => setShowGroupDrawer(true)}>
                <Users />
              </button>
            </div>
          </div>
          <AnimatePresence>
            {showGroupDrawer && (
              <GroupDrawer
                artworkId={id}
                onClose={() => setShowGroupDrawer(false)}
              />
            )}
          </AnimatePresence>
        </article>
      </Route>
      <Route exact path="/artwork/:id/art-review">
        <ArtReview artwork={artwork} />
      </Route>
      <Route exact path="/artwork/:id/discussion">
        <Discussion
          fetchQuery={GET_ARTWORK_DISCUSSION}
          fetchVariables={{ id }}
          commentResolver={artCommentResolver}
          postMutation={POST_DISCUSSION_MESSAGE}
          postResolver={artPostResolver}
        />
      </Route>
<<<<<<< HEAD
<<<<<<< HEAD
      <Route exact path="/artwork/:id/add-photos">
        <Camera onSubmit={uploadImages}/>
||||||| merged common ancestors
<<<<<<< HEAD
      <Route exact path="/artwork/:id/art-gallery">
        <ArtGallery />
=======
      <Route exact path="/artwork/:id/art-gallery">
        <ArtGallery />
>>>>>>> Change from .tsx to .jsx to fix bug
      </Route>
<<<<<<< HEAD
||||||| merged common ancestors
=======
      <Route exact path="/artwork/:id/art-gallery">
        <ArtGallery />
||||||| merged common ancestors
||||||| merged common ancestors
=======
      <Route exact path="/artwork/:id/add-photos">
        <Camera onSubmit={uploadImages}/>
=======
      <Route exact path="/artwork/:id/add-photos">
        <Camera onSubmit={uploadImages}/>
>>>>>>> Change from .tsx to .jsx to fix bug
      </Route>
<<<<<<< HEAD
>>>>>>> Fix Routing
||||||| merged common ancestors
>>>>>>> main
=======
>>>>>>> Change from .tsx to .jsx to fix bug
    </Switch>
  );
}

interface GroupDrawerProps {
  onClose: () => void;
  artworkId: string;
}

/**
 * Menu for adding selected artwork to a group.
 */
function GroupDrawer({ onClose, artworkId }: GroupDrawerProps) {
  const { profile } = useProfileInfo();
  const { data, loading } = useQuery(GET_GROUPS, {
    variables: { userId: profile?.id },
  });
  const groupOptions = groupOptionsResolver(data);
  const [addArtworkToGroup] = useMutation(ADD_ARTWORK_TO_GROUP);

  function onGroupClick(groupId: string) {
    addArtworkToGroup({
      variables: { artworkId, groupId },
    }).catch(console.error);
    onClose();
  }

  return (
    <Drawer title="Choose Group" onClose={onClose}>
      {loading ? (
        <Spinner absCenter={true} />
      ) : groupOptions.length ? (
        groupOptions.map((option) => (
          <button
            key={option.name}
            className="drawer-button"
            onClick={() => onGroupClick(option.id)}
          >
            {option.name}
          </button>
        ))
      ) : (
        <p>Looks like you haven't joined any groups yet.</p>
      )}
    </Drawer>
  );
}
