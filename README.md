Here's the complete Markdown file with all the API responses formatted:

```markdown
# Token Hero

Token Hero is a Node.js-based service designed for managing and assigning unique tokens. This service allows users to create, assign, and manage a pool of tokens, ensuring that tokens can be easily allocated and released. The application uses Fastify for the web framework and Redis for token storage.

## Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
- [API Endpoints](#api-endpoints)
- [Swagger Documentation](#swagger-documentation)
- [Installation](#installation)
- [Usage](#usage)


## Features

- Generate unique tokens and store them in a Redis database.
- Assign random free tokens to users.
- Keep tokens alive with a keep-alive endpoint.
- Automatically release tokens after a specified period.
- Delete tokens from the pool as needed.

## Getting Started

To get started with Token Hero, clone the repository and install the dependencies.

### Prerequisites

- Node.js (>= 22.x)
- Redis server

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/jhaji2911/token-problem-node
   ```

2. Install the dependencies:

   ```bash
   yarn
   ```

3. Set up your Redis server (if you haven't already).

4. Configure environment variables as needed (e.g., Redis connection details).

## API Endpoints

### 1. Create Tokens

- **Endpoint:** `POST /tokens`
- **Request Body:**
  ```json
  {
    "count": 10
  }
  ```
- **Response:**
  ```json
  {
    "message": "10 tokens created",
    "tokens": ["token1", "token2", ...]
  }
  ```

### 2. Assign Token

- **Endpoint:** `POST /tokens/assign`
- **Request Body:**
  ```json
  {
    "tokenId": "optional"
  }
  ```
- **Responses:**
  - If `tokenId` is provided and is available:
    ```json
    {
      "message": "Token tokenId assigned"
    }
    ```
  - If no free tokens are available:
    ```json
    {
      "error": "No free token available"
    }
    ```
  - If the token is already assigned:
    ```json
    {
      "error": "Token is already assigned"
    }
    ```

### 3. Keep Token Alive

- **Endpoint:** `POST /tokens/keep-alive`
- **Request Body:**
  ```json
  {
    "tokenId": "required"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Token tokenId kept alive"
  }
  ```

### 4. Unblock Token

- **Endpoint:** `POST /tokens/unblock`
- **Request Body:**
  ```json
  {
    "tokenId": "required"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Token tokenId unblocked"
  }
  ```

### 5. Delete Token

- **Endpoint:** `DELETE /tokens`
- **Request Body:**
  ```json
  {
    "tokenId": "required"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Token tokenId deleted"
  }
  ```

## Swagger Documentation

The API documentation is available at `/docs`. You can use Swagger UI to explore the API endpoints and test them directly.

## Usage

1. Start the application:

   ```bash
   npm start
   ```

2. Access the API at `http://localhost:3000`.

3. Use tools like Postman or curl to interact with the API, or visit `/docs` for interactive documentation.
