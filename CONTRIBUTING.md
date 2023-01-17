# Contributing Guidelines

This file documents the contributing guidelines for this project.

**Please update this document regularly**

## Servers and Deployments

The AquilaTrack web application is deployed on various servers & instances. Below is a list of all servers & their deployments

| Server      | URL                            | Branch                                                                     |
| ----------- | ------------------------------ | -------------------------------------------------------------------------- |
| Development | https://dev.aquilatrack.com    | development                                                                |
| Web         | https://web.aquilatrack.com    | production                                                                 |
| School      | https://school.aquilatrack.com | school                                                                     |
| Toyota      | https://video.aquilatrack.com  | production                                                                 |
| Bonton      | https://tncsc.aquilatrack.com  | [Bonton-Frontend Repo](https://gitlab.com/zeliot/services/bonton/frontend) |

## Deployment Instructions

### Checklist before deploying

- Ensure you are on the right git branch according to the server
- Ensure your `.env` file has the right URLs of the API endpoints according to the target servers, along with other required environment variables.
- Also ensure node packages are installed/updated according to the latest dependencies as specified in `package.json`.
- Finally, run the project locally to ensure it works

#### 1. Deployment with downtime

1. SSH into the server and change the user(`sudo su - kedar`)
2. Go to the project's path(`cd apps/frontend`)
3. Ensure the branch is as required and pull the latest changes(`git pull`)
4. Check the `.env` file, as env file are not tracked by git.
5. Ensure latest dependencies are installed.
6. Build the project(`yarn build`).

Note: This process adds some downtime(while the project is building). To avoid downtime, follow the procedure below

#### 2. Deployment without downtime

1. After following the checklist, build the project locally(`yarn build`)
2. Copy the built files to a folder on the server in your user path using scp(`scp -r build/* ${SERVER_URL}:/home/${USERNAME}/${EMPTY_FOLDER}`)
3. SSH into the server and copy the files from the directory to the frontend project(`sudo cp -R ${DIRECTORY_CONTAINING_BUILT_FILES}/* /home/kedar/apps/frontend/build/`)

## Project Structure

- src

  - config

    Configurations related to mapping of pages and URLs, async version of pages and categorisation of pages in the navigation drawer

  - packages

    Yarn workspace based packages to separate out modules by use case, i.e common, core, school

    - common

      `common` package contains modules that are re-used by other packages or modules that are required for the core functionality of the app

      - apollo

        Apollo client setup used for GraphQL communications

      - auth

        Components related to Authentication for the app

      - constants

        Directory containing common constants used throughout the app

      - graphql

        Common graphql queries & subscriptions used in the app

      - hoc

        React Higher-order-components that can be used by other components

      - root

        The root wrapper component containing the AppShell i.e The base app structure with NavBar & Navigation Drawer

      - router

        Router module provides components for routing authenticated and unauthenticated users(`PrivateRoute` & `PublicRoute` components)

      - shared

        Components shared by other components or accessible through React Context

      - static

        Static resources used by the app are stored here

      - ui

        Generic common UI components that can be used/re-used by other components

      - utils

        Common utility functions used by other modules

    - core

      `core` package contains pages & modules used by the core Aquilatrack web app(or commonly used by alternative versions of the web app)

      - base

        The base folder contains the base versions of pages/modules

      - custom

        The custom folder contains the customised/extended versions of the base pages/modules required by specific clients/use-cases

    - school

      `school` package contains pages & modules used by the Aquilatrack School web app

      - base

### Project structure reasoning

The project is divided into different packages for ease of maintenance & development of customised pages/modules. For example `core` package contains components used by the core aquilatrack, which can later be extended or customised for different clients or use-cases such as `school` package.

Since this web application is a single page application, the configuration of pages for each user can be pulled from the server and only relevant pages are served to the user.

Thus, redundancy of modules for customisation/extension of components is encouraged as only the relavant files are served to the user.

## Version control startegy

This project uses Git for version control and the source code is hosted on GitLab. Ask your manager for access to the relavant group/repository.

This project uses three main branches.

1. `master` - The base branch from which all other branches branch off.
2. `production` - The branch deployed on production servers.
3. `development` - The branch on which usual development of features happen and tested on development server before being deployed to production

Any features that take more than one commit should ideally be done on a separate feature branch branched out of development and should not be merged back into development, until the feature is completely done.

All features/bug fixes should be first done on the development branch/server and tested before being merged/deployed to production.

Any critical/hotfixes can be directly done on the production branch.

General strategy is to merge/deploy frequently and avoid large differences between branches. Try to keep all branches in sync with the `master` as much as possible.

## Technologies used

The client facing AquilaTrack web application is built mainly for usage by clients on their web browsers(desktop), but is also responsive enough to be used on mobile broswers. This project was bootstrapped using [CRA](https://create-react-app.dev/)

- The web app is built with [React](https://reactjs.org/) as the view library
- [React Router](https://reacttraining.com/react-router/web/guides/quick-start) is used for client side routing.
- [React Loadable](https://github.com/jamiebuilds/react-loadable) is used for lazy loading components
- [Material-UI](https://material-ui.com/) is used as the component library keeping [Material Design](https://material.io/) as the base design philosophy
- Custom styling of components is done by writing css-in-js using [jss](https://cssinjs.org/) as used internally by `Material UI`
- The web app uses [GraphQL](https://graphql.org/) for communicating with the server
- Authentication is done using [JWT](https://jwt.io/)
- We use [Google Maps](https://developers.google.com/maps/documentation/javascript/tutorial) & [Open street maps](https://www.openstreetmap.org)(Using [React Leaflet](https://react-leaflet.js.org/)) for interactive maps.
- And a few other libraries for other stuff see [package.json](./package.json)

### Development Environment

[Visual Studio Code](https://code.visualstudio.com/) is the preferred editor for editing and development of this project, as most of the DX setup is done for VS Code.

[Prettier](https://prettier.io/) is used for auto-formatting the code.
