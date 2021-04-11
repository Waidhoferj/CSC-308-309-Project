import graphene
from graphene.relay import Node
from mutations import UpdateUserMutation, CreateUserMutation, DeleteUserMutation, CreateArtworkMutation, UpdateArtworkMutation
from mutations import DeleteArtworkMutation, CreateGroupMutation, UpdateGroupMutation, CreateAchievementMutation, CreateReportMutation
from mutations import AddArtworkReviewMutation
from api_types import UserType, PortfolioType, ArtworkType, AchievementType, GroupType, ReportType
from graphene_mongo import MongoengineConnectionField
from models import Artwork


class Query(graphene.ObjectType):
    #node = Node.Field()
    users = MongoengineConnectionField(UserType)
    groups = MongoengineConnectionField(GroupType)
    artwork = MongoengineConnectionField(ArtworkType)
    portfolios = MongoengineConnectionField(PortfolioType)
    achievements = MongoengineConnectionField(AchievementType)
    reports = MongoengineConnectionField(ReportType)
    # location = graphene.List(graphene.Float)

    # def resolve_near_artworks(root, info, location):
    #     return Artwork.objects(point__near=location)


class Mutations(graphene.ObjectType):
    create_user = CreateUserMutation.Field()
    update_user = UpdateUserMutation.Field()
    delete_user = DeleteUserMutation.Field()

    create_artwork = CreateArtworkMutation.Field()
    update_artwork = UpdateArtworkMutation.Field()
    delete_artwork = DeleteArtworkMutation.Field()
    add_artwork_review = AddArtworkReviewMutation.Field()

    create_group = CreateGroupMutation.Field()
    update_group = UpdateGroupMutation.Field()

    create_achievement = CreateAchievementMutation.Field() 

    create_report = CreateReportMutation.Field()

schema = graphene.Schema(query=Query, mutation=Mutations)
# Not sure why types was here
# schema = graphene.Schema(query=Query, mutation=Mutations, types=[ArtworkType, UserType, PortfolioType, AchievementType])