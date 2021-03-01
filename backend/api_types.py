from graphene.relay import Node
from models import Settings, User, UserMetrics, Achievement, Artwork, ArtworkMetrics
from models import Comment, Portfolio, Group

from graphene_mongo import MongoengineObjectType


class SettingsType(MongoengineObjectType):
    class Meta:
        model = Settings

class UserType(MongoengineObjectType):
    class Meta:
        model = User
        filter_fields = {
            'name': ['exact', 'icontains', 'istartswith'],
        }
        interfaces = (Node,)

class UserMetricsType(MongoengineObjectType):
    class Meta:
        model = UserMetrics
        interfaces = (Node,)

class AchievementType(MongoengineObjectType):
    class Meta:
        model = Achievement
        interfaces = (Node,)

class ArtworkType(MongoengineObjectType):
    class Meta:
        model = Artwork
        interfaces = (Node,)
    def resolve_tags(self, info):
        print("tags")

class ArtworkMetricsType(MongoengineObjectType):
    class Meta:
        model = ArtworkMetrics
        interfaces = (Node,)

class CommentType(MongoengineObjectType):
    class Meta:
        model = Comment
        interfaces = (Node,)

class PortfolioType(MongoengineObjectType):
    class Meta:
        model = Portfolio
        interfaces = (Node,)

class GroupType(MongoengineObjectType):
    class Meta:
        model = Group
        interfaces = (Node,)