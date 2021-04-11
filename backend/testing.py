from models import User, Artwork, Portfolio, Achievement, UserMetrics
from mongoengine import connect
from secrets import DB_ACTUAL_URI, DB_TESTING_URI
from schema import schema
from graphene.test import Client
import base64
import os
import random


def testing_boot_up():
    # NOTE: Must use camel-case in graphql calls, can change this if wanted
    # Number of users: 4
    # Number of artworks: 4
    # Number of groups: 2
    client = Client(schema)
    users_with_ids, artworks_with_ids, groups_with_ids, achievements_with_ids = mock_db_setup(client)
    # print(users_with_ids)
    # print(artworks_with_ids)
    run_tests(client, users_with_ids, artworks_with_ids, groups_with_ids)


def mock_db_setup(client):
    ''' Will create a mock database with all relational objects
        Currently, just users and artworks are created and related '''
    achievements_with_ids = create_achievements(client)
    users_with_ids = create_users(client)
    artworks_with_ids = create_artworks(client, users_with_ids) # creates artworks, each with a user that "created" it
    assign_artworks(client, users_with_ids, artworks_with_ids)  # makes sure each user's portfolio contains the artwork they created
    group_creators_with_members = [ # group_creator: other members
        [users_with_ids[0], users_with_ids[1:3]],
        [users_with_ids[3], users_with_ids[:3]]
    ]
    groups_with_ids = create_groups(client, group_creators_with_members)
    return users_with_ids, artworks_with_ids, groups_with_ids, achievements_with_ids


def run_tests(client, users_with_ids, artworks_with_ids, groups_with_ids):
    test_removing_artwork(client, users_with_ids[0], artworks_with_ids[1])
    test_consistent_ids(client)
    test_add_artwork_review(client, users_with_ids[1], artworks_with_ids[0])
    #test_submit_artwork_review(client, users_with_ids[0], artworks_with_ids[0])
    print("--- Tests Successful ---")


def create_achievements(client):
    create_achievement_inputs = [
        ["Explored 10 Art Locations", "You have officially visited 10 art locations. Keep it up!", 10, UserMetrics(works_visited=10, works_found=0)],
        ["Noob", "You signed up for the service!", 10, UserMetrics()]
    ]
    achievements_with_ids = []
    for achievement_input in create_achievement_inputs:
        executed = client.execute("""
        mutation {{
            createAchievement(
  	            achievementData: {{
    	            title: "{0}"
    	            description: "{1}"
                    points: {2}
                    threshold: {{
                        worksVisited: {3},
                        worksFound: {4}
                    }}
  	            }}
	        ) {{
                achievement {{
                    title
                    id
                }}
            }}
        }}""".format(
            achievement_input[0], achievement_input[1],
            achievement_input[2], achievement_input[3]["works_visited"],
            achievement_input[3]["works_found"]))
        achievements_with_ids.append((executed["data"]["createAchievement"]["achievement"]["title"], executed["data"]["createAchievement"]["achievement"]["id"]))
        # append (user's name, user id)
    return(achievements_with_ids)


def create_users(client):
    create_user_inputs = [
        ("Braden", "Spending some time on CSC 400.", "braden@gmail.com"),
        ("Grant", "Love me some AI and maybe web dev.", "grant@gmail.com"),
        ("Kyle", "Fitness, meditation and good books.", "kyle@gmail.com"),
        ("John", "Looking around for some art. Wasn't satisfied with my dope Windows Vista wallpaper.", "john@gmail.com")]
    
    users_with_ids = [] # user names with db ids
    for user_input in create_user_inputs:
        executed = client.execute("""
        mutation {{
            createUser(
  	            userData: {{
    	            name: "{0}"
    	            bio: "{1}"
                    email: "{2}"
                    profilePic: "{3}"
  	            }}
	        ) {{
                user {{
                    id
                    name
                }}
            }}
        }}""".format(user_input[0], user_input[1], user_input[2], get_sample_encoded_profile_image()))
        users_with_ids.append((executed["data"]["createUser"]["user"]["name"], executed["data"]["createUser"]["user"]["id"]))
        # append (user's name, user id)
    return(users_with_ids)
    

def create_artworks(client, users_with_ids):
    # Creating artworks
    artworks = [
        ("Hidden Subway Mural", "Far side of the subway station has a double walled mural.", users_with_ids[0][1], "[-120.677494, 35.292708]", "55.0", "[\"sick\", \"rad\"]"),
        ("Blue Bridge", "Neon blue tentacles of paint wind up the struts of the bridge", users_with_ids[1][1], "[-121.677494, 32.292708]", "75.0", "[\"sick\", \"blue\"]"),
        ("Artistic Underpass", "Bridge ceiling covered in art", users_with_ids[2][1], "[-120.777494, 34.292708]", "99.0", "[\"overwhelming\", \"scary\"]"),
        ("Fire Wall", "Tongues of flame comemorate the historic fire of this district", users_with_ids[3][1], "[-122.677494, 35.282708]", "32.0", "[]")
    ]   # Might wanna change location data for more testable locations (like within radius of me)

    artworks_with_ids = []
    for artwork in artworks:
        executed = client.execute("""
        mutation {{
            createArtwork(artworkData: {{
                title: "{0}",
                description: "{1}",
                foundBy: "{2}",
                location: {3},
                rating: {4},
                tags: {5},
                pictures: "[{6}]"
            }}) {{
                artwork {{
                    id
                    title
                    tags
                }}
            }}
        }}""".format(artwork[0], artwork[1], artwork[2], artwork[3], artwork[4], artwork[5], get_sample_encoded_art_image()))
        #print(executed)
        artworks_with_ids.append((executed["data"]["createArtwork"]["artwork"]["title"], executed["data"]["createArtwork"]["artwork"]["id"]))
    return artworks_with_ids

def assign_artworks(client, users_with_ids, artworks_with_ids):
    for user, artwork in zip(users_with_ids, artworks_with_ids):
        executed = client.execute("""
        mutation {{
            updateUser(userData: {{
                id: "{0}",
                artToAdd: "{1}"    
            }}) {{
                user {{
                    name,
                    personalPortfolio {{
                        artworks {{
                        edges {{
                            node {{
                                id,
                                title
                            }}
                        }}
                    }}
                }}
            }}
        }} }}
        """.format(user[1], artwork[1]))

def create_groups(client, group_creators_with_members):
    group_names_and_bios = [
        ["GeoArtBoys", "Geography lovers who take pics"],
        ["StatueLovers", "Show me a statue and I'll show you my camera"]
    ]
    groups_with_ids = []
    for i, group_set in enumerate(group_creators_with_members):
        executed = client.execute("""
            mutation {{
                createGroup(groupData: {{
                    name: "{0}",
                    bio: "{1}",
                    memberToAdd: "{2}"
                }}) {{
                    group {{
                        id
                        name
                        bio
                        members {{
                            edges {{
                                node {{
                                    name
                                }}
                            }}
                        }}
                    }}
                }}
            }}""".format(group_names_and_bios[i][0], group_names_and_bios[i][1], group_set[0][1]))
        groups_with_ids.append(
            (executed["data"]["createGroup"]["group"]["name"],  executed["data"]["createGroup"]["group"]["id"]))
    
    # Assuming same order as created for assigning group members
    for i, group_set in enumerate(group_creators_with_members):
        for new_member in group_set[1]:
            executed = client.execute("""
                mutation {{
                    updateGroup(groupData: {{
                        id: "{0}",
                        memberToAdd: "{1}"
                    }}) {{
                        group {{
                            id
                            name
                            bio
                            members {{
                                edges {{
                                    node {{
                                        name
                                    }}
                                }}
                            }}
                        }}
                    }}
                }}""".format(groups_with_ids[i][1], new_member[1]))


def test_consistent_ids(client):
    ''' Tests whether or not hard coded ids have changed '''
    TEST_ID = "VXNlclR5cGU6YnJhZGVuQGdtYWlsLmNvbQ=="
    TEST_NAME = "Braden"
    test = client.execute("""
        query {{
            users(id: "{0}") {{
                edges {{
                    node {{
                        name
                    }}
                }}
            }}
        }}
    """.format(TEST_ID))
    
    expected_name = test['data']['users']['edges'][0]['node']['name']
    if TEST_NAME != expected_name:
        print("IDs are not consistent")


def test_removing_artwork(client, userNameId, artworkNameId):
    ''' Will add the artwork, and then delete it
        Assumptions: update mutation works to add artwork and artwork isn't already in user's portfolio '''
    
    before = client.execute("""
        mutation {{
            updateUser(userData: {{
                id: "{0}",   
            }}) {{
                user {{
                    name,
                    personalPortfolio {{
                        artworks {{
                        edges {{
                            node {{
                                id,
                                title
                            }}
                        }}
                    }}
                }}
            }}
        }} }}
        """.format(userNameId[1]))

    added = client.execute("""
        mutation {{
            updateUser(userData: {{
                id: "{0}",
                artToAdd: "{1}"    
            }}) {{
                user {{
                    name,
                    personalPortfolio {{
                        artworks {{
                        edges {{
                            node {{
                                id,
                                title
                            }}
                        }}
                    }}
                }}
            }}
        }} }}
        """.format(userNameId[1], artworkNameId[1]))

    removed = client.execute("""
        mutation {{
            updateUser(userData: {{
                id: "{0}",
                artToRemove: "{1}"    
            }}) {{
                user {{
                    name,
                    personalPortfolio {{
                        artworks {{
                        edges {{
                            node {{
                                id,
                                title
                            }}
                        }}
                    }}
                }}
            }}
        }} }}
        """.format(userNameId[1], artworkNameId[1]))
    if removed != before:
        print("Artwork Removal Failed")

def test_add_artwork_review(client, user, artwork):
    ''' Tests the addArtworkReview mutation, simply adding fields to artwork '''
    artwork_id = artwork[1]
    user_id = user[1]
    content = "I love this ART!"
    rating = 82
    tags = ["Magnificent"]
    formatted_tags = "[\"Magnificent\"]"

    old_artwork = client.execute("""
        query {{
            artwork(id: "{0}") {{
                edges {{
                    node {{
                        rating
                        numRatings
                    }}
                }}
            }}
        }}""".format(artwork_id))
    old_rating = old_artwork["data"]["artwork"]["edges"][0]["node"]["rating"]
    old_num_ratings = old_artwork["data"]["artwork"]["edges"][0]["node"]["numRatings"]


    updated_artwork = client.execute("""
        mutation {{
            addArtworkReview(reviewData: {{
                artworkId: "{0}",
                comment: {{
                    author: "{1}",
                    content: "{2}"
                }},
                rating: {3},
                tags: {4}
            }}) {{
                artwork {{
                    id
                    title
                    rating
                    numRatings
                    comments {{
                        edges {{
                            node {{
                                author {{
                                    id
                                }}
                                content
                            }}
                        }}
                    }}
                    tags
                }}
            }}
        }}
        """.format(artwork_id, user_id, content, rating, formatted_tags))

    updated_rating = updated_artwork["data"]["addArtworkReview"]["artwork"]["rating"]
    updated_num_ratings = updated_artwork["data"]["addArtworkReview"]["artwork"]["numRatings"]
    updated_comments = updated_artwork["data"]["addArtworkReview"]["artwork"]["comments"]["edges"]
    updated_tags = updated_artwork["data"]["addArtworkReview"]["artwork"]["tags"]

    assert updated_num_ratings == old_num_ratings + 1
    assert updated_rating == ((old_rating * old_num_ratings) + rating) / updated_num_ratings
    
    comment_added = False
    for comment_node in updated_comments:
        if comment_node["node"]["author"]["id"] == user_id:
            if comment_node["node"]["content"] == content:
                comment_added = True
    assert comment_added
    for tag in tags:
        assert tag in updated_tags
    

def get_sample_encoded_art_image(filepath="") -> str:
    if filepath == "":
        # select random image if not supplied with a path
        path = "./assets/sample-artworks"
        image_paths = os.listdir(path)
        filepath = os.path.join(path, random.choice(image_paths)) 
    return b64_encode_image(filepath)

def get_sample_encoded_profile_image() -> str:
    return b64_encode_image("../frontend/src/assets/example-profile-pic.png")

def b64_encode_image(filepath: str) -> str:
    """
    Base64 encodes image at filepath location. Returns base64 string.
    """
    suffix = filepath.split(".")[-1]
    header = f"data:image/{suffix};base64,"
    with open(filepath, "rb") as image_file:
        encoded_image = base64.b64encode(image_file.read()).decode()
        return header + encoded_image


def test_submit_artwork_review(client, user, artwork): #[name, id]
    reported_id_type = "artwork"
    reported_id = artwork[1]
    user_id = user[1]
    reason = "inappropriate"
    description = "This is a selfie, come on"



    report = client.execute("""
        mutation {{
            createReport(reportData: {{
                reportedIdType: "{0}",
    	        reportedId: "{1}",
    	        userId: "{2}",
    	        reason: "{3}"
            }}) {{
                report {{
                    reportedIdType
                    reportedId
                    userId
                    reason
                    description
                    }}
                }}
            }}
        }}
        """.format(reported_id_type, reported_id, user_id, reason, description))
    
    print(report)