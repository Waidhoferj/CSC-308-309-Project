from flask import Flask
from flask_graphql import GraphQLView
from schema import schema
<<<<<<< HEAD
from database import init_db
import argparse
from mongoengine import connect
import importlib
from flask_cors import CORS






=======
from database import connect_to_db
>>>>>>> 4de2d24 (Updated mutations and mock db)

app = Flask(__name__)
CORS(app)

app.add_url_rule("/graphql", view_func=GraphQLView.as_view('graphql', schema=schema, graphiql=True))

if __name__ == '__main__':
<<<<<<< HEAD
    parser = argparse.ArgumentParser(description='Process some integers.')
    parser.add_argument('-l', "--l", "-local", dest='local', action='store_const', const=True, default=False, help='Indicates if the program should run in development mode')
    args = parser.parse_args()
    secrets = None
    use_local_dev = args.local
    
    try:
        secrets = importlib.import_module("secrets")
    except ModuleNotFoundError:
        print("Could not find secrets.py file, using dev server instead")
        use_local_dev = True
    print(f"Using {'local' if use_local_dev else 'remote'} server...")
    database_uri = "mongomock://localhost" if use_local_dev else secrets.DB_TESTING_URI
    connect(host=database_uri)
    if use_local_dev:
        init_db()
=======
    connect_to_db("MOCK")   # types: "TESTING", "ACTUAL", "MOCK"
>>>>>>> 4de2d24 (Updated mutations and mock db)
    app.run(debug=True)
