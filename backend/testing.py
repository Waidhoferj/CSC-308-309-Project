from models import User, Artwork, Portfolio, Achievement, UserMetrics, Comment
from mongoengine import connect
from schema import schema
from graphene.test import Client
import base64
import os
import random
from typing import List
import datetime


def testing_boot_up():
    # NOTE: Must use camel-case in graphql calls, can change this if wanted
    # Number of users: 4
    # Number of artworks: 4
    # Number of groups: 2
    client = Client(schema)
    (users_with_ids,
     artworks_with_ids,
     groups_with_ids,
     achievements_with_ids,
     group_creators_with_members) = mock_db_setup(client)
    run_tests(client, users_with_ids, artworks_with_ids,
              groups_with_ids, group_creators_with_members)


def mock_db_setup(client):
    ''' Will create a mock database with all relational objects
        Currently, just users and artworks are created and related '''
    achievements_with_ids = create_achievements(client)
    users_with_ids = create_users(client)
    #  creates artworks, each with a user that "created" it
    artworks_with_ids = create_artworks(client, users_with_ids)
    #  makes sure each user's portfolio contains the artwork they created
    assign_artworks(client, users_with_ids, artworks_with_ids)
    group_creators_with_members = [  # group_creator: other members
        [users_with_ids[0], users_with_ids[1:3]],
        [users_with_ids[3], users_with_ids[:3]]
    ]
    groups_with_ids = create_groups(client, group_creators_with_members)
    return (users_with_ids, artworks_with_ids,
            groups_with_ids, achievements_with_ids,
            group_creators_with_members)


def run_tests(client, users_with_ids,
              artworks_with_ids, groups_with_ids,
              group_creators_with_members):
    test_removing_artwork(client, users_with_ids[0], artworks_with_ids[1])
    test_consistent_ids(client)
    test_add_artwork_review(client, users_with_ids[1], artworks_with_ids[0])
    test_submit_artwork_review(client,
                               users_with_ids[0],
                               artworks_with_ids[0])
    test_leaving_group(client, groups_with_ids, group_creators_with_members)
    test_group_deletion(client, users_with_ids[0])
    print("--- Tests Successful ---")


def create_achievements(client):
    create_achievement_inputs = [
        ["Explored 10 Art Locations",
         "You have officially visited 10 art locations. Keep it up!",
         10,
         UserMetrics(works_visited=10, works_found=0)],
        ["Noob",
         "You signed up for the service!",
         10,
         UserMetrics()]
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
        achievement = executed["data"]["createAchievement"]["achievement"]
        achievements_with_ids.append((achievement["title"], achievement["id"]))
        # append (user's name, user id)
    return(achievements_with_ids)


def create_users(client):
    create_user_inputs = [
        ("Braden", "Spending some time on CSC 400.",
         "braden@gmail.com", "bradeniscool"),
        ("Grant", "Love me some AI and maybe web dev.",
         "grant@gmail.com", "grantiscool"),
        ("Kyle", "Fitness, meditation and good books.",
         "kyle@gmail.com", "kyleiscool"),
        ("John", "In desperate need for some art",
         "john@gmail.com", "johniscool")]

    users_with_ids = []  # user names with db ids
    for user_input in create_user_inputs:
        executed = client.execute("""
        mutation {{
            createUser(
                userData: {{
                    name: "{0}"
                    bio: "{1}"
                    email: "{2}"
                    password: "{3}"
                    profilePic: "{4}"
                }}
            ) {{
                user {{
                    id
                    name
                }}
            }}
        }}""".format(user_input[0], user_input[1], user_input[2],
                     user_input[3], get_sample_encoded_profile_image()))
        user = executed["data"]["createUser"]["user"]
        users_with_ids.append((user["name"], user["id"]))
        # append (user's name, user id)
    return(users_with_ids)


def create_artworks(client, users_with_ids):
    # Creating artworks
    artworks = [
        ("Hidden Subway Mural",
         "Far side of the subway station has a double walled mural.",
         users_with_ids[0][1],
         "[-120.677494, 35.292708]",
         "55.0", "[\"sick\", \"rad\"]"),
        ("Blue Bridge",
         "Neon blue tentacles of paint wind up the struts of the bridge",
         users_with_ids[1][1],
         "[-121.677494, 32.292708]",
         "75.0", "[\"sick\", \"blue\"]"),
        ("Artistic Underpass",
         "Bridge ceiling covered in art",
         users_with_ids[2][1],
         "[-120.777494, 34.292708]",
         "99.0",
         "[\"overwhelming\", \"scary\"]"),
        ("Fire Wall",
         "Tongues of flame comemorate the historic fire of this district",
         users_with_ids[3][1],
         "[-122.677494, 35.282708]",
         "32.0",
         "[]")
    ]

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
        }}""".format(artwork[0], artwork[1], artwork[2], artwork[3],
                     artwork[4], artwork[5], get_sample_encoded_art_image()))
        artworks_with_ids.append((
            executed["data"]["createArtwork"]["artwork"]["title"],
            executed["data"]["createArtwork"]["artwork"]["id"]))
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
            }}""".format(group_names_and_bios[i][0],
                         group_names_and_bios[i][1],
                         group_set[0][1]))
        group = executed["data"]["createGroup"]["group"]
        groups_with_ids.append((group["name"],  group["id"]))

    # Assuming same order as created for assigning group members
    for i, group_set in enumerate(group_creators_with_members):
        for new_member in group_set[1]:
            executed = client.execute("""
                mutation {{
                    joinGroup(
                        userId: "{0}",
                        groupId: "{1}"
                    ) {{
                        success
                    }}
                }}""".format(new_member[1], groups_with_ids[i][1],))
    return groups_with_ids


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
        Assumptions: update mutation works to add artwork and
                     artwork isn't already in user's portfolio
    '''
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
    ''' Tests the addArtworkReview mutation,
        simply adding fields to artwork '''
    artwork_id = artwork[1]
    user_id = user[1]
    content = "I love this ART!"
    rating = 82
    tags = ["Magnificent"]
    formatted_tags = "[\"Magnificent\"]"

    resp = client.execute("""
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

    old_artwork = resp["data"]["artwork"]
    old_rating = old_artwork["edges"][0]["node"]["rating"]
    old_num_ratings = old_artwork["edges"][0]["node"]["numRatings"]

    resp = client.execute("""
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

    updated_artwork = resp["data"]["addArtworkReview"]["artwork"]

    updated_rating = updated_artwork["rating"]
    updated_num_ratings = updated_artwork["numRatings"]
    updated_comments = updated_artwork["comments"]["edges"]
    updated_tags = updated_artwork["tags"]

    assert updated_num_ratings == old_num_ratings + 1
    assert updated_rating == (((old_rating * old_num_ratings) + rating) /
                              updated_num_ratings)

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
        image_paths = [img for img in os.listdir(path) if img.endswith(".jpg")]
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


def get_comments(num_comments: int, users: List[User]) -> List[Comment]:
    content_lib = [
        "While drawing I discover what I really want to say.",
        "If people only knew how hard I work to gain my mastery.",
        "Inspiration is for amateurs.",
        "In drawing, one must look for real passion.",
        "Art is never finished, only abandoned.",
        "If you as a designer don’t believe in your design, leave",
        "I started painting as a hobby when I was little. I'm pretty good."
    ]

    start_date = datetime.date(2020, 1, 1)
    end_date = datetime.datetime.now().date()
    time_between_dates = end_date - start_date

    comments = []
    for _ in range(num_comments):
        random_number_of_days = random.randrange(time_between_dates.days)
        rand_date = start_date + datetime.timedelta(days=random_number_of_days)
        rand_datetime = (datetime.datetime.
                         combine(rand_date, datetime.datetime.min.time()))
        comment = Comment(author=random.choice(users),
                          content=random.choice(content_lib),
                          date_posted=rand_datetime)
        comments.append(comment)
    return comments


def test_submit_artwork_review(client, user, artwork):  # [name, id]
    reported_id_type = "artwork"
    reported_id = artwork[1]
    user_id = user[1]
    reason = "inappropriate"
    description = "This is a selfie, come on"

    report = client.execute("""
        mutation {{
            createReport(reportData: {{
                reportedIdType: "{0}"
                reportedId: "{1}"
                userId: "{2}"
                reason: "{3}"
                description: "{4}"
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
        """.format(reported_id_type, reported_id,
                   user_id, reason, description))

    report_data = report["data"]["createReport"]["report"]
    assert report_data['reportedIdType'] == reported_id_type
    assert report_data['reportedId'] == reported_id
    assert report_data['userId'] == user_id
    assert report_data['reason'] == reason
    assert report_data['description'] == description


def test_leaving_group(client, groups_with_ids, group_creators_with_members):
    # group_with_ids index relates to index of group_creators_with_members
    # index means they relate to the same group

    def get_user_groups(member_id):
        user_groups = client.execute("""
            query {{
                users(id: "{0}") {{
                    edges {{
                        node {{
                            groups {{
                                edges {{
                                    node {{
                                        id
                                        name                             
                                    }}
                                }}
                            }}
                        }}
                    }}
                }}
            }}""".format(member_id))
        return (user_groups['data']['users']['edges']
                [0]['node']['groups']['edges'])
    
    def get_group_members(group_id):
        group_members = client.execute("""
        query {{
            groups(id: "{0}") {{
                edges {{
                    node {{
                        members {{
                            edges {{
                                node {{
                                    id
                                    name                                    
                                }}
                            }}
                        }}
                    }}
                }}
            }}
        }}""".format(group_id))
        return (group_members['data']['groups']['edges']
                [0]['node']['members']['edges'])


    # first group, not creator, first member on list, id of member 
    member_id = group_creators_with_members[0][1][0][1]
    
    # first group, id of group
    group_id = groups_with_ids[0][1]

    user_before_mutation = get_user_groups(member_id)
    group_before_mutation = get_group_members(group_id)

    resp = client.execute("""
        mutation {{
            leaveGroup(
                userId: "{0}"
                groupId: "{1}"
            ) {{
                success
            }}
        }}
        """.format(member_id, group_id))

    user_after_mutation = get_user_groups(member_id)
    group_after_mutation = get_group_members(group_id)

    for group_node in user_after_mutation:
        assert group_node["node"]["id"] != member_id
    for member_node in group_after_mutation:
        assert member_node["node"]["id"] != group_id


def test_group_deletion(client, user):
    new_group = client.execute("""
        mutation {{
            createGroup(groupData: {{
                name: "Delete Me",
                bio: "Fake group made to be deleted",
                memberToAdd: "{0}"
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
        }}""".format(user[1]))["data"]['createGroup']["group"]

    resp = client.execute("""
        mutation {{
            leaveGroup(
                userId: "{0}"
                groupId: "{1}"
            ) {{
                success
            }}
        }}
        """.format(user[1], new_group["id"]))

    deleted_group = client.execute("""
        query {{
            groups(id: "{0}") {{
                edges {{
                    node {{
                        name
                    }}
                }}
            }}
        }}""".format(new_group["id"]))['data']['groups']['edges']

    assert len(deleted_group) == 0
        

if __name__ == "__main__":
    connect(host="mongomock://localhost")
    testing_boot_up()
