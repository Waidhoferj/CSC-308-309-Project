import graphene
from bson import ObjectId
from models import User, UserMetrics, Portfolio, Settings, Achievement, Group, Artwork, ArtworkMetrics, Comment
from models import Report
from api_types import UserType, UserMetricsType, PortfolioType, SettingsType, AchievementType, GroupType
from api_types import ArtworkType, CommentType, AchievementType, ReportType
import base64

'''
Need to research more into mutation arguments, but I think how I have them right now is how it should be
List of possible mutations to make:

    add artwork to group portfolio
    add_to_group - todo, already done for group creator
    update_settings
     
'''

# NOTE: reference fields need ObjectId-typed input
# NOTE: Collection methods - Remove deletes everything in the list, pop removes by index
# Idea, might wanna store the graphql id in mongodb or vise versa somehow

def decodeId(id):
    decoded = base64.b64decode(id)    # ex: b'UserType:braden@n.com'
    type_and_id = str(decoded)[2:-1].split(":")
    return type_and_id[1]

def checkAchievements(user):
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
    if user_metrics.works_visited < achievement_threshold.works_visited:
        return False
    elif user_metrics.works_found < achievement_threshold.works_found:
        return False
    return True

# visited: someone else created the location, you are within range and just "discovered" it
# found: you created the artwork object (location) on the map
class UserMetricsInput(graphene.InputObjectType):
    works_visited = graphene.Int()
    works_found = graphene.Int()

class AchievementInput(graphene.InputObjectType):
    title = graphene.String() 
    description = graphene.String()
    points = graphene.Int()
    threshold = graphene.InputField(UserMetricsInput)

class CreateAchievementMutation(graphene.Mutation):
    # NOTE: only creating achievements because I'm assuming they are made by us and static
    achievement = graphene.Field(AchievementType)

    class Arguments:
        achievement_data = AchievementInput(required=True)

    def mutate(self, info, achievement_data=None):
        threshold = UserMetrics(
            works_visited=achievement_data.threshold.works_visited,
            works_found=achievement_data.threshold.works_found
        )

        achievement = Achievement(
            title = achievement_data.title,
            description = achievement_data.description,
            points = achievement_data.points,
            threshold = threshold
        )
        achievement.save()

        return CreateAchievementMutation(achievement=achievement)

class CommentInput(graphene.InputObjectType):
    author = graphene.String()   # User Object id
    content = graphene.String()

class GroupInput(graphene.InputObjectType):
    id = graphene.String()
    name = graphene.String()
    bio = graphene.String()
    member_to_add = graphene.String()      # User Object id
    member_to_kick = graphene.String()    # User Object id
    art_to_add = graphene.String()    # Artwork Object id
    art_to_remove = graphene.String()     # Artwork Object id
    comment_to_add = graphene.InputField(CommentInput)      # Actual comment data
    comment_to_remove = graphene.String()  # Comment object id (could also do index here)

class CreateGroupMutation(graphene.Mutation):
    # Need a user id with input (member_to_add)
    group = graphene.Field(GroupType)

    class Arguments:
        group_data = GroupInput(required=True)

    @staticmethod
    def autoAddToGroupPortfolio(user, group):
        if not user.settings.autoAddToGroupPortfolio:
            return
        for artwork in user.personal_portfolio.artworks:
            # need to make sure duplicates aren't added to group portfolio
            if artwork not in group.group_portfolio.artworks:
                group.group_portfolio.artworks.append(artwork)

    def mutate(self, info, group_data=None):
        group_portfolio = Portfolio()
        creator = UpdateUserMutation.getUser(group_data.member_to_add)
        group = Group(
            name = group_data.name,
            bio = group_data.bio,    # not required by model, will assume frontend filters input
            members = [creator],
            group_portfolio = group_portfolio,  # not changed at all yet
            chat = []
        )
        group.save()
        creator.groups.append(group)
        CreateGroupMutation.autoAddToGroupPortfolio(creator, group)
        
        return CreateGroupMutation(group=group)

class UpdateGroupMutation(graphene.Mutation):
    group = graphene.Field(GroupType)

    class Arguments:
        group_data = GroupInput(required=True)

    @staticmethod
    def getGroup(id, decode=True):   # can also check for none here
        return Group.objects.get(pk=decodeId(id))
    
    def mutate(self, info, group_data=None):
        group = UpdateGroupMutation.getGroup(group_data.id)
        if group_data.name:
            group.name = group_data.name
        if group_data.bio:
            group.bio = group_data.bio
        if group_data.member_to_add:
            memberToAdd = UpdateUserMutation.getUser(group_data.member_to_add)
            group.members.append(memberToAdd)
        if group_data.member_to_kick:
            memberToKick = UpdateUserMutation.getUser(group_data.member_to_kick)
            index = group.members.index(memberToKick)
            if index == -1:
                print(f"Member ({memberToKick.id}) is not a member of {group.name}")
            else:
                group.members.pop(index)
            if len(group.members) == 0: # not tested
                return DeleteGroupMutation(id=group.id)
        if group_data.art_to_add:   # not tested
            artToAdd = UpdateArtworkMutation.getArtwork(group_data.art_to_add)
            group.group_portfolio.artworks.append(artToAdd)
        if group_data.art_to_remove:    # not tested
            artworkToRemove = UpdateArtworkMutation.getArtwork(group_data.art_to_remove)
            index = group.group_portfolio.artworks.index(artworkToRemove)
            if index == -1:
                print(f"Art ({artToRemove.id}) is not in Group's portfolio")
            else:
                group.group_portfolio.artworks.pop(index)
        if group_data.comment_to_add:   # not tested
            commentToAdd = Comment(
                author = UpdateUserMutation.getUser(group_data.comment_to_add.author),
                content = group_data.comment_to_add.content
            )
            group.chat.append(commentToAdd)
        if group_data.comment_to_remove:    # not tested
            commentToRemove = Comment.objects.get(pk=decodeId(group_data.comment_to_remove))
            index = group.chat.index(commentToRemove)
            if index == -1:
                print(f"Comment ({artToRemove.id}) is not in Group's chat")
            else:
                group.chat.pop(index)
        group.save()

        return UpdateGroupMutation(group=group)

class DeleteGroupMutation(graphene.Mutation): # assume works but haven't tried
    class Arguments:
        id = graphene.ID(required=True)

    success = graphene.Boolean()

    def mutate(self, info, id):
        try:
            UpdateGroupMutation.getGroup(id).delete()
            success = True
        except:
            print("could not find object")
            return

        return DeleteGroupMutation(success=success)

class UserSettingsInput(graphene.InputObjectType):
    autoAddToGroupPortfolio = graphene.Boolean()


class UserInput(graphene.InputObjectType):
    # since this class is generalized for all updating and creating, won't make any attributes required
    id = graphene.String()
    name = graphene.String()
    bio = graphene.String()
    email = graphene.String()
    profile_pic = graphene.String()   # NOTE: will assume base64 encoded string
    metrics = graphene.InputField(UserMetricsInput)
    achievement = graphene.String()     # achievement id to add to user's achievements
    art_to_add = graphene.String()    # artwork id to add to portfolio
    art_to_remove = graphene.String()     # artwork id to remove from portfolio
    group = graphene.String()         # group id to add to user's groups
    settings = graphene.InputField(UserSettingsInput)


class CreateUserMutation(graphene.Mutation):
    # possible output types to show with return query
    user = graphene.Field(UserType)

    class Arguments:
        user_data = UserInput(required=True)

    def mutate(self, info, user_data=None):
        portfolio = Portfolio()
        settings = Settings()
        metrics = UserMetrics()
        
        user = User(
            # Need to eventually add username (if that's not the 'name') and password
            name = user_data.name,
            bio = user_data.bio,    # not required by model, will assume frontend filters input
            email = user_data.email,
            profile_pic = user_data.profile_pic,
            metrics = metrics,
            achievements = [], # will likely want to add a hard coded initial achievement
            personal_portfolio = portfolio,
            groups = [],
            settings = settings
        )
        checkAchievements(user)
        user.save()

        return CreateUserMutation(user=user)

# Querying by id as an "id" argument should be by encoded string
# id within user_input will be the primary key (email right now)
class UpdateUserMutation(graphene.Mutation):
    user = graphene.Field(UserType)

    class Arguments:
        user_data = UserInput(required=True)

    @staticmethod
    def getUser(id):   # can also check for none here
        return User.objects.get(pk=decodeId(id))

    def mutate(self, info, user_data=None):
        user = UpdateUserMutation.getUser(user_data.id)
        if user_data.name:
            user.name = user_data.name
        if user_data.bio:
            user.bio = user_data.bio
        if user_data.email: # don't think I want this while primary key is email
            user.email = user_data.email
        if user_data.metrics:
            user.metrics = UserMetrics(
                works_visited = user_data.metrics.works_visited,
                works_found = user_data.metrics.works_found
            )
        if user_data.achievement:
            user.achievements.append(Achievement.objects.get(pk=decodeId(user_data.achievement))) 
        if user_data.art_to_add:
            artToAdd = UpdateArtworkMutation.getArtwork(user_data.art_to_add)
            # Check if none
            user.personal_portfolio.artworks.append(artToAdd)
        if user_data.art_to_remove:
            artToRemove = UpdateArtworkMutation.getArtwork(user_data.art_to_remove)
            index = user.personal_portfolio.artworks.index(artToRemove)
            if index == -1:
                print(f"Art ({artToRemove.id}) is not in User's portfolio")
            else:
                user.personal_portfolio.artworks.pop(index)
        if user_data.group: # to be tested
            user.groups.append(UpdateGroupMutation.getGroup(user_data.group))
        if user_data.settings: # to be tested but I imagine works
            user.settings = Settings(
                autoAddToGroupPortfolio = settings.autoAddToGroupPortfolio
            )
        # Need to add success/failure responses
        checkAchievements(user)
        user.save()

        return UpdateUserMutation(user=user)
    
class DeleteUserMutation(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)

    success = graphene.Boolean()

    def mutate(self, info, id):
        try:
            UpdateUserMutation.getUser(id).delete()
            success = True
        except:
            print("could not find object")
            return

        return DeleteUserMutation(success=success)

class ArtworkMetricsInput(graphene.InputObjectType):
    total_visits = graphene.Int()       # number of visits to artwork
    total_ratings = graphene.Int()      # number of ratings submitted to artwork

class DiscoverArtworkMutation(graphene.Mutation):
    
    class Arguments:
        user_id = graphene.ID(required=True)
        artwork_id = graphene.ID(required=True)

    total_visits = graphene.Int()
    works_visited = graphene.Int()

    def mutate(self, info, user_id=None, artwork_id=None):
        artwork = UpdateArtworkMutation.getArtwork(artwork_id)
        artwork.metrics.total_visits += 1
        artwork.save()
        total_visits = artwork.metrics.total_visits

        user = UpdateUserMutation.getUser(user_id)
        user.metrics.works_visited += 1
        user.personal_portfolio.artworks.append(artwork) # should this be the id?
        user.save()
        works_visited = user.metrics.works_visited
        checkAchievements(user)

        return DiscoverArtworkMutation(total_visits=total_visits, works_visited=works_visited)


class ArtworkInput(graphene.InputObjectType):
    id = graphene.ID()
    title = graphene.String()
    artist = graphene.String()
    description = graphene.String()
    pictures = graphene.List(graphene.String)     # NOTE: removing pic will be from index from frontend
    found_by = graphene.String()  # will be user id
    location = graphene.List(graphene.Float)    # (longitude, latitude)
    metrics = graphene.InputField(ArtworkMetricsInput)
    rating = graphene.Float()    # assuming 1-100 at the moment
    comment = graphene.InputField(CommentInput)
    tags = graphene.List(graphene.String)    


class CreateArtworkMutation(graphene.Mutation):
    artwork = graphene.Field(ArtworkType)

    class Arguments:
        artwork_data = ArtworkInput(required=True)

    def mutate(self, info, artwork_data=None):
        metrics = ArtworkMetrics()
        artwork = Artwork(
            title = artwork_data.title,
            artist = artwork_data.artist,
            description = artwork_data.description,
            pictures = artwork_data.pictures if artwork_data.pictures else [],
            found_by = decodeId(artwork_data.found_by),   # might wanna error check
            location = {
                "type": "Point",
                "coordinates": [artwork_data.location[0], artwork_data.location[1]]
            },
            metrics = metrics,
            rating = artwork_data.rating,
            comments = [],
            tags = artwork_data.tags
        )
        artwork.save()

        # Add artwork to user portfolio and update user metrics
        user = UpdateUserMutation.getUser(artwork_data.found_by)
        user.personal_portfolio.artworks.append(artwork)
        user.metrics.works_found += 1
        user.metrics.works_visited += 1
        user.save()
        checkAchievements(user)

        return CreateArtworkMutation(artwork=artwork)


class UpdateArtworkMutation(graphene.Mutation):
    artwork = graphene.Field(ArtworkType)

    class Arguments:
        artwork_data = ArtworkInput(required=True)

    @staticmethod
    def getArtwork(id):   # can also check for none here
        return Artwork.objects.get(pk=decodeId(id))

    def mutate(self, info, artwork_data=None):
        artwork = UpdateArtworkMutation.getArtwork(artwork_data.id)
        if artwork_data.title:
            artwork.title = artwork_data.title
        if artwork_data.artist:
            artwork.artist = artwork_data.artist
        if artwork_data.description:
            artwork.description = artwork_data.description
        if artwork_data.picture_to_add:
            artwork.pictures.append(artwork_data.picture_to_add)
        if artwork_data.found_by:   # not tested, but this also shouldn't change after artwork creation
            artwork.found_by = decodeId(artwork_data.found_by)
        if artwork_data.location: # not tested, but this also shouldn't change after artwork creation
            artwork.location = {
                "type": "Point",
                "coordinates": [artwork_data.location[0], artwork_data.location[1]]
            }
        if artwork_data.metrics: # not tested
            artwork.metrics = ArtworkMetrics(
                total_visits = artwork_data.metrics.total_visits,
                total_ratings = artwork_data.metrics.total_ratings
            )
        #if artwork_data.num_ratings:
        #    artwork.num_ratings = artwork_data.num_ratings
        if artwork_data.rating:     # Might get rid of because changing breaks dependency with num_ratings
            artwork.rating = artwork_data.rating
        if artwork_data.comment:    # not tested and probably need to add more logic to control comments
            artwork.comments.append(artwork_data.comment)
        if artwork_data.tags:        # not tested, and might wanna add additional logic
            artwork.tags = artwork_data.tags
        artwork.save()

        return UpdateArtworkMutation(artwork=artwork)

class DeleteArtworkMutation(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)

    success = graphene.Boolean()

    def mutate(self, info, id):
        try:
            UpdateArtworkMutation.getArtwork(id).delete()
            success = True
        except:
            print("could not find object")
            return

        return DeleteArtworkMutation(success=success)


class ArtworkReviewInput(graphene.InputObjectType):
    artwork_id = graphene.ID(required=True)
    comment = graphene.InputField(CommentInput)
    rating = graphene.Float() # 1-100
    tags = graphene.List(graphene.String)

class AddArtworkReviewMutation(graphene.Mutation):
    # Need to either split up ratings/tags with comment or create a new comment class
    # For now I decided to split up ratings/tags with comment
    # Don't want users just adding endless tags and reviews, no check yet
    # Could leave comments open to add "endlessly" though
    artwork = graphene.Field(ArtworkType)
    class Arguments:
        review_data = ArtworkReviewInput(required=True)
  
    def mutate(self, info, review_data=None):

        def addArtworkRating(old_rating, rating_to_add, new_count):
            ''' Updates the moving rating average, only works with one new rating at a time '''
            return ( ( old_rating * (new_count - 1) ) + rating_to_add ) / new_count

        artwork = UpdateArtworkMutation.getArtwork(review_data.artwork_id)
        if artwork is None:
            print("Could not find artwork")
            return
        if review_data.comment: # to test
            artwork.comments.append(Comment(
              author = decodeId(review_data.comment.author),
              content = review_data.comment.content))
        if review_data.rating:  # to test
            artwork.metrics.total_ratings += 1    # NOTE: incrementing num_ratings BEFORE updating average
            artwork.rating = addArtworkRating(artwork.rating, review_data.rating, artwork.metrics.total_ratings)
        if review_data.tags:  # to test
            for tag in review_data.tags:
                artwork.tags.append(tag)
        artwork.save()

        return AddArtworkReviewMutation(artwork=artwork)


class ReportInput(graphene.InputObjectType):
    reported_id_type = graphene.String()   # just "artwork" for now
    reported_id = graphene.String()
    user_id = graphene.String()
    reason = graphene.String()
    description = graphene.String()

class CreateReportMutation(graphene.Mutation):
    # NOTE: only creating achievements because I'm assuming they are made by us and static
    report = graphene.Field(ReportType)

    class Arguments:
        report_data = ReportInput(required=True)

    def mutate(self, info, report_data=None):
        report = Report(
            reported_id_type = report_data.reported_id_type,
            reported_id = report_data.reported_id,
            user_id = report_data.user_id,
            reason = report_data.reason,
            description = report_data.description
        )
        report.save()

        return CreateReportMutation(report=report)



''' 
Geospatial Indexing Links:
    https://docs.mongodb.com/manual/geospatial-queries/
    https://docs.mongodb.com/manual/reference/method/db.collection.createIndex/#db.collection.createIndex
    https://www.youtube.com/watch?v=iGnSNfzaLf4&ab_channel=Udacity
    https://docs.mongoengine.org/guide/defining-documents.html# 
    https://docs.mongoengine.org/guide/querying.html#advanced-queries - will want to use near

'''

'''
example mutations in graphql interface (see testing.py for more)
---------------------------------------

Creates user and returns most relevant information about them:

mutation {
  createUser(userData: {
    name: "Tony Richard",
    bio: "Likes to take long walks in the valley",
    email: "tony@richard.com"
  }) {
    user {
      name,
      bio,
      dateJoined,
      metrics {
        worksVisited,
        worksFound
      }
      achievements {
        edges {
          node {
            id
            title
          }
        }
      }
      personalPortfolio {
        artworks {
          edges {
            node {
              id,
              title
            }
          }
        }
      }
      groups {
        edges {
          node {
            id
            name
          }
        }
      }
      settings {
        autoAddToGroupPortfolio
      }
    }
  }
}

shorthand without extra query:

mutation {
  createUser(
  	userData: {
    	name: "Branden"
    	bio: "Sweet Hater of Science"
  	}
	) {
    id
    user {
      name
    }
  }  
}

update user using user id:

mutation {
  updateUser(userData: {
    id: "6046714c0638939d05aac6ca"
    bio: "Very Happy Boi, and not yet ready to go",
    
  }) {
    user {
      id,
      name,
      bio,
      dateJoined,
      metrics {
        worksVisited,
        worksFound
      }
      achievements {
        edges {
          node {
            id
            title
          }
        }
      }
      personalPortfolio {
        artworks {
          edges {
            node {
              id,
              title
            }
          }
        }
      }
      groups {
        edges {
          node {
            id
            name
          }
        }
      }
      settings {
        autoAddToGroupPortfolio
      }
    }
  }
}

create artwork mutation ex:

mutation {
  createArtwork(artworkData: {
    title: "Hidden Subway Mural",
    description: "Far side of the subway station has a double walled mural."
    foundBy: "603f37cc87708975e37f8b9c",
    location: [-120.677494, 35.292708],
    rating: 55.0,
    tags: ["beautiful", "colorful"]
    }) {
    artwork {
      id
      title
    }
  }
}

update artwork mutation ex:

mutation {
  updateArtwork(artworkData: {
    id: "603f4675869f6fe8ca22e226",
    description: "Wall full of fire"
    rating: 80.0,
    }) {
    artwork {
      title
    }
  }
}

delete artwork mutation ex:

mutation {
  deleteArtwork(id:"6039777712563c35fb0d6bc0") {
    success
  }
}


discover artwork mutation ex:

mutation { 
  discoverArtwork(
    userId: "VXNlclR5cGU6Z3JhbnRAZ3JhbnQuY29t",
  	artworkId: "QXJ0d29ya1R5cGU6Qmx1ZSBCcmlkZ2U=") 
  {
    totalVisits
    worksVisited
  }
}


add artwork review mutation ex:

mutation {
  addArtworkReview(reviewData: {
    artworkId: "QXJ0d29ya1R5cGU6SGlkZGVuIFNzZGZnc2Rnc3VyYQ==",
    comment: {
      author: "VXNlclR5cGU6YnJhZGVuQGdtYWlsLmNvbQ=="
      content: "I love this art!",
    }
    rating: 80,
    tags: ["Added_Tag"]
  }) {
    artwork {
      id
      title
      rating
      numRatings
    }
  }    
}

create group mutation ex:

mutation {
  createGroup(groupData: {
    name: "GeoArtBoys",
    bio: "Geography lovers who take pics",
    memberToAdd: "braden@gmail.com"
    }) {
    group {
      id
      name
      bio
      members {
        edges {
          node {
            name
          }
        }
      }
    }
  }
}

update group mutation ex (Adding new member): 

mutation {
  updateGroup(groupData: {{
    id: "{0}",
    memberToAdd: "{1}"
  }}) {{
      group {{
          id
          name
          bio
          members {{
              edges {{
                  node {{
                      name
                  }}
              }}
          }}
      }}
  }}
}}"""

create report ex:

mutation {
  createReport(
  	reportData: {
    	reportedIdType: "report"
    	reportedId: "sadjfoisdj"
    	userId: "sdifjosdaij"
    	reason: "innapropriate"
    	description: "It is some man's forhead"
  	}
	) {
    report {
      reportedIdType
      reportedId
      userId
      reason
      description
    }
  }  
}


'''


