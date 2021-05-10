import graphene
from graphene.relay import Node
from mutations import *
from api_types import *
from graphene_mongo import MongoengineConnectionField


class Query(graphene.ObjectType):
    users = MongoengineConnectionField(UserType)
    groups = MongoengineConnectionField(GroupType)
    artwork = MongoengineConnectionField(ArtworkType)
    portfolios = MongoengineConnectionField(PortfolioType)
    achievements = MongoengineConnectionField(AchievementType)
    reports = MongoengineConnectionField(ReportType)

    # def resolve_near_artworks(root, info, location):
    #     return Artwork.objects(point__near=location)


class Mutations(graphene.ObjectType):
    create_user = CreateUserMutation.Field()
    update_user = UpdateUserMutation.Field()
    delete_user = DeleteUserMutation.Field()
    authenticate_user = AuthenticateUserMutation.Field()

    create_artwork = CreateArtworkMutation.Field()
    update_artwork = UpdateArtworkMutation.Field()
    delete_artwork = DeleteArtworkMutation.Field()
    add_artwork_review = AddArtworkReviewMutation.Field()
    add_artwork_comment = DiscussionCommentMutation.Field()
    add_group_comment = GroupDiscussionCommentMutation.Field()

    create_group = CreateGroupMutation.Field()
    update_group = UpdateGroupMutation.Field()

    create_achievement = CreateAchievementMutation.Field()

    create_report = CreateReportMutation.Field()


schema = graphene.Schema(query=Query, mutation=Mutations)
