<<<<<<< HEAD
from models import User, Artwork, Portfolio, Achievement, UserMetrics, ArtworkMetrics

def init_db():
    """
        Initializes default entries in the mock database.
    """

    achievements = [
        Achievement(title="Explored 10 Art Locations", description="You have officially discovered 10 art locations. Keep it up!", points=10),
        Achievement(title="Noob", description="You signed up for the service!", points=10)
    ]
    for achievement in achievements:
        achievement.save()

    art = [
        Artwork(title="Street Art", description="A true masterpiece", location=[-120.71691615739553, 35.25274443264594], rating=25),
        Artwork(title="Hidden Subway Mural", description="Far side of the subway station has a double walled mural.", location=[-120.67759172519696, 35.23446092387092], rating=89, metrics=ArtworkMetrics(totalVisits=2000)),
        Artwork(title="Blue Bridge", description="Neon blue tentacles of paint wind up the struts of the bridge", tags=["amazing"], location=[-120.70919388389524, 35.292870133451174], rating=90, metrics=ArtworkMetrics(totalVisits=32)),
        Artwork(title="Artistic Underpass", description="Bridge ceiling covered in art", tags=["surreal", "amazing"], location=[-120.69407509793804, 35.283794177611576], rating=97, metrics=ArtworkMetrics(totalVisits=5127)),
        Artwork(title="Fire Wall", description="Tongues of flame comemorate the historic fire of this district", tags=["sad", "historic", "amazing"], location=[-120.6354510797182, 35.28361728440618], rating=79, metrics=ArtworkMetrics(totalVisits=7546)),
        Artwork(title="Street Corner Fresco", description="This popular street has a decorative fresco spilling out of the alley behind a popular restaurant", tags=["amazing", "unreal"], location=[-120.71145568864382, 35.23659325190852], rating=82, metrics=ArtworkMetrics(totalVisits=5234))
    ]
    # Haven't tested how to input location for art at the moment
    for a in art:
        a.save()

    portfolios = [
        Portfolio(artworks=[art[0], art[1]]),
        Portfolio(artworks=[art[2], art[4]]),
        Portfolio(artworks=[art[1], art[2], art[3]]),
        Portfolio(artworks=[art[3], art[5]]),
    ]
=======
from models import User, Artwork, Portfolio, Achievement, UserMetrics
from mongoengine import connect
from secrets import DB_ACTUAL_URI, DB_TESTING_URI
from schema import schema
from graphene.test import Client

def connect_to_db(type):
    if type == "ACTUAL":
        connect(host=DB_ACTUAL_URI)
    elif type == "TESTING":
        connect(host=DB_TESTING_URI)
    elif type == "MOCK":
        connect('graphene-mongo-example', host='mongomock://localhost', alias='default')
        mock_db_setup()


def mock_db_setup():
    client = Client(schema)
>>>>>>> 4de2d24 (Updated mutations and mock db)

    names_and_bios = [
        ("Braden", "Spending some time on CSC 400."),
        ("Grant", "Love me some AI and maybe web dev."),
        ("Kyle", "Fitness, meditation and good books."),
        ("John", "Looking around for some art. Wasn't satisfied with my dope Windows Vista wallpaper.")]
    
    user_ids = [] # db ids for users above
    for nameBio in names_and_bios:
        executed = client.execute("""
        mutation {{
            createUser(
  	            userData: {{
    	            name: "{0}"
    	            bio: "{1}"
  	            }}
	        ) {{
                id
                user {{
                  name
                }}
            }}
        }}""".format(nameBio[0], nameBio[1]))
        user_ids.append(executed["data"]["createUser"]["id"])
        # print(ids)
    

    artworks = [
        ("Hidden Subway Mural", "Far side of the subway station has a double walled mural.", user_ids[0], "[-120.677494, 35.292708]", "55.0"),
        ("Blue Bridge", "Neon blue tentacles of paint wind up the struts of the bridge", user_ids[1], "[-121.677494, 32.292708]", "75.0"),
        ("Artistic Underpass", "Bridge ceiling covered in art", user_ids[2], "[-120.777494, 34.292708]", "99.0"),
        ("Fire Wall", "Tongues of flame comemorate the historic fire of this district", user_ids[3], "[-122.677494, 35.282708]", "32.0")
    ]

    artwork_ids = []
    for artwork in artworks:
        executed = client.execute("""
        mutation {{
            createArtwork(artworkData: {{
                title: "{0}",
                description: "{1}"
                foundBy: "{2}",
                location: {3},
                rating: {4},
            }}) {{
                id
                artwork {{
                  title
                }}
            }}
        }}""".format(artwork[0], artwork[1], artwork[2], artwork[3], artwork[4]))
        artwork_ids.append(executed["data"]["createArtwork"]["id"])
    print(user_ids)
    print(artwork_ids)


    for user, artwork in zip(user_ids, artwork_ids):
        # this mutation doesn't seem to work entirely
        executed = client.execute("""
        mutation {{
            updateUser(userData: {{
                id: "{0}",
                art_to_add: "{1}"    
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
        """.format(user, artwork))
        print(executed)




