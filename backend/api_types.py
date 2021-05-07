from graphene.relay import Node
from models import *
from graphene_mongo import MongoengineObjectType
import graphene


class SettingsType(MongoengineObjectType):
    """ Represents embedded document within a user. Tracks user settings. """
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
    """ Represents embedded metrics document within a user.
     Tracks user metrics """
    class Meta:
        model = UserMetrics


class GroupMetricsType(MongoengineObjectType):
    """ Represents embedded metrics document within a group.
         Tracks group metrics """
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
    """ Represents embedded metrics document within an artwork.
         Tracks artwork metrics """
    class Meta:
        model = ArtworkMetrics


class CommentType(MongoengineObjectType):
    class Meta:
        model = Comment
        interfaces = (Node,)


class PortfolioType(MongoengineObjectType):
    ''' Portfolio type for users and groups '''
    class Meta:
        model = Portfolio
        interfaces = (Node,)


class GroupType(MongoengineObjectType):
    class Meta:
        model = Group
        interfaces = (Node,)


class ReportType(MongoengineObjectType):
    """ User reports """
    class Meta:
        model = Report
        interfaces = (Node,)
