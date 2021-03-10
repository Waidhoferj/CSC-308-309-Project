import graphene
from bson import ObjectId
from models import User, UserMetrics, Portfolio, Settings, Achievement, Group, Artwork, ArtworkMetrics
from api_types import UserType, UserMetricsType, PortfolioType, SettingsType, AchievementType, GroupType
from api_types import ArtworkType, CommentType

'''
Need to research more into mutation arguments, but I think how I have them right now is how it should be
List of possible mutations to make:

    create_group - todo
    update_group - todo
    delete_group - todo

    create_achievement - todo
    update_achievement - todo
    remove_achievement - todo

    incrementing metrics mutations (users and artworks) - todo    
'''

# NOTE: reference fields need ObjectId-typed input
# NOTE: Collection methods - Remove deletes everything in the list, pop removes by index
# Idea, might wanna store the graphql id in mongodb or vise versa somehow

class CommentInput(graphene.InputObjectType):
    author = graphene.String()   # User Object id
    content = graphene.String()

class GroupInput(graphene.InputObjectType):
    name = graphene.String()
    bio = graphene.String()
    member_to_add = graphene.String()      # User Object id
    member_to_kick = graphene.String()    # User Object id
    art_to_add = graphene.String()    # Artwork Object id
    art_to_remove = graphene.String()     # Artwork Object id
    comment_to_add = graphene.InputField(CommentInput)      # Actual comment data
    comment_to_remove = graphene.String()  # Comment object id (could also do index here)

class CreateGroupMutation(graphene.Mutation): # none of this tested yet
    # Need a user id, name, as input
    group = graphene.Field(GroupType)
    id = graphene.ID()

    class Arguments:
        group_data = GroupInput(required=True)

    def mutate(self, info, user_data=None):
        group_portfolio = Portfolio()
        chat = graphene.List(CommentType)
        
        group = Group(
            name = group_data.name,
            bio = group_data.bio,    # not required by model, will assume frontend filters input
            members = [User.objects.get(pk=group_data.member_to_add)],
            group_portfolio = group_portfolio,
            chat = chat
        )
        group.save()

        return CreateGroupMutation(group=group, id=group.id)

class UpdateGroupMutation(graphene.Mutation): # none of this tested yet
    group = graphene.Field(GroupType)

    class Arguments:
        group_data = GroupInput(required=True)

    def mutate(self, info, user_data=None):
        group = Group.objects.get(pk=group_data.id)
        if group_data.name:
            group.name = group_data.name
        if group_data.bio:
            group.bio = group_data.bio
        if group_data.art_to_add:
            artToAdd = Artwork.objects.get(pk=group_data.art_to_add)
            group.group_portfolio.artworks.append(artToAdd)
        if group_data.art_to_remove:
            artworkToRemove = Artwork.objects.get(pk=group_data.art_to_remove)
            index = group.group_portfolio.artworks.index(artworkToRemove)
            if index == -1:
                print(f"Art ({artToRemove.id}) is not in Group's portfolio")
            else:
                group.group_portfolio.artworks.pop(index)
        if group_data.comment_to_add:
            commentToAdd = Comment(
                author = User.objects.get(pk=group_data.comment_to_add.author),
                content = group_data.comment_to_add.content
            )
            group.chat.append(commentToAdd)
        if group_data.comment_to_remove:
            commentToRemove = Comment.objects.get(pk=group_data.comment_to_remove)
            index = group.chat.index(commentToRemove)
            if index == -1:
                print(f"Comment ({artToRemove.id}) is not in Group's chat")
            else:
                group.chat.pop(index)
        group.save()

        return UpdateGroupMutation(group=group)

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
    id = graphene.ID()

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
        user.save()

        return CreateUserMutation(user=user, id=user.id)

# Querying by id as an "id" argument should be by encoded string
# id within user_input will be the primary key (email right now)
class UpdateUserMutation(graphene.Mutation):
    user = graphene.Field(UserType)

    class Arguments:
        user_data = UserInput(required=True)

    def mutate(self, info, user_data=None):
        user = User.objects.get(pk=user_data.id)
        if user_data.name:
            user.name = user_data.name
        if user_data.bio:
            user.bio = user_data.bio
        if user_data.email: # don't think I want this while primary key is email
            user.email = user_data.email
        if user_data.metrics:
            user.metrics = UserMetrics(
                works_visited = user_data.metrics.works_visited,
                works_found = user_data.metrics.works_found,
                cities_visited = user_data.metrics.cities_visited,
                posts_written = user_data.metrics.posts_written
            )
        if user_data.achievement:
            user.achievements.append(Achievement.objects.get(pk=user_data.achievement)) 
        if user_data.art_to_add:
            artToAdd = Artwork.objects.get(pk=user_data.art_to_add)
            # Check if none
            user.personal_portfolio.artworks.append(artToAdd)
        if user_data.art_to_remove:
            artToRemove = Artwork.objects.get(pk=user_data.art_to_remove)
            index = user.personal_portfolio.artworks.index(artToRemove)
            if index == -1:
                print(f"Art ({artToRemove.id}) is not in User's portfolio")
            else:
                user.personal_portfolio.artworks.pop(index)
        if user_data.group: # to be tested
            user.groups.append(Group.objects.get(pk=user_data.group))
        if user_data.settings: # to be tested but I imagine works
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

class ArtworkInput(graphene.InputObjectType):
    id = graphene.ID()
    title = graphene.String()
    artist = graphene.String()
    description = graphene.String()
    found_by = graphene.String()  # will be user id
    location = graphene.List(graphene.Float)    # (longitude, latitude)
    metrics = graphene.InputField(ArtworkMetricsInput)
    rating = graphene.Float()    # assuming 1-100 at the moment
    comment = graphene.InputField(CommentInput)
    tags = graphene.List(graphene.String)    


class CreateArtworkMutation(graphene.Mutation):
    artwork = graphene.Field(ArtworkType)
    id = graphene.ID()
    tags = graphene.List(graphene.String)

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
            tags = artwork_data.tags
        )
        artwork.save()

        return CreateArtworkMutation(artwork=artwork, id=artwork.id, tags=artwork.tags)

class UpdateArtworkMutation(graphene.Mutation):
    artwork = graphene.Field(ArtworkType)

    class Arguments:
        artwork_data = ArtworkInput(required=True)

    def mutate(self, info, artwork_data=None):
        artwork = Artwork.objects.get(pk=artwork_data.id)
        if artwork_data.title:
            artwork.title = artwork_data.title
        if artwork_data.artist:
            artwork.artist = artwork_data.artist
        if artwork_data.description:
            artwork.description = artwork_data.description
        if artwork_data.found_by:   # not tested
            artwork.found_by = artwork_data.found_by
        if artwork_data.location: # not tested
            artwork.location = {
                "type": "Point",
                "coordinates": [artwork_data.location[0], artwork_data.location[1]]
            }
        if artwork_data.metrics: # not tested
            artwork.metrics = ArtworkMetrics(
                total_visits = artwork_data.metrics.total_visits
            )
        if artwork_data.rating:
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
            Artwork.objects.get(pk=id).delete()
            success = True
        except:
            print("could not find object")
            return

        return DeleteArtworkMutation(success=success)

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
        worksCreated
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
        worksFound,
        citiesVisited,
        worksCreated
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
