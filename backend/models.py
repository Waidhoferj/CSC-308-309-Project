from datetime import datetime
from mongoengine import Document, EmbeddedDocument, CASCADE
from mongoengine.fields import DateTimeField, ReferenceField, StringField, IntField, ListField, PointField, FloatField, BooleanField, EmbeddedDocumentField
from mongoengine.fields import ObjectIdField
from bson.objectid import ObjectId


# Note: In reference fields, dbref = True will use DBRef whereas if it is false, the ObjectId will be used

# Portfolios seem to have a one to one relationship with groups and users

class Settings(EmbeddedDocument):
    autoAddToGroupPortfolio = BooleanField(default=False)

class Portfolio(EmbeddedDocument): 
    artworks = ListField(ReferenceField("Artwork"), default=list)

class UserMetrics(EmbeddedDocument):
    works_visited = IntField(default=0)
    works_found = IntField(default=0)

class User(Document):
    meta = {"collection": "user"}
    name = StringField(required=True)
    bio = StringField()
    email = StringField(primary_key=True, required=True)
    profile_pic = StringField()
    date_joined = DateTimeField(default=datetime.now)
    metrics = EmbeddedDocumentField("UserMetrics", dbref=True)
    achievements = ListField(ReferenceField("Achievement"), default=list)
    personal_portfolio = EmbeddedDocumentField("Portfolio", default=Portfolio)  
    groups = ListField(ReferenceField("Group"), default=list)
    settings = EmbeddedDocumentField("Settings")

class Achievement(Document):
    meta = {"collection" : "achievement"}
    title = StringField(primary_key=True, required=True)
    description = StringField(required=True)
    points = IntField(required=True)
    threshold = EmbeddedDocumentField("UserMetrics")
    # might wanna have metrics that have to be met to obtain

class ArtworkMetrics(EmbeddedDocument):
    total_visits = IntField(default=0)

class Comment(EmbeddedDocument):
    content = StringField(required=True)
    author = ReferenceField("User", required=True)
    date_posted = DateTimeField(default=datetime.now)
    # could add int attribute for likes, would have to associate it with the user though

class Artwork(Document):
    meta = {
        "collection": "artwork",
        #"indexes": [("location", "2dsphere")]
    }
    title = StringField(required=True, primary_key=True)    # Making this primary key for now despite it not being unique
    artist = StringField(required=False)
    description = StringField(required=True)
    pictures = ListField(StringField(), default=list)
    found_by = ReferenceField("User")
    location = PointField(required=True)
    date_created = DateTimeField(default=datetime.now)
    metrics = EmbeddedDocumentField("ArtworkMetrics", default=ArtworkMetrics)
    num_ratings = IntField(default=1)
    rating = FloatField(min_value=0, max_value=100, default=0)
    comments = ListField(EmbeddedDocumentField("Comment"), default=list)
    tags = ListField(StringField(), default=list)

class Group(Document):
    meta = {"collection": "group"}
    name = StringField(primary_key=True, required=True)     # Making this primary key for now despite it not being unique
    bio = StringField()
    members = ListField(ReferenceField("User"), default=list)
    group_portfolio = EmbeddedDocumentField("Portfolio")
    chat = ListField(EmbeddedDocumentField("Comment"), default=list)
    metrics = EmbeddedDocumentField("GroupMetrics", dbref=True)
    # date created can be the primary key

class Report(Document):
    # want to make sure there is an ordered list by time
    meta = {"collection": "group"}
    reported_id_type = StringField(required=True)   # just "artwork" for now
    reported_id = StringField(required=True)
    user_id = StringField(required=True)
    reason = StringField(required=True)
    description = StringField()
    date_submitted = DateTimeField(default=datetime.now) 

