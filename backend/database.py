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