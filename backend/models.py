from datetime import datetime
from mongoengine import Document, EmbeddedDocument, CASCADE
from mongoengine.fields import (DateTimeField, ReferenceField, StringField,
                                IntField, ListField, PointField, FloatField,
                                ObjectIdField, BooleanField,
                                EmbeddedDocumentField)
from bson.objectid import ObjectId

# NOTE: In reference fields, dbref = True will use DBRef whereas
#       if it is false, the ObjectId will be used


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
    password = StringField(required=True)
    profile_pic = StringField()
    date_joined = DateTimeField(default=datetime.now)
    metrics = EmbeddedDocumentField("UserMetrics", dbref=True)
    achievements = ListField(ReferenceField("Achievement"), default=list)
    personal_portfolio = EmbeddedDocumentField("Portfolio", default=Portfolio)
    groups = ListField(ReferenceField("Group"), default=list)
    settings = EmbeddedDocumentField("Settings")


class Achievement(Document):
    meta = {"collection": "achievement"}
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


class Artwork(Document):
    meta = {
        "collection": "artwork",
    }
    title = StringField(required=True, primary_key=True)
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


class GroupMetrics(EmbeddedDocument):
    artwork_count = IntField(default=0)
    member_count = IntField(default=0)


class Group(Document):
    meta = {"collection": "group"}
    name = StringField(primary_key=True, required=True)
    bio = StringField()
    members = ListField(ReferenceField("User"), default=list)
    group_portfolio = EmbeddedDocumentField("Portfolio")
    chat = ListField(EmbeddedDocumentField("Comment"), default=list)
    metrics = EmbeddedDocumentField("GroupMetrics", dbref=True)


class Report(Document):
    # want to make sure there is an ordered list by time
    meta = {"collection": "report"}
    reported_id_type = StringField(required=True)   # just "artwork" for now
    reported_id = StringField(required=True)
    user_id = StringField(required=True)
    reason = StringField(required=True)
    description = StringField()
    date_submitted = DateTimeField(default=datetime.now)
