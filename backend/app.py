from flask import Flask
from flask_graphql import GraphQLView
from schema import schema
from database import init_db
from testing import testing_boot_up
import argparse
from mongoengine import connect
import importlib
from flask_cors import CORS
import os


app = Flask(__name__)
CORS(app)

app.add_url_rule("/graphql",
                 view_func=GraphQLView.as_view('graphql',
                                               schema=schema,
                                               graphiql=True))
use_local_dev = False
execute_tests = False


def parse_cl_args():
    parser = argparse.ArgumentParser(description='Process some integers.')
    parser.add_argument('-l', "--l", "-local", dest='local',
                        action='store_const', const=True, default=False,
                        help=('Indicates if the program'
                              'should run in development mode'))
    parser.add_argument('--testing', dest='testing',
                        action='store_const', const=True, default=False,
                        help=('Indicates if database mutation tests'
                              'should execute'))
    args = parser.parse_args()
    use_local_dev = args.local
    execute_tests = args.testing
    print(f"Using {'local' if use_local_dev else 'remote'} server...")
    return (use_local_dev, execute_tests)


DB_USERNAME = os.getenv('DB_USERNAME')
DB_PASSWORD = os.getenv('DB_PASSWORD')
DB_TESTING_NAME = os.getenv('DB_TESTING_NAME')
PORT = int(os.getenv("PORT", 8080))
DEBUG_MODE = int(os.getenv("DEBUG_MODE", 1))
if not (DB_USERNAME and DB_PASSWORD and DB_TESTING_NAME
        and PORT and DEBUG_MODE):
    raise Exception("Missing one or more environmental variables")

if __name__ == '__main__':
    use_local_dev, execute_tests = parse_cl_args()
database_uri = ("mongomock://localhost" if use_local_dev
                else (f"mongodb+srv://{DB_USERNAME}:{DB_PASSWORD}"
                      f"@geoart.0gfam.mongodb.net/{DB_TESTING_NAME}"
                      "?retryWrites=true&w=majority"))
connect(alias="default", host=database_uri)
if use_local_dev:
    if execute_tests:
        testing_boot_up()  # must use both local and testing tag to get here
    else:
        init_db()
if __name__ == '__main__':
    app.run(host="0.0.0.0", debug=DEBUG_MODE, port=PORT)
