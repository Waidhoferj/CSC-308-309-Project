from graphene.relay import Node
from models import Settings, User, UserMetrics, Achievement, Artwork, ArtworkMetrics
from models import Comment, Portfolio, Group
from graphene_mongo import MongoengineObjectType
import graphene


class CustomNode(graphene.Node):    # Node that has the same id as Mongo db
    class Meta:
        name = 'Node'

    @staticmethod
    def to_global_id(type, id):
        print("id: " + id)
        return id
    
    # @staticmethod
    # def from_global_id(global_id):
    #     print("global_id: " + global_id)
    #     return global_id

    @staticmethod
    def get_node_from_global_id(info, global_id, only_type=None):
        print("\nget_node_from_global_id is being called\n")
        type_, id = global_id.split(':')
        print(type_ + ", " + id)

class SettingsType(MongoengineObjectType):
    class Meta:
        model = Settings

class UserType(MongoengineObjectType):
    interfaces = (CustomNode,)
    class Meta:
        model = User
        filter_fields = {
            'name': ['exact', 'icontains', 'istartswith'],
        }
        

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