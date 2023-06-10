# Velosphere

Welcome to Velosphere! This is a full stack web application built using the MERN (MongoDB, Express, React, Node.js) stack. It is designed to provide a platform for interns within the Scotiabank Velocity program to connect, discover, and network with each other.

## Features

- User Authentication: Interns can create an account, log in, and update their profile information.
- Intern Profiles: Each intern has a profile page showcasing their professional details, including team, role, skills, and links to their external accounts.
- Search and Recommendation: Interns can search for other interns based on various criteria such as team, role, skills, etc. The system also provides recommendations for potential connections based on shared interests or background.
- Networking: Interns can connect with each other, send messages, and build professional relationships within the program.

## Tech Stack

- Front-end: React.js, HTML, CSS, Material-UI (or any other UI library of your choice)
- Back-end: Node.js, Express.js
- Database: MongoDB (MongoDB Atlas for cloud-based deployment)
- Deployment: Heroku (or any other hosting platform of your choice)

## Prerequisites

- Node.js and npm should be installed on your system.
- MongoDB Atlas account for cloud database hosting.

## Getting Started

1. Clone the repository:
   git clone <repository-url>
2. Install dependencies:
   Copy code
   cd intern-connect
   npm install
3. Set up environment variables:
   Create a .env file in the root directory.
   Define the following environment variables:
   MONGODB_URI: Connection URL for your MongoDB Atlas database.
   SECRET_KEY: Secret key for JWT token generation.
4. Start the developement server:
   npm start
5. Open your browser and visit http://localhost:3000 to view the application.

## Contributing

Contributions are welcome! If you have any ideas, suggestions, or bug reports, please feel free to open an issue or submit a pull request.

## License

This project is licensed under the MIT License.
