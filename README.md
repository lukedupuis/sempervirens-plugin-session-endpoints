# Sempervirens Plugin: Session Endpoints

A set of endpoints for maintaining a JWT session on an Express server.

![Tests badge](https://github.com/lukedupuis/sempervirens-plugin-session-endpoints/actions/workflows/main.yml/badge.svg?event=push) ![Version badge](https://img.shields.io/static/v1?label=Node&labelColor=30363c&message=16.x&color=blue)

## Installation

`npm i @sempervirens/plugin-session-endpoints`

## Usage

The following enables sending requests to `POST /api/session/start`, `GET /api/session/validate`, `GET /api/session/reset`, and `GET /api/session/stop` to manage a JWT session.

```
import Server from '@sempervirens/server';
import { sessionEndpoints } from '@sempervirens/plugins';

new Server({
  sites: [
    {
      domain: 'site-1',
      endpoints: [
        ...sessionEndpoints()
      ]
    }
  ]
}).start();
```

## API

After retrieving a JWT token with `POST /api/session/start`, the token must be added to the `"Authorization": "Bearer {token}"` header in requests to `validate`, `reset`, and `stop`. The token may also be added to the header in order to validate secure pages and other secure API endpoints. If `isSecure` is `true` on any Sempervirens endpoint, then the system validates the token before serving the page or resource.

### POST /api/session/start

Generates and returns a JWT token containing the data passed in the body of the post request.

### GET /api/session/validate

Returns `isValid` to indicate whether the token passed in the `Authorization` header is valid.

### GET /api/session/reset

Returns a new token. The data from the fist token, which was passed in the `Authorization` header, is transferred to the new token. `origIat` is added to the new token to show when the first token was originally created.

### GET /api/session/stop

Invalidates the token passed in the `Authorization` header.