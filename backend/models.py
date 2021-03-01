from datetime import datetime
from mongoengine import Document, EmbeddedDocument, CASCADE
from mongoengine.fields import DateTimeField, ReferenceField, StringField, IntField, ListField, PointField, FloatField, BooleanField, EmbeddedDocumentField


# Note: In reference fields, dbref = True will use DBRef whereas if it is false, the ObjectId will be used

# Portfolios seem to have a one to one relationship with groups and users

class Settings(EmbeddedDocument):
    autoAddToGroupPortfolio = BooleanField(default=False)

class Portfolio(EmbeddedDocument): 
    artworks = ListField(ReferenceField("Artwork"), default=list)

class UserMetrics(EmbeddedDocument):
    works_visited = IntField(default=0)
    works_found = IntField(default=0)
    cities_visited = IntField(default=0)
    posts_written = IntField(default=0)

class User(Document):
    meta = {"collection": "user"}
    name = StringField(required=True)
    bio = StringField()
    date_joined = DateTimeField(default=datetime.now)
    metrics = EmbeddedDocumentField("UserMetrics", dbref=True)
    achievements = ListField(ReferenceField("Achievement"), default=list)
    personal_portfolio = EmbeddedDocumentField("Portfolio", default=Portfolio)  
    groups = ListField(ReferenceField("Group"), default=list)
    settings = EmbeddedDocumentField("Settings")

class Achievement(Document):
    meta = {"collection" : "achievement"}
    title = StringField(required=True)
    description = StringField(required=True)
    points = IntField(required=True)
    # might wanna have metrics that have to be met to obtain

class ArtworkMetrics(EmbeddedDocument):
    totalVisits = IntField(default=0)

class Comment(EmbeddedDocument):
    content = StringField(required=True)
    author = ReferenceField("User", required=True)
    # could add int attribute for likes, would have to associate it with the user though

class Artwork(Document):
    meta = {"collection": "artwork"}
    title = StringField(required=True)
    artist = StringField(required=False)
    description = StringField(required=True)
    found_by = ReferenceField("User")
    location = PointField()
    metrics = EmbeddedDocumentField("ArtworkMetrics")
    rating = FloatField(min_value=0, max_value=100)
    comments = ListField(EmbeddedDocumentField("Comment"), default=list)
    tags = ListField(StringField(), default=list)
    # could make tags their own type of document to parse and reference

class Group(Document):
    meta = {"collection": "group"}
    name = StringField(required=True)
    bio = StringField()
    members = ListField(ReferenceField("User"), default=list)
    portfolio = EmbeddedDocumentField("Portfolio") 
    chat = ListField(EmbeddedDocumentField("Comment"), default=list)

