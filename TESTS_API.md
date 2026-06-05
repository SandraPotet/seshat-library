# Seshat Library - API Tests

## Base URL

`http://localhost:3000`

## Notes Thunder Client

- La methode HTTP se choisit dans le menu : `GET`, `POST`, `PATCH`, etc.
- L'URL ne doit pas contenir la methode.
- Pour envoyer du JSON : `Body > JSON`
- Pour les routes protegees, ajouter le header :

```txt
Authorization: Bearer TOKEN
```

Ne pas mettre le token entre guillemets.

---

# 1. App

## GET /

**Method:** `GET`  
**URL:** `http://localhost:3000/`

**Expected status:** `200 OK`

**Expected response:**

```txt
Seshat API is running
```

---

# 2. Auth

## POST /auth/register

**Purpose:** Create a new user account.

**Method:** `POST`  
**URL:** `http://localhost:3000/auth/register`  
**Headers:** `Content-Type: application/json`

**Body:**

```json
{
  "username": "testX",
  "password": "monmotdepasse"
}
```

**Success:**

- Status: `201 Created`
- Response: user created + `userId`

### Register Tests

- [x] Valid register -> `201 Created`
- [x] Username already used -> `409 Ce nom d'utilisateur est deja utilise`
- [x] Missing username -> `400 Champ requis`
- [x] Missing password -> `400 Champ requis`
- [x] Empty username or only spaces -> `400 Champ requis`
- [x] Password too short -> `400 Le mot de passe doit contenir au moins 8 caracteres`
- [x] Username with spaces inside -> `400 Le nom d'utilisateur ne doit pas contenir d'espace`

---

## POST /auth/login

**Purpose:** Log in and receive a JWT token.

**Method:** `POST`  
**URL:** `http://localhost:3000/auth/login`  
**Headers:** `Content-Type: application/json`

**Body:**

```json
{
  "username": "testX",
  "password": "monmotdepasse"
}
```

**Success:**

- Status: `200 OK`
- Response: login message + JWT token

### Login Tests

- [x] Valid login -> `200 OK` + token
- [x] Wrong password -> `401 Mot de passe incorrect`
- [x] Unknown user -> `404 Utilisateur introuvable`
- [x] Username with spaces around -> `200 OK` + token
- [x] Missing username -> `400 Champ requis`
- [x] Missing password -> `400 Champ requis`
- [x] Empty username or only spaces -> `400 Champ requis`
- [x] Username with spaces inside -> `400 Le nom d'utilisateur ne doit pas contenir d'espace`

---

# 3. JWT Middleware

Used on protected routes.

## Protected Route Example

**Method:** `GET`  
**URL:** `http://localhost:3000/users/me`

### JWT Tests

- [x] No `Authorization` header -> `401 Token manquant`
- [x] Malformed header: `Authorization: abc123` -> `401 Format du token invalide`
- [x] Wrong token format but with Bearer: `Authorization: Bearer abc123` -> `403 Token invalide`
- [x] Valid token: `Authorization: Bearer TOKEN` -> `200 OK`

---

# 4. Users

## GET /users/me

**Purpose:** Return the current authenticated user's profile.

**Method:** `GET`  
**URL:** `http://localhost:3000/users/me`  
**Headers:** `Authorization: Bearer TOKEN`

**Success:**

- Status: `200 OK`

**Expected response:**

```json
{
  "id": 1,
  "username": "testX"
}
```

### Tests

- [x] Without token -> `401 Token manquant`
- [x] Invalid token -> `403 Token invalide`
- [x] Valid token -> `200 OK` + current user profile
- [x] Response must not include password

---

## GET /users/:id

**Purpose:** Return a public user profile.

This route is public. It does not require a token.

**Method:** `GET`  
**URL:** `http://localhost:3000/users/USER_ID`  
**Headers:** none  
**Body:** none

**Success:**

- Status: `200 OK`
- Response: public user information

**Expected response example:**

```json
{
  "id": 1,
  "username": "test1"
}
```

### Tests

- [x] Existing user -> `200 OK` + public user profile
- [x] Response does not include password
- [x] Invalid userId, example `abc` -> `400 Identifiant utilisateur invalide`
- [x] Invalid userId, example `0` -> `400 Identifiant utilisateur invalide`
- [x] Invalid userId, example `-1` -> `400 Identifiant utilisateur invalide`
- [x] Unknown userId, example `999999` -> `404 Utilisateur introuvable`
- [x] Route without token -> `200 OK`

---

## GET /users/:id/books

**Purpose:** Return a public user library.

This route is public. It does not require a token.

**Method:** `GET`  
**URL:** `http://localhost:3000/users/USER_ID/books`  
**Headers:** none  
**Body:** none

**Success:**

- Status: `200 OK`
- Response: public user library information

**Expected response example:**

```json
{
  "user": {
    "id": 1,
    "username": "test1"
  },
  "books": [
    {
      "id": 3,
      "title": "Dune",
      "author": "Frank Herbert",
      "type": "roman",
      "genre": "science-fiction",
      "status": "read",
      "recommendation": 1,
      "comment": "Très bonne lecture."
    }
  ]
}
```

### Tests

- [x] Existing user with books -> `200 OK` + public user library
- [x] Existing user with empty library -> `200 OK` + `books: []`
- [x] Response includes `user`
- [x] Response includes `books`
- [x] Response does not include password
- [x] Invalid userId, example `abc` -> `400 Identifiant utilisateur invalide`
- [x] Invalid userId, example `0` -> `400 Identifiant utilisateur invalide`
- [x] Invalid userId, example `-1` -> `400 Identifiant utilisateur invalide`
- [x] Unknown userId, example `999999` -> `404 Utilisateur introuvable`
- [x] Route without token -> `200 OK`

# 5. Books

## POST /books

**Purpose:** Add a book to the global catalog.

**Method:** `POST`
**URL:** `http://localhost:3000/books`

**Headers:**

```txt
Authorization: Bearer TOKEN
Content-Type: application/json
```

**Body:**

```json
{
  "title": "Harry Potter a l'ecole des sorciers",
  "author": "J.K Rowling",
  "type": "roman",
  "genre": "fantasy"
}
```

**Success:**

- Status: `201 Created`
- Response: created book with `id`

### Tests

- [x] Valid book with token -> `201 Created`
- [x] Title and author with spaces around -> `201 Created` + response returns clean title and author
- [x] Title with only spaces -> `400 Titre et auteur requis`
- [x] Author with only spaces -> `400 Titre et auteur requis`
- [x] Without token -> `401 Token manquant`
- [x] Missing title -> `400 Titre et auteur requis`
- [x] Missing author -> `400 Titre et auteur requis`
- [x] Duplicate book with same title and same author -> `409 Ce livre est déjà dans le catalogue`
- [x] Duplicate book with different letter case -> `409 Ce livre est déjà dans le catalogue`
- [x] Duplicate book with spaces around title and author -> `409 Ce livre est déjà dans le catalogue`
- [x] Same title with different author -> `201 Created`
- [x] Different title with same author -> `201 Created`

---

## GET /books

**Purpose:** Return all books from the global catalog.

**Method:** `GET`
**URL:** `http://localhost:3000/books`

**Success:**

- Status: `200 OK`
- Response: array of books

**Expected response example:**

```json
[
  {
    "id": 1,
    "title": "Harry Potter a l'ecole des sorciers",
    "author": "J.K Rowling",
    "type": "roman",
    "genre": "fantasy"
  }
]
```

---

## GET /books/:id

**Purpose:** Return the public detail page for one book.

This route is public. It does not require a token.

**Method:** `GET`
**URL:** `http://localhost:3000/books/BOOK_ID`

**Headers:** none

**Body:** none

**Success:**

- Status: `200 OK`
- Response: book details, stats and comments

**Expected response example:**

```json
{
  "book": {
    "id": 1,
    "title": "Harry Potter a l'ecole des sorciers",
    "author": "J.K Rowling",
    "type": "roman",
    "genre": "fantasy"
  },
  "stats": {
    "recommended": 1,
    "notRecommended": 0,
    "totalRead": 1,
    "totalInLibraries": 1
  },
  "comments": [
    {
      "username": "testX",
      "status": "read",
      "recommendation": 1,
      "comment": "J'ai beaucoup aimé cette lecture."
    }
  ]
}
```

### Stats Meaning

- `recommended`: number of users who recommend the book
- `notRecommended`: number of users who do not recommend the book
- `totalRead`: number of users who marked the book as read
- `totalInLibraries`: number of users who added the book to their library

### Tests

- [x] Existing book with comments and recommendations -> `200 OK`
- [x] Existing book with no comments -> `200 OK` + `comments: []`
- [x] Existing book not added to any user library -> `200 OK` + stats at `0`
- [x] Invalid bookId, example `abc` -> `400 Identifiant du livre invalide`
- [x] Unknown bookId, example `999999` -> `404 Livre introuvable`
- [x] Route without token -> `200 OK`
- [x] Response includes `book`
- [x] Response includes `stats`
- [x] Response includes `comments`

### Verification

For a book with comments and recommendations, check that:

- `book` contains the book information
- `stats.recommended` counts recommendations with value `1`
- `stats.notRecommended` counts recommendations with value `0`
- `stats.totalRead` counts users with status `read`
- `stats.totalInLibraries` counts all users who added the book to their library
- `comments` contains only rows with a non-null comment

For a book that exists but is not in any user library, expected response:

```json
{
  "book": {
    "id": 2,
    "title": "Example title",
    "author": "Example author",
    "type": "roman",
    "genre": "fantasy"
  },
  "stats": {
    "recommended": 0,
    "notRecommended": 0,
    "totalRead": 0,
    "totalInLibraries": 0
  },
  "comments": []
}
```

---

# 6. User Library

## POST /users/me/books

**Purpose:** Add an existing book to the current user's library.

**Prerequisites:**

- User must be logged in.
- A book must already exist in `books`.

**Method:** `POST`
**URL:** `http://localhost:3000/users/me/books`
**Headers:** `Authorization: Bearer TOKEN`

**Body:**

```json
{
  "bookId": 1
}
```

**Success:**

- Status: `201 Created`

**Expected response example:**

```json
{
  "message": "Livre ajouté dans votre bibliothèque.",
  "book": {
    "id": 1,
    "title": "Example title",
    "author": "Example author",
    "type": "roman",
    "genre": "fantasy",
    "status": "to_read",
    "recommendation": null,
    "comment": null
  }
}
```

### Tests

- [x] Valid bookId -> `201 Created` + `book` object
- [x] Without token -> `401 Token manquant`
- [x] Missing bookId -> `400 Veuillez choisir un livre a ajouter a votre bibliotheque`
- [x] Unknown bookId -> `404 Livre introuvable`
- [x] Add same book twice -> `409 Ce livre est deja dans votre bibliotheque`

---

## GET /users/me/books

**Purpose:** Return the current user's library.

**Method:** `GET`
**URL:** `http://localhost:3000/users/me/books`
**Headers:** `Authorization: Bearer TOKEN`

**Success:**

- Status: `200 OK`
- Response: array of books

**Expected response example:**

```json
[
  {
    "id": 1,
    "title": "Harry Potter a l'ecole des sorciers",
    "author": "J.K Rowling",
    "type": "roman",
    "genre": "fantasy",
    "status": "to_read",
    "recommendation": null,
    "comment": null
  }
]
```

### Tests

- [x] Valid token with books -> `200 OK` + array of books
- [x] Valid token with empty library -> `200 OK` + `[]`
- [x] Without token -> `401 Token manquant`
- [x] Invalid token -> `403 Token invalide`

---

## PATCH /users/me/books/:bookId

**Purpose:** Update the current user's personal data for a book in their library.

**Prerequisites:**

- User must be logged in.
- Book must exist in the catalog.
- Book must already be in the user's library.

**Method:** `PATCH`
**URL:** `http://localhost:3000/users/me/books/BOOK_ID`
**Headers:** `Authorization: Bearer TOKEN`

**Possible body:**

```json
{
  "status": "reading",
  "recommendation": 0,
  "comment": "J'ai beaucoup aime cette lecture."
}
```

**Allowed values:**

- `status`: `to_read`, `reading`, `read`
- `recommendation`: `1`, `0`, `null`
- `comment`: string or `null`

**Success:**

- Status: `200 OK`

**Expected response:**

```json
{
  "message": "Livre mis a jour dans votre bibliotheque",
  "book": {
    "id": 1,
    "title": "Example title",
    "author": "Example author",
    "type": "roman",
    "genre": "fantasy",
    "status": "reading",
    "recommendation": 0,
    "comment": "J'ai beaucoup aime cette lecture."
  }
}
```

### Tests

- [x] Valid status update -> `200 OK` + `book` object
- [x] Valid recommendation `1` -> `200 OK`
- [x] Valid recommendation `0` -> `200 OK`
- [x] Valid recommendation `null` -> `200 OK`
- [x] Valid comment -> `200 OK`
- [x] Comment `null` -> `200 OK`
- [x] Multiple fields at once -> `200 OK`
- [x] Response includes updated `book` object
- [x] Without token -> `401 Token manquant`
- [x] Invalid bookId, example `abc` -> `400 Identifiant du livre invalide`
- [x] Book not in my library -> `404 Ce livre n'est pas dans votre bibliotheque`
- [x] Empty body `{}` -> `400 Veuillez fournir au moins une information a modifier`
- [x] Invalid status, example `finished` -> `400 Statut de lecture invalide`
- [x] Invalid recommendation, example `4` -> `400 Recommendation invalide`
- [x] Invalid comment, example `123` -> `400 Commentaire invalide`

### Verification

After a successful `PATCH`, call:

```txt
GET http://localhost:3000/users/me/books
```

Check that the updated fields are visible in the library response.

---

## DELETE /users/me/books/:bookId

**Purpose:** Remove a book from the current user's library.

This route removes only the relation in `user_books`. It does not delete the book from the global `books` catalog.

**Prerequisites:**

- User must be logged in.
- Book must exist in the catalog.
- Book must already be in the user's library.

**Method:** `DELETE`
**URL:** `http://localhost:3000/users/me/books/BOOK_ID`
**Headers:** `Authorization: Bearer TOKEN`

**Body:** none

**Success:**

- Status: `200 OK`

**Expected response:**

```json
{
  "message": "Livre retire de votre bibliotheque"
}
```

### Tests

- [x] Valid delete -> `200 OK`
- [x] Without token -> `401 Token manquant`
- [x] Invalid bookId, example `abc` -> `400 Identifiant du livre invalide`
- [x] Book not in my library -> `404 Ce livre n'est pas dans votre bibliotheque`
- [x] Delete the same book twice -> `404 Ce livre n'est pas dans votre bibliotheque`

### Verification

After a successful `DELETE`, call:

```txt
GET http://localhost:3000/users/me/books
```

Check that the removed book is no longer visible in the user's library.

Then call:

```txt
GET http://localhost:3000/books
```

Check that the book still exists in the global catalog.

---
