from graphene.relay import Node
from models import User, Artwork, Portfolio, Achievement
from graphene_mongo import MongoengineObjectType


class UserType(MongoengineObjectType):
    class Meta:
        model = User
        filter_fields = {
            'name': ['exact', 'icontains', 'istartswith'],
        }
        interfaces = (Node,)

class ArtworkType(MongoengineObjectType):
    class Meta:
        model = Artwork
        interfaces = (Node,)
    def resolve_tags(self, info):
        print("tags")
        

class PortfolioType(MongoengineObjectType):
    class Meta:
        model = Portfolio
        interfaces = (Node,)