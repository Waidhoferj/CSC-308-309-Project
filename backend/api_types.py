from graphene.relay import Node
from models import Settings, User, UserMetrics, Achievement, Artwork, ArtworkMetrics
from models import Comment, Portfolio, Group
from graphene_mongo import MongoengineObjectType
import graphene


class CustomNode(graphene.Node):    # Node that has the same id as Mongo db
    class Meta:
        name = 'IdNode'

    @staticmethod
    def to_global_id(type, id):
        return id

class SettingsType(MongoengineObjectType):
    class Meta:
        model = Settings

class UserType(MongoengineObjectType):
    class Meta:
        model = User
        filter_fields = {
            'name': ['exact', 'icontains', 'istartswith'],
        }
        interfaces = (CustomNode,)

class UserMetricsType(MongoengineObjectType):
    class Meta:
        model = UserMetrics

class AchievementType(MongoengineObjectType):
    class Meta:
        model = Achievement
        interfaces = (CustomNode,)

class ArtworkType(MongoengineObjectType):
    class Meta:
        model = Artwork
        interfaces = (CustomNode,)
    def resolve_tags(self, info):
        print("tags")

class ArtworkMetricsType(MongoengineObjectType):
    class Meta:
        model = ArtworkMetrics

class CommentType(MongoengineObjectType):
    class Meta:
        model = Comment
        interfaces = (CustomNode,)

class PortfolioType(MongoengineObjectType):
    class Meta:
        model = Portfolio
        interfaces = (CustomNode,)      # Uses node because groups can have multiple portfolios

class GroupType(MongoengineObjectType):
    class Meta:
        model = Group
        interfaces = (CustomNode,)