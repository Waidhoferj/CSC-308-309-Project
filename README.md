# GeoArt

[![Netlify Status](https://api.netlify.com/api/v1/badges/9b78853a-ec41-4d53-b363-9cd37967f2a7/deploy-status)](https://app.netlify.com/sites/geoart/deploys)

A web app for public art creators and admirers.

Features include:

- An evolving city map filled with artistic hot-spots
- A scavenger hunt experience that brings people into town to explore art in its native context
- A community to discuss art, make connections and build shared portfolios

[View the Design Mockup](https://framer.com/share/Wireframing--gsKx6BvxCiPsUeIGlnqr/z3TC9SJ5A)

## Getting Started

1. Clone this repo: `git clone https://github.com/Waidhoferj/CSC-308-309-Project.git`
2. Follow setup instructions for [frontend](./frontend/README.md) and [backend](./backend/README.md)
3. With both the frontend and backend development servers running, open [http://localhost:3000](http://localhost:3000) to view the app in the browser.

## Resources

- [Frontend](./frontend/README.md)
- [Backend](./backend/README.md)

## Style Guides

### [Python Files](https://pycodestyle.pycqa.org/en/latest/index.html)

Usage:

- Run "pipenv install" then "pipenv shell" in backend folder
- "pycodestyle file.py" with no errors for each file added to git before commiting

### [Javascript Files](https://prettier.io/docs/en/index.html)

Usage:

- [Installation Guide](https://prettier.io/docs/en/install.html)

## Continuous Integration

When a PR is added to the repo, the following checks are run:

- Netlify site config and build checks
- GraphQL test suite located in [testing.py](./backend/testing.py)

Upon merge:

- The `frontend` folder containing the React app is deployed on Netlify
- The `backend` folder containing the GraphQL API is deployed to Heroku.

## Acceptance Tests

Acceptance tests are important for defining user flows in a way that all shareholders can understand. We used the [Gherkin Language](https://cucumber.io/docs/gherkin/reference/) to describe the user flows and [Cypress](https://www.cypress.io/) to create automated tests around the spec.

- Acceptance test documents exist in an [online document](https://docs.google.com/document/d/1ztd6LJCcpQI31MZ0_H-gIPZa1ru35pd5HM4Jyvr3y0M/edit?usp=sharing)
- Automated tests can be found in the [`integration`](./frontend/cypress/integration) folder

To run Cypress tests:

1. Navigate to the [`frontend`](./frontend) folder
2. Run `npm run cypress`
3. When Cypress boots up, select the test you want to run.


## Unit/Integration Tests

Unit and integration tests are crutial in confirming the functionality of our program. We maintain a testing file on the backend that contains all of our unit tests for our GraphQL api.

- See our wiki for details about unit testing coverage for the backend: https://github.com/Waidhoferj/CSC-308-309-Project/wiki/Unit-Integration-Test-Coverage

