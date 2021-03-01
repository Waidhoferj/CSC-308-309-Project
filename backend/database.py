from models import User, Artwork, Portfolio, Achievement, UserMetrics
from mongoengine import connect
from secrets import DB_ACTUAL_URI, DB_TESTING_URI
from schema import schema

# connect(host=DB_ACTUAL_URI)   # actual db
connect(host=DB_TESTING_URI)    # testing db

def init_db():
    # This all is still adding to the database for testings
    # Note that duplicates are made for every refresh

    achievements = [
        Achievement(title="Explored 10 Art Locations", description="You have officially discovered 10 art locations. Keep it up!", points=10),
        Achievement(title="Noob", description="You signed up for the service!", points=10)
    ]
    for achievement in achievements:
        achievement.save()

    art = [
        Artwork(title="Street Art", description="A true masterpiece"),
        Artwork(title="Hidden Subway Mural", description="Far side of the subway station has a double walled mural."),
        Artwork(title="Blue Bridge", description="Neon blue tentacles of paint wind up the struts of the bridge", tags=["amazing"]),
        Artwork(title="Artistic Underpass", description="Bridge ceiling covered in art", tags=["surreal", "amazing"]),
        Artwork(title="Fire Wall", description="Tongues of flame comemorate the historic fire of this district", tags=["sad", "historic", "amazing"]),
        Artwork(title="Street Corner Fresco", description="This popular street has a decorative fresco spilling out of the alley behind a popular restaurant", tags=["amazing", "unreal"])
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

    testMetrics = UserMetrics()

    users = [
        User(name="Grant", personal_portfolio=portfolios[0], bio="Love me some AI and maybe web dev."),
        User(name="Braden", personal_portfolio=portfolios[1], bio="Spending some time on CSC 400.", metrics=testMetrics, achievements=[achievements[0]]),
        User(name="Kyle", personal_portfolio=portfolios[2], bio="Fitness, meditation and good books."),
        User(name="John", personal_portfolio=portfolios[3], bio="Looking around for some art. Wasn't satisfied with my dope Windows Vista wallpaper.")
    ]

    for user in users:
        user.save()




