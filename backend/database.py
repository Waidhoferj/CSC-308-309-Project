from models import User, Artwork, Portfolio, Achievement, UserMetrics, ArtworkMetrics, Group, GroupMetrics
from testing import get_sample_encoded_art_image, get_sample_encoded_profile_image

def init_db():
    """
        Initializes default entries in the mock database.
    """

    achievements = [
        Achievement(title="Explored 10 Art Locations", description="You have officially discovered 10 art locations. Keep it up!", points=10, threshold=UserMetrics(works_visited=0, works_found=10)),
        Achievement(title="Noob", description="You signed up for the service!", points=10, threshold=UserMetrics())
    ]
    for achievement in achievements:
        achievement.save()

    art = [
        Artwork(title="Street Art", description="A true masterpiece", pictures=[get_sample_encoded_art_image()], location=[-120.664, 35.258], rating=25),
        Artwork(title="Hidden Subway Mural", description="Far side of the subway station has a double walled mural.", pictures=[get_sample_encoded_art_image()], location=[-120.67759172519696, 35.23446092387092], rating=89, metrics=ArtworkMetrics(total_visits=2000)),
        Artwork(title="Blue Bridge", description="Neon blue tentacles of paint wind up the struts of the bridge", pictures=[get_sample_encoded_art_image()], tags=["amazing"], location=[-120.70919388389524, 35.292870133451174], rating=90, metrics=ArtworkMetrics(total_visits=32)),
        Artwork(title="Artistic Underpass", description="Bridge ceiling covered in art", pictures=[get_sample_encoded_art_image()], tags=["surreal", "amazing"], location=[-120.69407509793804, 35.283794177611576], rating=97, metrics=ArtworkMetrics(total_visits=5127)),
        Artwork(title="Fire Wall", description="Tongues of flame comemorate the historic fire of this district", pictures=[get_sample_encoded_art_image()], tags=["sad", "historic", "amazing"], location=[-120.6354510797182, 35.28361728440618], rating=79, metrics=ArtworkMetrics(total_visits=7546)),
        Artwork(title="Street Corner Fresco", description="This popular street has a decorative fresco spilling out of the alley behind a popular restaurant", pictures=[get_sample_encoded_art_image()], tags=["amazing", "unreal"], location=[-120.71145568864382, 35.23659325190852], rating=82, metrics=ArtworkMetrics(total_visits=5234))
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

    

    users = [
        User(name="Grant", personal_portfolio=portfolios[0], bio="Love me some AI and maybe web dev.", profile_pic=get_sample_encoded_profile_image(), email="grant@grant.com", metrics=UserMetrics(), achievements=[achievements[1], achievements[0]]),
        User(name="Braden", personal_portfolio=portfolios[1], bio="Spending some time on CSC 400.", profile_pic=get_sample_encoded_profile_image(), email="braden@braden.com", metrics=UserMetrics(), achievements=[achievements[1]]),
        User(name="Kyle", personal_portfolio=portfolios[2], bio="Fitness, meditation and good books.", profile_pic=get_sample_encoded_profile_image(), email="kyle@kyle.com", metrics=UserMetrics(), achievements=[achievements[1], achievements[0]]),
        User(name="John", personal_portfolio=portfolios[3], bio="Looking around for some art. Wasn't satisfied with my dope Windows Vista wallpaper.", profile_pic=get_sample_encoded_profile_image(), email="john@john.com", metrics=UserMetrics(), achievements=[achievements[1]])
    ]

    groups = [
        Group(name="West Coast Art", bio="Looking for sick art in West Coast cities. Group founders are based in SF and we love our style!", members=[users[0], users[1]], group_portfolio=portfolios[0], metrics=GroupMetrics(artwork_count=2, member_count=2)),
        Group(name="All Art Welcome", bio="We're here for the community, not the categories. Lets see how much art we can collect together!", members=[users[2], users[3]], group_portfolio=portfolios[1], metrics=GroupMetrics(artwork_count=2, member_count=2))
    ]

    for group in groups:
        group.save()

    users[0].groups = [groups[0]]
    users[1].groups = [groups[0]]
    users[2].groups = [groups[1]]
    users[3].groups = [groups[1]]
    for user in users:
        user.save()