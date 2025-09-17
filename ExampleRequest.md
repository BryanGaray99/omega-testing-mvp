/projects
curl --location 'http://localhost:3000/v1/api/projects' \
--header 'Content-Type: application/json' \
--data '{
    "name": "mi-proyecto-test-1",
    "displayName": "Mi Proyecto de Testing E2E",
    "baseUrl": "http://localhost:3004",
    "basePath": "/v1/api",
    "type": "playwright-bdd"
}'

/projects/{id}/endpoints
curl --location 'http://localhost:3000/v1/api/projects/2a3db121-b2d8-4bd2-8278-d6ad804152f0/endpoints' \
--header 'Content-Type: application/json' \
--data '{
  "projectId": "2a3db121-b2d8-4bd2-8278-d6ad804152f0",
  "section": "ecommerce",
  "name": "Product CRUD",
  "entityName": "Product",
  "path": "/products",
  "methods": [
    {
      "method": "GET"
    },
    {
      "method": "POST",
      "requestBodyDefinition": [
        {
          "name": "name",
          "type": "string",
          "example": "iPhone 15 Pro",
          "validations": {
            "minLength": 2,
            "required": true
          }
        },
        {
          "name": "description",
          "type": "string",
          "example": "Latest Apple iPhone with advanced features",
          "validations": {
            "required": true
          }
        },
        {
          "name": "price",
          "type": "number",
          "example": 999.99,
          "validations": {
            "minimum": 0,
            "required": true
          }
        },
        {
          "name": "categoryId",
          "type": "string",
          "example": "cat-1",
          "validations": {
            "required": true
          }
        },
        {
          "name": "stock",
          "type": "number",
          "example": 50,
          "validations": {
            "minimum": 0,
            "required": true
          }
        },
        {
          "name": "imageUrl",
          "type": "string",
          "example": "https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg"
        },
        {
          "name": "isActive",
          "type": "boolean",
          "example": true,
          "validations": {
            "default": true
          }
        }
      ]
    },
    {
      "method": "PATCH",
      "requestBodyDefinition": [
        {
          "name": "name",
          "type": "string",
          "example": "iPhone 15 Pro Max",
          "validations": {
            "minLength": 2,
            "required": false
          }
        },
        {
          "name": "description",
          "type": "string",
          "example": "Updated description for iPhone 15 Pro Max",
          "validations": {
            "required": false
          }
        },
        {
          "name": "price",
          "type": "number",
          "example": 1099.99,
          "validations": {
            "minimum": 0,
            "required": false
          }
        },
        {
          "name": "categoryId",
          "type": "string",
          "example": "cat-1",
          "validations": {
            "required": false
          }
        },
        {
          "name": "stock",
          "type": "number",
          "example": 75,
          "validations": {
            "minimum": 0,
            "required": false
          }
        },
        {
          "name": "imageUrl",
          "type": "string",
          "example": "https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg",
          "validations": {
            "required": false
          }
        },
        {
          "name": "isActive",
          "type": "boolean",
          "example": true,
          "validations": {
            "required": false
          }
        }
      ]
    },
    {
      "method": "DELETE"
    }
  ]
}'