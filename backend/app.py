from flask import Flask
from flask_graphql import GraphQLView
from schema import schema
from database import init_db
from testing import testing_boot_up
import argparse
from mongoengine import connect
import importlib
from flask_cors import CORS


app = Flask(__name__)
CORS(app)

app.add_url_rule("/graphql", view_func=GraphQLView.as_view('graphql', schema=schema, graphiql=True))

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Process some integers.')
    parser.add_argument('-l', "--l", "-local", dest='local', action='store_const', const=True, default=False, help='Indicates if the program should run in development mode')
    parser.add_argument('--testing', dest='testing', action='store_const', const=True, default=False, help='Indicates if database mutation tests should execute')
    args = parser.parse_args()
    secrets = None
    use_local_dev = args.local
    execute_tests = args.testing
    try:
        secrets = importlib.import_module("secrets")
    except ModuleNotFoundError:
        print("Could not find secrets.py file, using dev server instead")
        use_local_dev = True
    print(f"Using {'local' if use_local_dev else 'remote'} server...")
    database_uri = "mongomock://localhost" if use_local_dev else secrets.DB_TESTING_URI
    connect(host=database_uri)
    if use_local_dev:
        if execute_tests:
            testing_boot_up() # must use both local and testing tag to get here
        else:
            init_db()
    app.run(debug=True)
