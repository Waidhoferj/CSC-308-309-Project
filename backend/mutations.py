import graphene

from models import User, UserMetrics, Portfolio, Settings, Achievement, Group
from api_types import UserType, UserMetricsType, PortfolioType, SettingsType, AchievementType, GroupType

'''
List of possible mutations:
    create_user
    update_user - need to add update metrics and settings
    delete_user

    create_group - todo
    update_group - todo
    delete_group - todo, when should a group be deleted?

    
'''



class UserInput(graphene.InputObjectType):
    # id = graphene.ID()
    name = graphene.String(required=True)
    bio = graphene.String()


class CreateUserMutation(graphene.Mutation):
    # possible output types to show with return query
    user = graphene.Field(UserType)

    class Arguments:
        user_data = UserInput(required=True)

    def mutate(self, info, user_data=None):
        # Unsure how to reference the portfolio here
        # Possible guess:
        #       need to create a portfolio separately, save it, get its id (unsure), then add it to the user (could )
        portfolio = Portfolio()
        settings = Settings()
        
        user = User(
            # probably need to add username and password
            name=user_data.name,
            bio = user_data.bio,    # not required by model
            metrics = UserMetrics(),
            #achievements = graphene.List(graphene.String) 
            #achievement = Achievement(title="Love", description="Truth", points=5)
            
            personal_portfolio = portfolio,
            settings = settings
            # could add an initial achievement, so that we only have to append to a list afterwards
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
        # if user_data.metrics:
        #     user.metrics = user_data.metrics
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

NOTE: You do need to have 
'''