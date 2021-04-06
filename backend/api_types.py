from graphene.relay import Node
from models import Settings, User, UserMetrics, Achievement, Artwork, ArtworkMetrics, GroupMetrics
from models import Comment, Portfolio, Group
from graphene_mongo import MongoengineObjectType
import graphene


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

class GroupMetricsType(MongoengineObjectType):
    class Meta:
        model = GroupMetrics

class AchievementType(MongoengineObjectType):
    class Meta:
        model = Achievement
        interfaces = (Node,)

class ArtworkType(MongoengineObjectType):
    class Meta:
        model = Artwork
        interfaces = (Node,)

class ArtworkMetricsType(MongoengineObjectType):
    class Meta:
        model = ArtworkMetrics

class CommentType(MongoengineObjectType):
    class Meta:
        model = Comment
        interfaces = (Node,)

class PortfolioType(MongoengineObjectType):
    class Meta:
        model = Portfolio
        interfaces = (Node,)      # Uses node because groups can have multiple portfolios

class GroupType(MongoengineObjectType):
    class Meta:
        model = Group
        interfaces = (Node,)