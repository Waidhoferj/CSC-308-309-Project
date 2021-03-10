from models import User, Artwork, Portfolio, Achievement, UserMetrics
from mongoengine import connect
from secrets import DB_ACTUAL_URI, DB_TESTING_URI
from schema import schema
from graphene.test import Client


def testing_boot_up():
    # NOTE: Must use camel-case in graphql calls, can change this if wanted
    client = Client(schema)
    users_with_ids, artworks_with_ids = mock_db_setup(client)
    # print(users_with_ids)
    # print(artworks_with_ids)
    run_tests(client, users_with_ids, artworks_with_ids)


def mock_db_setup(client):
    ''' Will create a mock database with all relational objects
        Currently, just users and artworks are created and related '''
    users_with_ids = create_users(client) # creates users
    artworks_with_ids = create_artworks(client, users_with_ids) # creates artworks, each with a user that "created" it
    assign_artworks(client, users_with_ids, artworks_with_ids)  # makes sure each user's portfolio contains the artwork they created
    return users_with_ids, artworks_with_ids


def run_tests(client, users_with_ids, artworks_with_ids):
    test_removing_artwork(client, users_with_ids[0], artworks_with_ids[1])
    test_consistent_ids(client)


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
  	            }}
	        ) {{
                id
                user {{
                  name
                }}
            }}
        }}""".format(user_input[0], user_input[1], user_input[2]))
        users_with_ids.append((user_input[0], executed["data"]["createUser"]["id"]))
        # append (user's name, user id)
    return(users_with_ids)
    

def create_artworks(client, users_with_ids):
    # Creating artworks
    artworks = [
        ("Hidden Subway Mural", "Far side of the subway station has a double walled mural.", users_with_ids[0][1], "[-120.677494, 35.292708]", "55.0", "[\"sick\", \"rad\"]"),
        ("Blue Bridge", "Neon blue tentacles of paint wind up the struts of the bridge", users_with_ids[1][1], "[-121.677494, 32.292708]", "75.0", "[\"sick\", \"blue\"]"),
        ("Artistic Underpass", "Bridge ceiling covered in art", users_with_ids[2][1], "[-120.777494, 34.292708]", "99.0", "[\"overwhelming\", \"scary\"]"),
        ("Fire Wall", "Tongues of flame comemorate the historic fire of this district", users_with_ids[3][1], "[-122.677494, 35.282708]", "32.0", "[\"unsafe\", \"exciting\"]")
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
                tags: {5}
            }}) {{
                id
                artwork {{
                  title
                }}
                tags
            }}
        }}""".format(artwork[0], artwork[1], artwork[2], artwork[3], artwork[4], artwork[5]))
        artworks_with_ids.append((artwork[0], executed["data"]["createArtwork"]["id"]))
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

def test_consistent_ids(client):
    ''' Tests whether or not hard coded ids have changed '''
    test1 = client.execute("""
        query {{
            users(id: "braden@gmail.com") {{
                edges {{
                    node {{
                        name
                    }}
                }}
            }}
        }}
    """)


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