from datetime import datetime
from mongoengine import Document, EmbeddedDocument
from mongoengine.fields import DateTimeField, ReferenceField, StringField, IntField, ListField, PointField, FloatField, BooleanField

# Note: Boolean field seems to exist in documentation, but not in autocomplete here

class Settings(Document):
    autoAddToGroupPortfolio = BooleanField(default=True)

class User(Document):
    meta = {"collection": "user"}
    name = StringField(required=True)
    bio = StringField()
    date_joined = DateTimeField(default=datetime.now)
    metrics = ReferenceField("UserMetrics", dbref=True)
    achievements = ListField(ReferenceField("Achievement"), default=list)
    portfolio = ReferenceField("PersonalPortfolio", dbref=True)

class UserMetrics(EmbeddedDocument):
    works_visited = IntField(default=0)
    works_found = IntField(default=0)
    cities_visited = IntField(default=0)
    posts_written = IntField(default=0)

class Achievement(Document):
    meta = {"collection" : "achievement"}
    title = StringField(required=True)
    description = StringField(required=True)
    points = IntField(required=True)

class Artwork(Document):
    meta = {"collection": "artwork"}
    title = StringField(required=True)
    artist = StringField(required=True)
    description = StringField(required=True)
    found_by = ReferenceField("User")
    location = PointField()
    metrics = ReferenceField("ArtworkMetrics", dbref=True)
    rating = FloatField(min_value=0, max_value=100)
    comments = ListField(ReferenceField("Comment"), default=list)
    tags = ListField(StringField(), default=list)

class ArtworkMetrics(EmbeddedDocument):
    totalVisits = IntField(default=0)

class Comment(EmbeddedDocument):
    content = StringField(required=True)
    author = ReferenceField("User", required=True)
    # could add int attribute for likes

class PersonalPortfolio(Document):
    meta = {"collection" : "portfolio"}
    owner = ReferenceField("User")
    artworks = ListField(ReferenceField("Artwork"), default=list)

class GroupPortfolio(Document):
    meta = {"collection" : "portfolio"}
    owner = ReferenceField("Group")
    artworks = ListField(ReferenceField("Artwork"), default=list)

class Group(Document):
    meta = {"collection": "group"}
    name = StringField(required=True)
    bio = StringField()
    members = ListField(ReferenceField("User"), default=list)
    portfolio = ReferenceField("GroupPortfolio")  # unsure how to use Portfolio object here
    chat = ListField(ReferenceField("Comment"), default=list)     # this is replacing the "ChatRoom object" for now



