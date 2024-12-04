# ActiveU

## Brief Application Description
ActiveU is a fitness focused website designed to help users keep track of their workout history, discover new workouts, and connect with friends along the way. 

---

## Contributors

**The \<Tag Team\>:** 

- Jared Osterhaus
- Sarthak Paithankar
- Tyler Schmitz
- Jose Martinez
- Mateo Ruby

---

## Technology Stack Used
Node.js, Express.js, Express-Handlebars, PostgreSQL, Bcrypt.js, Axios, Docker

---

## Prerequisites to Run the Application
1. **Docker and Docker Compose**:
   - Ensure you have Docker installed on your system. Follow the [Docker installation guide](https://docs.docker.com/get-docker/) if you do not.
   - If you are on a Linux machine, install Docker Compose separately by following [these instructions](https://docs.docker.com/compose/install/).

2. **Git**:
   - Ensure you have a Git client installed to clone the repository.

3. **API Key for Exercises API**:
   - Obtain an API key for the [Exercises API](https://api-ninjas.com/api/exercises) on API Ninjas.

---

## Instructions on How to Run the Application Locally
1. Clone the repository.
2. Open a terminal and navigate to the '/ProjectSourceCode' directory.
3. Create the file '.env' and populate it as follows:
    ```.env
    # Database credentials
    POSTGRES_HOST='db'  # Replace 'db' if hosting the database elsewhere
    POSTGRES_PORT=5432  # Default PostgreSQL port
    POSTGRES_USER="your_database_user"  # Replace with your DB username
    POSTGRES_PASSWORD="your_database_password"  # Replace with your DB password
    POSTGRES_DB="your_database_name"  # Replace with your DB name

    # Node.js variables
    SESSION_SECRET="your_session_secret"  # Replace with a secure, random string
    API_KEY="your_api_key"  # Replace with your API key
    ```
4. Run the following command to start the Docker container:
   ```bash
   docker compose up
   ```
5. Open your browser to 'http://localhost:3000/login'.


---

## How to Run the Tests

1. Open a terminal and navigate to the `/ProjectSourceCode` directory.
2. Run the following command to start the Docker containers:
   ```bash
   docker compose up
   ```
3. The tests will run automatically before the server starts running in your browser.

---

## Link to the Deployed Application
https://activeu.onrender.com/


