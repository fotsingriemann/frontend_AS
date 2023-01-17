<h1 style="text-align: center">AquilaTrack 5.x Web App</h1>

<div style="text-align: center">
  <img src="https://badgen.net/badge/node@LTS/>=8.11.1/green">
  <img src="https://badgen.net/badge/yarn/>=1.7.0/blue">
  <img src="https://badgen.net/badge/code style/standard/yellow">
  <img src="https://badgen.net/badge/release/v0.7.13/pink">
</div>

This repository contains the code for the AquilaTrack 5.x client facing web application. This web application is designed as a single page application(initialized & rendered client side) that communicates with the server through `GraphQL` and `ReST API`s.

## Table of Contents

| Index | Title                                |
| ----- | ------------------------------------ |
| 1     | [Getting Started](##getting-started) |
| 2     | [About Frontend](##about-frontend)   |

## Getting Started

### Prerequisites

`NodeJS >= v8.11.1`

`yarn >= 1.12.1`

### Environment variables

Template for `.env` file

```env
REACT_APP_GOOGLE_MAPS_CLIENT = Ask the administrator for the Client Key
REACT_APP_GOOGLE_MAPS_API_KEY = AIzaSyB3ulI6g4KFO9pg6Wq_XvH4VPcfGcbbVJg
REACT_APP_SERVER_HTTP_URI = https://api.dev.aquilatrack.com/
REACT_APP_SERVER_WS_URI = wss://api.dev.aquilatrack.com/
PORT = 8080
```

- You can replace the above specified Google maps API key with your own
- Replace graphql server HTTP_URI and WS_URI to the relevant url of backend server's HTTP and WebSocket URI

### Setup for development

```shell
$ git clone git@gitlab.com:zeliot/product-development/AquilaTrack/frontend.git
$ cd frontend
$ yarn
$ # Create a .env file similar to the one specified above or copy from `.env.example`
$ yarn dev:aquilatrack # or lookup command in package.json scripts for relevant flavour of the app
```

## About Frontend

### What is this repository about?

This repository contains the code for the client side web application part of [AquilaTrack](http://www.zeliot.in/AquilaTrack) SaaS

### References

- If you are a collaborator on this project, see [Contributing Guidelines](./CONTRIBUTING.md) for more process & technical guide
- See [Changelog](./CHANGELOG.md) for change-log.
- Documentation of this project is available [here]()
