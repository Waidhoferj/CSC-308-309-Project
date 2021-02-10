import graphene
from graphene.relay import Node
from mutations import UpdateUserMutation, CreateUserMutation, DeleteUserMutation
from api_types import PortfolioType, UserType, ArtworkType
from graphene_mongo import MongoengineConnectionField

class Query(graphene.ObjectType):
    node = Node.Field()
    users = MongoengineConnectionField(UserType)
    artwork = MongoengineConnectionField(ArtworkType)
    portfolios = MongoengineConnectionField(PortfolioType)

class Mutations(graphene.ObjectType):
    create_user = CreateUserMutation.Field()
    update_user = UpdateUserMutation.Field()
    delete_user = DeleteUserMutation.Field()
    


schema = graphene.Schema(query=Query, mutation=Mutations, types=[ArtworkType, UserType, PortfolioType])