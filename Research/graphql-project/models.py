from datetime import datetime
from mongoengine import Document, EmbeddedDocument
from mongoengine.fields import DateTimeField, ReferenceField, StringField, IntField, ListField, PointField, FloatField

class User(Document):
    meta = {"collection": "user"}
    name = StringField(required=True)
    bio = StringField()
    date_joined = DateTimeField(default=datetime.now)
    metrics = ReferenceField("UserMetrics", dbref=True)
    achievements = ListField(ReferenceField("Achievement"), default=list)
    portfolio = ReferenceField("Portfolio", dbref=True)

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
    description = StringField(required=True)
    found_by = ReferenceField(User)
    metrics = ReferenceField("ArtworkMetrics", dbref=True)
    location = PointField()
    rating = FloatField(min_value=0, max_value=100)
    comments = ListField(ReferenceField("Comment"), default=list)
    tags = ListField(StringField(), default=list)

class ArtworkMetrics(EmbeddedDocument):
    totalVisits = IntField(default=0)

class Comment(EmbeddedDocument):
    content = StringField(required=True)
    author = ReferenceField(User, required=True)

class Portfolio(Document):
    meta = {"collection" : "portfolio"}
    owner = ReferenceField(User)
    artworks = ListField(ReferenceField(Artwork), default=list)
