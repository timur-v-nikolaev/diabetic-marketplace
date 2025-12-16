# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication

### Register
```bash
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "phone": "+7 (999) 999-99-99",
  "city": "Москва"
}

Response:
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "63f7b3c9a1b2c3d4e5f6g7h8",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

### Login
```bash
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "63f7b3c9a1b2c3d4e5f6g7h8",
    "email": "user@example.com",
    "name": "John Doe",
    "city": "Москва",
    "isSeller": false
  }
}
```

### Get Profile
```bash
GET /auth/profile
Authorization: Bearer {token}

Response:
{
  "_id": "63f7b3c9a1b2c3d4e5f6g7h8",
  "email": "user@example.com",
  "name": "John Doe",
  "phone": "+7 (999) 999-99-99",
  "city": "Москва",
  "rating": 4.5,
  "reviewsCount": 12,
  "isSeller": true
}
```

## Listings

### Get All Listings
```bash
GET /listings?city=Москва&category=Глюкометры&minPrice=100&maxPrice=5000&search=Accu-Chek&page=1&limit=10

Response:
{
  "listings": [
    {
      "_id": "63f7b3c9a1b2c3d4e5f6g7h8",
      "title": "Глюкометр Accu-Chek",
      "description": "Новый, не использовался",
      "price": 2500,
      "category": "Глюкометры",
      "city": "Москва",
      "images": ["https://..."],
      "rating": 5,
      "reviewsCount": 2,
      "sellerId": {
        "name": "Ivan K.",
        "rating": 4.8
      }
    }
  ],
  "total": 45,
  "pages": 5
}
```

### Get Listing by ID
```bash
GET /listings/63f7b3c9a1b2c3d4e5f6g7h8

Response:
{
  "_id": "63f7b3c9a1b2c3d4e5f6g7h8",
  "title": "Глюкометр Accu-Chek",
  "description": "Новый, не использовался. Коробка не открывалась.",
  "price": 2500,
  "category": "Глюкометры",
  "city": "Москва",
  "status": "active",
  "views": 145,
  "rating": 5,
  "reviewsCount": 2,
  "images": ["https://..."],
  "sellerId": {
    "_id": "63f7b3c9a1b2c3d4e5f6g7h8",
    "name": "Ivan K.",
    "rating": 4.8,
    "reviewsCount": 25,
    "city": "Москва",
    "phone": "+7 (999) 999-99-99"
  }
}
```

### Create Listing
```bash
POST /listings
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Глюкометр Accu-Chek",
  "description": "Новый, не использовался",
  "category": "Глюкометры",
  "price": 2500,
  "city": "Москва",
  "images": ["base64_image_string"]
}

Response:
{
  "_id": "63f7b3c9a1b2c3d4e5f6g7h8",
  "title": "Глюкометр Accu-Chek",
  "description": "Новый, не использовался",
  "price": 2500,
  "category": "Глюкометры",
  "city": "Москва",
  "status": "active",
  "views": 0,
  "rating": 0,
  "reviewsCount": 0,
  "createdAt": "2024-01-15T10:30:00Z"
}
```

### Update Listing
```bash
PUT /listings/63f7b3c9a1b2c3d4e5f6g7h8
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Глюкометр Accu-Chek (обновлено)",
  "price": 2400
}

Response:
{
  "_id": "63f7b3c9a1b2c3d4e5f6g7h8",
  "title": "Глюкометр Accu-Chek (обновлено)",
  "price": 2400,
  "updatedAt": "2024-01-15T10:35:00Z"
}
```

### Delete Listing
```bash
DELETE /listings/63f7b3c9a1b2c3d4e5f6g7h8
Authorization: Bearer {token}

Response:
{
  "message": "Listing deleted"
}
```

## Save/Unsave Listings

### Save Listing
```bash
POST /listings/63f7b3c9a1b2c3d4e5f6g7h8/save
Authorization: Bearer {token}

Response:
{
  "_id": "63f7b3c9a1b2c3d4e5f6g7h8",
  "savedBy": ["user_id_1", "user_id_2"]
}
```

### Unsave Listing
```bash
POST /listings/63f7b3c9a1b2c3d4e5f6g7h8/unsave
Authorization: Bearer {token}

Response:
{
  "_id": "63f7b3c9a1b2c3d4e5f6g7h8",
  "savedBy": ["user_id_1"]
}
```

## Users

### Get User Listings
```bash
GET /users/63f7b3c9a1b2c3d4e5f6g7h8/listings

Response:
[
  {
    "_id": "63f7b3c9a1b2c3d4e5f6g7h8",
    "title": "Глюкометр",
    "price": 2500,
    "status": "active"
  }
]
```

### Get Saved Listings
```bash
GET /users/saved
Authorization: Bearer {token}

Response:
[
  {
    "_id": "63f7b3c9a1b2c3d4e5f6g7h8",
    "title": "Глюкометр",
    "price": 2500
  }
]
```

## Error Responses

All errors follow this format:
```json
{
  "error": "Error message description"
}
```

Common status codes:
- 200: OK
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 500: Internal Server Error
