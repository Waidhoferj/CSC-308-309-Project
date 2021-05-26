import graphene
from bson import ObjectId
from graphene.types.scalars import ID
from models import (User, UserMetrics, Portfolio, Settings, Achievement,
                    Group, Artwork, ArtworkMetrics, Comment, Report)
from api_types import (UserType, UserMetricsType, PortfolioType, SettingsType,
                       AchievementType, GroupType, ArtworkType, CommentType,
                       AchievementType, ReportType)
import base64

'''
List of possible mutations to make:

    update_settings

'''

# NOTE: reference fields need ObjectId-typed input
# NOTE: Collection methods - Remove deletes everything in the list,
#       pop removes by index


def decodeId(id):
    """
    For MongoDB + GraphQL, the primary key is base64 encoded after
        being put into the form: "{api_type}:{pk}" for the frontend
        (eg: 'UserType:braden@braden.com')
    The decoded id is needed for correct queries, so this function is used
    to change the id from the frontend into something usable here.
    (eg:
        VXNlclR5cGU6Z3JhbnRAZ3JhbnQuY29t
            -> UserType:grant@grant.com
                -> grant@grant.com
    )
    """
    decoded = base64.b64decode(id)    # ex: b'UserType:braden@n.com'
    type_and_id = str(decoded)[2:-1].split(":")
    return type_and_id[1]


def checkAchievements(user):
    '''
    Compares user metrics with all achievement metrics thresholds.
    If a new threshold is met, the achievement is awarded.
    '''
    achievements = Achievement.objects
    achievements_to_add = []
    for achievement in achievements:
        if achievement in user.achievements:
            continue
        if compareUserMetrics(user.metrics, achievement.threshold):
            achievements_to_add.append(achievement)
    for achievement_to_add in achievements_to_add:
        user.achievements.append(achievement_to_add)
    return achievements_to_add


def compareUserMetrics(user_metrics, achievement_threshold):
    """ Returns true if user_metrics exceed achievement_threshold.
         False otherwise """
    if user_metrics.works_visited < achievement_threshold.works_visited:
        return False
    elif user_metrics.works_found < achievement_threshold.works_found:
        return False
    return True


class UserMetricsInput(graphene.InputObjectType):
    """ Attributes for inputting user metrics """
    works_visited = graphene.Int()
    works_found = graphene.Int()


class AchievementInput(graphene.InputObjectType):
    """ Attributes for inputting an achievement """
    title = graphene.String()
    description = graphene.String()
    points = graphene.Int()
    threshold = graphene.InputField(UserMetricsInput)


class CreateAchievementMutation(graphene.Mutation):
    """ Mutation to create an achievement. Not to be used by users """
    achievement = graphene.Field(AchievementType)

    class Arguments:
        achievement_data = AchievementInput(required=True)

    def mutate(self, info, achievement_data=None):
        threshold = UserMetrics(
            works_visited=achievement_data.threshold.works_visited,
            works_found=achievement_data.threshold.works_found
        )
        achievement = Achievement(
            title=achievement_data.title,
            description=achievement_data.description,
            points=achievement_data.points,
            threshold=threshold
        )
        achievement.save()

        return CreateAchievementMutation(achievement=achievement)


class CommentInput(graphene.InputObjectType):
    """ All input information needed for a creatings a comment """
    author = graphene.ID(required=True)   # User Object id
    content = graphene.String(required=True)


class GroupInput(graphene.InputObjectType):
    """ All input information needed for group creation/updating """
    id = graphene.String()
    name = graphene.String()
    bio = graphene.String()
    member_to_add = graphene.String()      # User Object id
    member_to_kick = graphene.String()    # User Object id
    art_to_add = graphene.String()    # Artwork Object id
    art_to_remove = graphene.String()     # Artwork Object id
    comment_to_add = graphene.InputField(CommentInput)  # Actual comment data
    comment_to_remove = graphene.String()  # Comment object id


class CreateGroupMutation(graphene.Mutation):
    """ Mutation allowing a user to create a new group """
    group = graphene.Field(GroupType)

    class Arguments:
        group_data = GroupInput(required=True)

    def mutate(self, info, group_data=None):
        user = UpdateUserMutation.getUser(group_data.member_to_add)
        group_portfolio = Portfolio()
        group = Group(
            name=group_data.name,
            bio=group_data.bio,
            members=[user],
            group_portfolio=group_portfolio,
            chat=[]
        )
        group.save()
        user.groups.append(group)
        user.save()

        return CreateGroupMutation(group=group)


class UpdateGroupMutation(graphene.Mutation):
    """ Mutation updating attributes of a group """
    group = graphene.Field(GroupType)

    class Arguments:
        group_data = GroupInput(required=True)

    @staticmethod
    def getGroup(id, decode=True):   # can also check for none here
        return Group.objects.get(pk=decodeId(id))

    def mutate(self, info, group_data=None):
        group = UpdateGroupMutation.getGroup(group_data.id)
        if group_data.bio:
            group.bio = group_data.bio
        if group_data.member_to_add:
            memberToAdd = UpdateUserMutation.getUser(group_data.member_to_add)
            group.members.append(memberToAdd)
        # NOTE: below causes race condition,
        #       need a specific mutation for removing self from group
        if group_data.member_to_kick:
            memberToKick = (UpdateUserMutation.
                            getUser(group_data.member_to_kick))
            index = group.members.index(memberToKick)
            if index == -1:
                print((f"Member ({memberToKick.id}) "
                      f"is not a member of {group.name}"))
            else:
                group.members.pop(index)
            if len(group.members) == 0:  # need to test cascade deletion
                return DeleteGroupMutation(id=group.id)
        # NOTE: create add to group portfolio mutation
        #       input: artwork_id, group_id
        if group_data.art_to_add:   # not tested
            artToAdd = UpdateArtworkMutation.getArtwork(group_data.art_to_add)
            group.group_portfolio.artworks.append(artToAdd)
        # NOTE: likely delete this, we don't want to remove art from group
        if group_data.art_to_remove:    # not tested
            artworkToRemove = (UpdateArtworkMutation.
                               getArtwork(group_data.art_to_remove))
            index = group.group_portfolio.artworks.index(artworkToRemove)
            if index == -1:
                print(f"Art ({artToRemove.id}) is not in Group's portfolio")
            else:
                group.group_portfolio.artworks.pop(index)
        # NOTE: delete if John's mutation covers this
        if group_data.comment_to_add:   # not tested
            commentToAdd = Comment(
                author=(UpdateUserMutation.
                        getUser(group_data.comment_to_add.author)),
                content=group_data.comment_to_add.content
            )
            group.chat.append(commentToAdd)
        # NOTE: this is only effective if
        #       we can confirm comment is from current user
        if group_data.comment_to_remove:    # not tested
            commentToRemove = (Comment.objects.
                               get(pk=decodeId(group_data.comment_to_remove)))
            index = group.chat.index(commentToRemove)
            if index == -1:
                print(f"Comment ({artToRemove.id}) is not in Group's chat")
            else:
                group.chat.pop(index)
        group.save()

        return UpdateGroupMutation(group=group)


class DeleteGroupMutation(graphene.Mutation):  # ensure cascade
    """ Deletes a group. Should be replaced with leave group mutation
        This is because we only want groups to be implicitely deleted
        when they have no members
    """
    class Arguments:
        id = graphene.ID(required=True)

    success = graphene.Boolean()

    def mutate(self, id):
        try:
            UpdateGroupMutation.getGroup(id).delete()
            success = True
        except Exception as e:
            print("could not find object")
            return

        return DeleteGroupMutation(success=success)


class JoinGroupMutation(graphene.Mutation):
    """ Allows a specific user to join a specific group """
    success = graphene.Boolean()

    class Arguments:
        user_id = graphene.String()
        group_id = graphene.String()
    
    def mutate(self, info, user_id, group_id):
        group = UpdateGroupMutation.getGroup(group_id)
        user = UpdateUserMutation.getUser(user_id)
        member = CheckMembershipMutation.checkMembership(
            user = UpdateUserMutation.getUser(user_id),
            group = UpdateGroupMutation.getGroup(group_id)
        )
        if member:
            return JoinGroupMutation(success=False)
        expected_sizes = (len(group.members) + 1, len(user.groups) + 1)
        group.members.append(user)
        user.groups.append(group)
        actual_sizes = (len(group.members), len(user.groups))

        if expected_sizes == actual_sizes:
            user.save()
            group.save()
            success = True
        else:
            success = False
        return JoinGroupMutation(success=success)


class CheckMembershipMutation(graphene.Mutation):
    ''' 
    Returns true if user is a member of the group, false otherwise
    Note: Membership is defined as the user being in the group's member list
            AND the user contains the group in their group list
    '''
    member = graphene.Boolean()

    class Arguments:
        user_id = graphene.String()
        group_id = graphene.String()
    
    @staticmethod
    def checkMembership(user, group):
        if (user not in group.members) and (group not in user.groups):
            return False
        return True

    def mutate(self, info, user_id, group_id):
        member = CheckMembershipMutation.checkMembership(
            user = UpdateUserMutation.getUser(user_id),
            group = UpdateGroupMutation.getGroup(group_id)
        )
        return CheckMembershipMutation(member=member)


class LeaveGroupMutation(graphene.Mutation):
    """ Lets a specific user leave a specific group """
    success = graphene.Boolean()

    class Arguments:
        user_id = graphene.String()
        group_id = graphene.String()


    def mutate(self, info, user_id, group_id):
        #  checking success by size of list here
        group = UpdateGroupMutation.getGroup(group_id)
        user = UpdateUserMutation.getUser(user_id)

        expected_sizes = (len(group.members) - 1, len(user.groups) - 1)

        user.update(pull__groups=group)
        group.update(pull__members=user)
        updated_group = UpdateGroupMutation.getGroup(group_id)
        updated_user = UpdateUserMutation.getUser(user_id)

        actual_sizes = (len(updated_group.members), len(updated_user.groups))

        if expected_sizes == actual_sizes:
            success = True
            #  if the last member of the group left, delete the group
            #  could add checks here
            if len(updated_group.members) == 0:
                updated_group.delete()
        else:
            success = False
        return LeaveGroupMutation(success=success)


class UserSettingsInput(graphene.InputObjectType):
    """ Settings input for initializing or updating user settings """
    autoAddToGroupPortfolio = graphene.Boolean()


class UserInput(graphene.InputObjectType):
    """ User attribute input for user creation and updating """
    id = graphene.String()
    name = graphene.String()
    bio = graphene.String()
    email = graphene.String()
    password = graphene.String()
    profile_pic = graphene.String()   # NOTE: will assume base64 encoded string
    metrics = graphene.InputField(UserMetricsInput)
    achievement = graphene.String()     # achievement id
    art_to_add = graphene.String()    # artwork id to add to portfolio
    art_to_remove = graphene.String()     # artwork id to remove from portfolio
    group = graphene.String()         # group id to add to user's groups
    settings = graphene.InputField(UserSettingsInput)


class CreateUserMutation(graphene.Mutation):
    """ Mutation to create user from the sign up page """
    user = graphene.Field(UserType)
    success = graphene.Boolean()

    class Arguments:
        user_data = UserInput(required=True)

    def mutate(self, info, user_data=None):
        # NOTE: Netlify creates the account regardless of this response
        portfolio = Portfolio()
        settings = Settings()
        metrics = UserMetrics()
        try:
            user = User.objects.get(pk=user_data.email)
            if user:
                # user already exists with that email
                return CreateUserMutation(user=None, success=False)
        except Exception as e:  # email not taken
            if "matching query does not exist" not in str(e):
                # unexpected error during query
                return CreateUserMutation(user=None, success=False)
            user = User(
                name=user_data.name,
                bio=user_data.bio,
                email=user_data.email,
                password=user_data.password,
                profile_pic=user_data.profile_pic,
                metrics=metrics,
                achievements=[],
                personal_portfolio=portfolio,
                groups=[],
                settings=settings
            )
            checkAchievements(user)
            user.save()
            return CreateUserMutation(user=user, success=True)


class UpdateUserMutation(graphene.Mutation):
    """ Mutation to allow users to update their profile """
    user = graphene.Field(UserType)

    class Arguments:
        user_data = UserInput(required=True)

    @staticmethod
    def getUser(id):   # can also check for none here
        return User.objects.get(pk=decodeId(id))

    def mutate(self, info, user_data=None):
        '''
        Need separate mutations for:
          - change email
          - change password
        '''
        user = UpdateUserMutation.getUser(user_data.id)
        if user_data.name:
            user.name = user_data.name
        if user_data.bio:
            user.bio = user_data.bio
        if user_data.art_to_add:
            artToAdd = UpdateArtworkMutation.getArtwork(user_data.art_to_add)
            # Check if none
            user.personal_portfolio.artworks.append(artToAdd)
        if user_data.art_to_remove:
            artToRemove = (UpdateArtworkMutation.
                           getArtwork(user_data.art_to_remove))
            index = user.personal_portfolio.artworks.index(artToRemove)
            if index == -1:
                print(f"Art ({artToRemove.id}) is not in User's portfolio")
            else:
                user.personal_portfolio.artworks.pop(index)
        if user_data.group:  # to be tested
            user.groups.append(UpdateGroupMutation.getGroup(user_data.group))
        if user_data.settings:  # to be tested but I imagine works
            user.settings = Settings(
                autoAddToGroupPortfolio=settings.autoAddToGroupPortfolio
            )
        # Need to add success/failure responses
        checkAchievements(user)
        user.save()

        return UpdateUserMutation(user=user)


class DeleteUserMutation(graphene.Mutation):
    """ Mutation to delete a user. Can't currently be used by users """
    class Arguments:
        id = graphene.ID(required=True)

    success = graphene.Boolean()

    def mutate(self, info, id):
        try:
            UpdateUserMutation.getUser(id).delete()
            success = True
        except Exception as e:
            print("could not find object")
            return

        return DeleteUserMutation(success=success)


class ArtworkMetricsInput(graphene.InputObjectType):
    """ Attributes for inputting artwork metrics """
    total_visits = graphene.Int()


class ArtworkInput(graphene.InputObjectType):
    """ Artwork attribute input for artwork creation and updating """
    id = graphene.ID()
    title = graphene.String()
    artist = graphene.String()
    description = graphene.String()
    pictures = graphene.List(graphene.String)
    found_by = graphene.String()  # will be user id
    location = graphene.List(graphene.Float)  # (longitude, latitude)
    metrics = graphene.InputField(ArtworkMetricsInput)
    num_ratings = graphene.Int()
    rating = graphene.Float()  # assuming 1-100 at the moment
    comment = graphene.InputField(CommentInput)
    tags = graphene.List(graphene.String)


class CreateArtworkMutation(graphene.Mutation):
    """ Mutation for a user to upload a new artwork to the map """
    artwork = graphene.Field(ArtworkType)

    class Arguments:
        artwork_data = ArtworkInput(required=True)

    def mutate(self, info, artwork_data=None):
        metrics = ArtworkMetrics()
        artwork = Artwork(
            title=artwork_data.title,
            artist=artwork_data.artist,
            description=artwork_data.description,
            pictures=artwork_data.pictures if artwork_data.pictures else [],
            found_by=decodeId(artwork_data.found_by),
            location={
                "type": "Point",
                "coordinates": [artwork_data.location[0],
                                artwork_data.location[1]]
            },
            metrics=metrics,
            num_ratings=artwork_data.num_ratings,
            rating=artwork_data.rating,
            comments=[],
            tags=artwork_data.tags
        )
        artwork.save()
        # Add artwork to user portfolio
        user = UpdateUserMutation.getUser(artwork_data.found_by)
        user.personal_portfolio.artworks.append(artwork)
        user.save()

        return CreateArtworkMutation(artwork=artwork)


class DiscussionCommentMutation(graphene.Mutation):
    """
    Adds a comment to the discussion page of an artwork.
    """
    class Arguments:
        artwork_id = graphene.ID(required=True)
        comment = CommentInput(required=True)

    comment = graphene.Field(CommentType)

    def mutate(self, info, artwork_id=None, comment=None):
        # Find the user and the artwork and create a new comment.
        artwork: Artwork = Artwork.objects.get(pk=decodeId(artwork_id))
        user: User = User.objects.get(pk=decodeId(comment.author))
        c = Comment(author=user, content=comment.content)
        artwork.comments.append(c)
        artwork.save()
        return DiscussionCommentMutation(comment=c)


class GroupDiscussionCommentMutation(graphene.Mutation):
    """
    Adds a comment to the group page of an artwork.
    """
    class Arguments:
        group_id = graphene.ID(required=True)
        comment = CommentInput(required=True)

    comment = graphene.Field(CommentType)

    def mutate(self, info, group_id=None, comment=None):
        # Find the user and the artwork and create a new comment.

        group: Group = Group.objects.get(pk=decodeId(group_id))
        user: User = User.objects.get(pk=decodeId(comment.author))
        c = Comment(author=user, content=comment.content)
        group.chat.append(c)
        group.save()
        return GroupDiscussionCommentMutation(comment=c)


class UpdateArtworkMutation(graphene.Mutation):
    """ Updates the attributes of an already created artwork """
    artwork = graphene.Field(ArtworkType)

    class Arguments:
        artwork_data = ArtworkInput(required=True)

    @staticmethod
    def getArtwork(id):  # can also check for none here
        return Artwork.objects.get(pk=decodeId(id))

    def mutate(self, info, artwork_data=None):
        artwork = UpdateArtworkMutation.getArtwork(artwork_data.id)
        if artwork_data.artist:
            artwork.artist = artwork_data.artist
        if artwork_data.description:
            artwork.description = artwork_data.description
        if artwork_data.pictures:
            artwork.pictures.extend(artwork_data.pictures)
        # add picture to remove
        artwork.save()

        return UpdateArtworkMutation(artwork=artwork)


class DeleteArtworkMutation(graphene.Mutation):
    """ Deletes an artwork. Not to be used by users currently. """
    class Arguments:
        id = graphene.ID(required=True)

    success = graphene.Boolean()

    def mutate(self, info, id):
        try:
            UpdateArtworkMutation.getArtwork(id).delete()
            success = True
        except Exception as e:
            print("could not find object")
            return

        return DeleteArtworkMutation(success=success)


class ArtworkReviewInput(graphene.InputObjectType):
    """ Input needed for a review of an artwork by a user. """
    artwork_id = graphene.ID(required=True)
    comment = graphene.InputField(CommentInput)
    rating = graphene.Float()  # 1-100
    tags = graphene.List(graphene.String)


class AddArtworkReviewMutation(graphene.Mutation):
    """ Mutation to add a user's review to an artwork. """
    # Need to either split up ratings/tags with comment
    #   or create a new comment class
    # For now I decided to split up ratings/tags with comment
    # Don't want users just adding endless tags and reviews, no check yet
    # Could leave comments open to add "endlessly" though
    artwork = graphene.Field(ArtworkType)

    class Arguments:
        review_data = ArtworkReviewInput(required=True)

    def mutate(self, info, review_data=None):

        def addArtworkRating(old_rating, rating_to_add, new_count):
            ''' Updates the moving rating average,
                only works with one new rating at a time '''
            return (((old_rating * (new_count - 1)) + rating_to_add)
                    / new_count)

        artwork = UpdateArtworkMutation.getArtwork(review_data.artwork_id)
        if artwork is None:
            print("Could not find artwork")
            return
        if review_data.comment:
            artwork.comments.append(Comment(
              author=decodeId(review_data.comment.author),
              content=review_data.comment.content))
        if review_data.rating:
            # NOTE: incrementing num_ratings BEFORE updating average
            artwork.num_ratings += 1
            artwork.rating = addArtworkRating(artwork.rating,
                                              review_data.rating,
                                              artwork.num_ratings)
        if review_data.tags:
            for tag in review_data.tags:
                artwork.tags.append(tag)
        artwork.save()

        return AddArtworkReviewMutation(artwork=artwork)


class ReportInput(graphene.InputObjectType):
    """ Input of report attributes to create a new report """
    reported_id_type = graphene.String()  # just "artwork" for now
    reported_id = graphene.String()
    user_id = graphene.String()
    reason = graphene.String()
    description = graphene.String()


class CreateReportMutation(graphene.Mutation):
    """ Mutation for a user to create a new report """
    report = graphene.Field(ReportType)

    class Arguments:
        report_data = ReportInput(required=True)

    def mutate(self, info, report_data=None):
        report = Report(
            reported_id_type=report_data.reported_id_type,
            reported_id=report_data.reported_id,
            user_id=report_data.user_id,
            reason=report_data.reason,
            description=report_data.description
        )
        report.save()

        return CreateReportMutation(report=report)


class AuthenticateUserMutation(graphene.Mutation):
    user = graphene.Field(UserType)
    success = graphene.Boolean()

    class Arguments:
        email = graphene.String()
        password = graphene.String()

    def mutate(self, info, email, password):

        def cryptPassword(password):
            return password
        try:
            user = User.objects.get(pk=email)
        except Exception as e:
            return AuthenticateUserMutation(user=None, success=False)

        if cryptPassword(password) != user.password:
            return AuthenticateUserMutation(user=None, success=False)

        return AuthenticateUserMutation(user=user, success=True)
