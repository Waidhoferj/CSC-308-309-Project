import graphene

from models import User, UserMetrics, Portfolio, Settings, Achievement, Group, Artwork, ArtworkMetrics
from api_types import UserType, UserMetricsType, PortfolioType, SettingsType, AchievementType, GroupType
from api_types import ArtworkType

'''
List of possible mutations:
    create_user
    update_user - need to add update metrics and settings
    delete_user

    create_group - todo
    update_group - todo
    delete_group - todo, when should a group be deleted?

    
'''

#class UpdateAchievementMutation(graphene.Mutation): # this will be for us

class UserSettingsInput(graphene.InputObjectType):
    autoAddToGroupPortfolio = graphene.BooleanField()

class UserMetricsInput(graphene.InputObjectType):
    works_visited = graphene.IntField()
    works_found = graphene.IntField()
    cities_visited = graphene.IntField()
    posts_written = graphene.IntField()

class UserInput(graphene.InputObjectType):
    # since this class is generalized for all updating and creating, won't make any attributes required
    id = graphene.ID()
    name = graphene.String()
    bio = graphene.String()
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
        # Unsure how to reference the portfolio here
        portfolio = Portfolio()
        settings = Settings()
        metrics = UserMetrics()
        
        user = User(
            # Need to eventually add username (if that's not the 'name') and password
            name = user_data.name,
            bio = user_data.bio,    # not required by model, will assume frontend filters input
            profile_pic = user_data.profile_pic,
            metrics = metrics,
            achievements = [] # will likely want to add a hard coded initial achievement
            personal_portfolio = portfolio,
            groups = []
            settings = settings
        )
        user.save()

        return CreateUserMutation(user=user)


class UpdateUserMutation(graphene.Mutation):
    user = graphene.Field(UserType)

    class Arguments:
        user_data = UserInput(required=True)

    @staticmethod
    def get_object(id):
        return User.objects.get(pk=id)

    def mutate(self, info, user_data=None):
        user = UpdateUserMutation.get_object(user_data.id)
        if user_data.name:
            user.name = user_data.name
        if user_data.bio:
            user.bio = user_data.bio
        # Not exactly sure on how we're tracking metrics incrementally
        if user_data.metrics:
            user.metrics = updateMetrics(user_data.metrics)
        if user_data.achievement
            user.achievements.append(Achievement.objects.get(user_data.achievement)) 
        if user_data.art_to_add:
            user.portfolio.artworks.append(user_data.art_to_add)
        if user_data.art_to_remove:
            user.portfolio.artworks.update(pull__following=art_to_remove)
        if user_data.group:
            user.groups.append(Group.objects.get(user_data.group))
        if user_data.settings:
            user.settings = updateSettings(user_data.settings)
        # Need to add success/failure responses
        user.save()

        return UpdateUserMutation(user=user)
    
    def updateMetrics(self, metrics):
        return UserMetrics(
            works_visited = metrics.works_visited,
            works_found = metrics.works_found,
            cities_visited = metrics.cities_visited,
            posts_written = metrics.posts_written
        )

    def updateSettings(self, settings):
        return Settings(
            autoAddToGroupPortfolio = settings.autoAddToGroupPortfolio
        )
    
class DeleteUserMutation(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)

    success = graphene.Boolean()

    def mutate(self, info, id):
        try:
            User.objects.get(pk=id).delete()
            success = True
        except:
            print("could not find object")
            return

        return DeleteUserMutation(success=success)

class ArtworkMetricsInput(graphene.InputObjectType):
    total_visits = graphene.IntField()

class ArtworkInput(graphene.InputObjectType):
    id = graphene.ID()
    title = graphene.String()
    artist = graphene.String()
    description = graphene.String()
    found_by = graphene.String()  # will likely be user id
    location = graphene.PointField() # (longitude, latitude)
    metrics = graphene.InputField(ArtworkMetricsInput)
    rating = graphene.FloatField()
    comments = # need a comment input field to append one, will likely add one at a time
    tags = graphene.ListField(graphene.String)  # either be list of tags or list of tag ids to reference     

''' 
where I left off:
    Need to test edits thus far, unsure the most about the nested inputs
    Need to finish artwork mutations
        Figure out how artwork is stored: https://www.reddit.com/r/flask/comments/b88o0u/save_image_in_mongodb_with_mongoengine/
            https://docs.mongoengine.org/apireference.html#mongoengine.fields.ImageField
    Create mock artwork mutations
    Test out geospacial indexing with mock artwork data
        https://docs.mongodb.com/manual/geospatial-queries/
        https://docs.mongodb.com/manual/reference/method/db.collection.createIndex/#db.collection.createIndex
        https://www.youtube.com/watch?v=iGnSNfzaLf4&ab_channel=Udacity
        https://docs.mongoengine.org/guide/defining-documents.html# 
        https://docs.mongoengine.org/guide/querying.html#advanced-queries - will want to use near
    Then finish CRUD operations if possible

    Extra:
        What is the process of updating the metrics and achievements?
'''

# below needs major edits
class CreateArtworkMutation(graphene.Mutation):
    # possible output types to show with return query
    artwork = graphene.Field(ArtworkType)

    class Arguments:
        artwork_data = UserInput(required=True)

    def mutate(self, info, user_data=None):
        # Unsure how to reference the portfolio here
        # Possible guess:
        #       need to create a portfolio separately, save it, get its id (unsure), then add it to the user (could )
        portfolio = Portfolio()
        settings = Settings()
        
        user = User(
            # probably need to add username and password
            name=user_data.name,
            bio = user_data.bio,    # not required by model, will assume frontend filters input
            metrics = UserMetrics(),
            #achievements = graphene.List(graphene.String) 
            #achievement = Achievement(title="Love", description="Truth", points=5)
            
            personal_portfolio = portfolio,
            settings = settings
            # could add an initial achievement, so that we only have to append to a list afterwards
        )
        user.save()

        return CreateUserMutation(user=user)


'''
example mutation in graphql interface:

Creates user and returns most relevant information about them

mutation testMutation {
  createUser(userData: {
    name: "Branden"
    bio: "Sweet Hater of Science"
  }) {
    user {
      name,
      bio,
      dateJoined,
      metrics {
        worksVisited,
        worksFound,
        citiesVisited,
        postsWritten
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
    user {
      name
    }
  }  
}

'''
