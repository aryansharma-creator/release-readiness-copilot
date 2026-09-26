# Users API — Contract

Base URL: `http://localhost:3000`

All request and response bodies use `application/json`.

---

## `GET /users`

Returns the full list of users.

**Request**
- No body, no query parameters.

**Response `200 OK`**
```json
[
  { "id": 1, "name": "Alice", "email": "alice@example.com" },
  { "id": 2, "name": "Bob",   "email": "bob@example.com" }
]
```

| Field   | Type   | Description          |
|---------|--------|----------------------|
| `id`    | number | Auto-assigned integer |
| `name`  | string | Display name          |
| `email` | string | Email address         |

---

## `GET /users/:id`

Returns a single user by their numeric `id`.

**Path parameter**

| Parameter | Type   | Description         |
|-----------|--------|---------------------|
| `id`      | number | ID of the user      |

**Response `200 OK`**
```json
{ "id": 1, "name": "Alice", "email": "alice@example.com" }
```

**Response `404 Not Found`** — when no user exists with that id.
```json
{ "error": "User not found" }
```

---

## `POST /users`

Creates a new user and returns the created object.

**Request body** *(required)*
```json
{ "name": "Carol", "email": "carol@example.com" }
```

| Field   | Type   | Required | Description   |
|---------|--------|----------|---------------|
| `name`  | string | ✓        | Display name  |
| `email` | string | ✓        | Email address |

**Response `201 Created`**
```json
{ "id": 3, "name": "Carol", "email": "carol@example.com" }
```

**Response `400 Bad Request`** — when `name` or `email` is missing.
```json
{ "error": "name and email are required" }
```

---

## `POST /users/:id/deactivate`

Marks an existing user as inactive by setting `active` to `false` on their record.

**Path parameter**

| Parameter | Type   | Description    |
|-----------|--------|----------------|
| `id`      | number | ID of the user |

**Response `200 OK`**
```json
{ "id": 1, "name": "Alice", "email": "alice@example.com", "active": false }
```

| Field    | Type    | Description                          |
|----------|---------|--------------------------------------|
| `id`     | number  | User's ID                            |
| `name`   | string  | Display name                         |
| `email`  | string  | Email address                        |
| `active` | boolean | Always `false` after deactivation    |

**Response `404 Not Found`** — when no user exists with that id.
```json
{ "error": "User not found" }
```
