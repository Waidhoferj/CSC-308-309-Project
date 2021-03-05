import graphene
from bson import ObjectId
from models import User, UserMetrics, Portfolio, Settings, Achievement, Group, Artwork, ArtworkMetrics
from api_types import UserType, UserMetricsType, PortfolioType, SettingsType, AchievementType, GroupType
from api_types import ArtworkType

'''
List of possible mutations to make:

    create_group - todo
    update_group - todo
    delete_group - todo, when should a group be deleted?

    
'''

#class UpdateAchievementMutation(graphene.Mutation): # this will be for us

class UserSettingsInput(graphene.InputObjectType):
    autoAddToGroupPortfolio = graphene.Boolean()

class UserMetricsInput(graphene.InputObjectType):
    works_visited = graphene.Int()
    works_found = graphene.Int()
    cities_visited = graphene.Int()
    posts_written = graphene.Int()

class UserInput(graphene.InputObjectType):
    # since this class is generalized for all updating and creating, won't make any attributes required
    id = graphene.String()
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
    id = graphene.ID()

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
            achievements = [], # will likely want to add a hard coded initial achievement
            personal_portfolio = portfolio,
            groups = [],
            settings = settings
        )
        user.save()

        return CreateUserMutation(user=user, id=user.id)


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
            user.metrics = UserMetrics(
                works_visited = user_data.metrics.works_visited,
                works_found = user_data.metrics.works_found,
                cities_visited = user_data.metrics.cities_visited,
                posts_written = user_data.metrics.posts_written
            )
        if user_data.achievement:
            user.achievements.append(Achievement.objects.get(user_data.achievement)) 
        if user_data.art_to_add:
            user.portfolio.artworks.append(user_data.art_to_add) # need to fix
        if user_data.art_to_remove:
            user.portfolio.artworks.update(pull__following=art_to_remove)
        if user_data.group:
            user.groups.append(Group.objects.get(user_data.group))
        if user_data.settings:
            user.settings = Settings(
                autoAddToGroupPortfolio = settings.autoAddToGroupPortfolio
            )
        # Need to add success/failure responses
        user.save()

        return UpdateUserMutation(user=user)
    
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
    total_visits = graphene.Int()

class CommentInput(graphene.InputObjectType):
    content = graphene.String()
    author = graphene.String()

class ArtworkInput(graphene.InputObjectType):
    id = graphene.ID()
    title = graphene.String()
    artist = graphene.String()
    description = graphene.String()
    found_by = graphene.String()  # will likely be user id
    location = graphene.List(graphene.Float) # (longitude, latitude)
    metrics = graphene.InputField(ArtworkMetricsInput)
    rating = graphene.Float()
    comment = graphene.InputField(CommentInput)    # need a comment input field to append one, will likely add one at a time
    tag = graphene.List(graphene.String)  # tag id to reference     

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

class CreateArtworkMutation(graphene.Mutation):
    # possible output types to show with return query
    artwork = graphene.Field(ArtworkType)
    id = graphene.ID()

    class Arguments:
        artwork_data = ArtworkInput(required=True)

    def mutate(self, info, artwork_data=None):
        metrics = ArtworkMetrics()
        artwork = Artwork(
            title = artwork_data.title,
            artist = artwork_data.artist,
            description = artwork_data.description,
            found_by = User.objects.get(pk=artwork_data.found_by),
            location = {
                "type": "Point",
                "coordinates": [artwork_data.location[0], artwork_data.location[1]]
            },
            metrics = metrics,
            rating = artwork_data.rating,
            comments = [],
            tags = []
        )
        artwork.save()
        # artwork.location.point = [artwork_data.location[0], artwork_data.location[1]]
        # artwork.save()

        return CreateArtworkMutation(artwork=artwork, id=artwork.id)

class UpdateArtworkMutation(graphene.Mutation):
    artwork = graphene.Field(ArtworkType)

    class Arguments:
        artwork_data = ArtworkInput(required=True)

    @staticmethod
    def get_object(id):
        return Artwork.objects.get(pk=id)

    def mutate(self, info, artwork_data=None):
        artwork = UpdateArtworkMutation.get_object(artwork_data.id)
        if artwork_data.title:
            artwork.title = artwork_data.title
        if artwork_data.artist:
            artwork.artist = artwork_data.artist
        if artwork_data.description:
            artwork.description = artwork_data.description
        if artwork_data.found_by:
            artwork.found_by = artwork_data.found_by
        if artwork_data.location:
            artwork.location = {
                "type": "Point",
                "coordinates": [artwork_data.location[0], artwork_data.location[1]]
            }
        if artwork_data.metrics:
            artwork.metrics = ArtworkMetrics(
                total_visits = artwork_data.metrics.total_visits
            )
        if artwork_data.rating:
            artwork.rating = artwork_data.rating
        if artwork_data.comment:
            artwork.comments.append(artwork_data.comment)
        # if artwork_data.tag:          leaving this out for until we're sure about how we are dealing with tags
        #     artwork.tags.append(artwork_data.tag)
        artwork.save()

        return UpdateArtworkMutation(artwork=artwork)

class DeleteArtworkMutation(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)

    success = graphene.Boolean()

    def mutate(self, info, id):
        try:
            Artwork.objects.get(pk=id).delete()
            success = True
        except:
            print("could not find object")
            return

        return DeleteArtworkMutation(success=success)


'''
example mutations in graphql interface
---------------------------------------

Creates user and returns most relevant information about them:

mutation {
  createUser(userData: {
    name: "Tony Richard",
    bio: "Very Happy Boi",
    profilePic: "ijf092ct890t423m98rym230948yrm32409r8y23m490asf"
  }) {
    id
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
    id
    user {
      name
    }
  }  
}

update user using user id:

mutation {
  updateUser(userData: {
    id: "603f37cc87708975e37f8b9c"
    bio: "Very Happy Boi, and not yet ready to go",
    
  }) {
    user {
      id,
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

create artwork mutation ex:

mutation {
  createArtwork(artworkData: {
    title: "Hidden Subway Mural",
    description: "Far side of the subway station has a double walled mural."
    foundBy: "603f37cc87708975e37f8b9c",
    location: [-120.677494, 35.292708],
    rating: 55.0,
    }) {
    id
    artwork {
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
'''
