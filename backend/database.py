from models import User, Artwork, Portfolio, Achievement
from mongoengine import connect

connect('graphene-mongo-example', host='mongomock://localhost', alias='default')


def init_db():
    art = [
        Artwork(title="Street Art", description="A true masterpiece", location=[7,80]),
        Artwork(title="Hidden Subway Mural", description="Far side of the subway station has a double walled mural.", location=[10,132]),
        Artwork(title="Blue Bridge", description="Neon blue tentacles of paint wind up the struts of the bridge", location=[0,0], tags=["amazing"]),
        Artwork(title="Artistic Underpass", description="Bridge ceiling covered in art", location=[0,0], tags=["surreal", "amazing"]),
        Artwork(title="Fire Wall", description="Tongues of flame comemorate the historic fire of this district", tags=["sad", "historic", "amazing"], location=[0,0]),
        Artwork(title="Street Corner Fresco", description="This popular street has a decorative fresco spilling out of the alley behind a popular restaurant", tags=["amazing", "unreal"], location=[0,0])
    ]

    for a in art:
        a.save()

    portfolios = [
        Portfolio(artworks=[art[0], art[1]]),
        Portfolio(artworks=[art[2], art[4]]),
        Portfolio(artworks=[art[1], art[2], art[3]]),
        Portfolio(artworks=[art[3], art[5]]),
    ]
    for p in portfolios:
        p.save()

    users = [
        User(name="Grant", portfolio=portfolios[0], bio="Love me some AI and maybe web dev."),
        User(name="Braden", portfolio=portfolios[1], bio="Spending some time on CSC 400."),
        User(name="Kyle", portfolio=portfolios[2], bio="Fitness, meditation and good books."),
        User(name="John", portfolio=portfolios[3], bio="Looking around for some art. Wasn't satisfied with my dope Windows Vista wallpaper.")
    ]
    for user in users:
        user.save()

    achievements = [
        Achievement(title="Noob", description="You signed up for the service!", points=10)
    ]
    for a in achievements:
        a.save()

    for user in users:
        user.achievements.append(achievements[0])
    for user, portfolio in zip(users, portfolios):
        portfolio.owner = user

    
    for portfolio in portfolios:
        portfolio.save()


