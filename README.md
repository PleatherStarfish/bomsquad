<p align="center">
  <img src="https://github.com/user-attachments/assets/4976258a-5f92-4dbe-8411-601bab062279" alt="logo_md_alpha" />
</p>


# BOM Squad: An Inventory & Component Aggregator for DIY Audio Hardware Builders

Welcome to **BOM Squad**, a tool designed to make building cool synthesizers (and other audio hardware) less intimidating. Along the way we can help you manage your component inventory and streamline the sourcing and assembly process.

## Live Site

Access the latest live version of BOM Squad, complete with ongoing updates, at [https://bom-squad.com/](https://bom-squad.com/). This version includes the newest features, bug fixes, and improvements. Explore modules, track your inventory, and connect with the DIY audio community through the live site.

## Features

-   **Module Management**: Explore DIY modules, add them to your list of completed or "to build" projects, and catalog required components.
-   **Inventory Tracking**: Keep track of the components you have on hand, organize by location, and avoid duplicate purchases.
-   **Smart Shopping Lists**: Generate optimized shopping lists across builds, track quantities, and compare prices from suppliers like [Tayda](https://www.taydaelectronics.com/) and [Mouser](https://www.mouser.com/).
-   **Component Reviews**: View and contribute community feedback on specific components for given builds.
-   **Version History**: Keep a log of your inventory changes, easily reverting to a previous state when needed.
-   **Dark Mode for Soldering**: Enables a comfortable workspace mode for soldering sessions with reduced eye strain.

## Tech Stack

-   **Backend**: Django, PostgreSQL, Docker
-   **Frontend**: React, TypeScript, Webpack, React Query, React Hook Form
-   **Deployment**: Configured for DigitalOcean with Nginx, AWS S3 for static/media file storage
-   **Continuous Integration**: GitHub Actions for CI/CD

## TypeScript Integration 
BOM Squad is transitioning to TypeScript to enhance code reliability, improve developer experience, and add static type-checking to the frontend codebase. The migration will be gradual: 
1. **Initial Refactor**: Key components and utility functions will be refactored to TypeScript over the next year. 
2. **Component-Based Migration**: Each React component will be updated to TypeScript as modifications are made.
3. **Documentation and Types**: Custom types and interfaces will be documented to facilitate future contributions. As TypeScript is introduced, contributors are encouraged to use TypeScript for any new components or features.

## Getting Started

### Prerequisites

-   **Docker**: Install [Docker](https://www.docker.com/products/docker-desktop) to manage and run containers.
-   **Node.js**: Install [Node.js](https://nodejs.org/en/download) for managing frontend dependencies.

### Installation

1.  **Clone the repository**:
    
	```
	git clone https://github.com/username/project.git
	cd project
	```
    
2.  **Prepare Environment Variables**:
    
    -   Rename `.env.example` to `.env.dev` and populate necessary secrets like `SECRET_KEY`, API keys, and database credentials for local development.
3.  **Install Frontend Dependencies**:  
    In the project root, install Node dependencies for bundling:
	```
	npm install
	```
4.  **Build and Bundle the Frontend**: Use the following Make commands to bundle frontend assets and prepare them for integration with Django:
    
	 ```
	    make build-styles
	    make cp-bundle
	```
    
5.  **Build the Docker Containers**: With Docker Desktop running, build the backend and database containers:
   	 ```
    docker-compose build
	```    
6.  **Start the Application**: Start the application in development mode:
	```
	docker-compose up
	```  
    
7.  **Access the Application**:
    
    -   Frontend and backend integrated: [http://localhost:8000](http://localhost:8000)

### Loading Test Data

To quickly populate the database with test data for development:

1.  **Find the Backend Container ID**:
	 ```   
	docker ps
	 ```   
2.  **Enter the Django Backend Container**: Replace `<container_id>` with the actual container ID from the previous step:
	```  
	docker exec -it <container_id> bash
	``` 
3.  **Load Test Data**: Inside the container, run:
	```
	./manage.py loaddata fixtures/test_data.py
	```

## Frontend Build with Webpack

The frontend code is bundled using Webpack, and assets are moved directly to Django static directories:

-   **Environment Variables** are managed using Dotenv (`.env` file).
-   **Makefile Integration**: Automates the compilation of styles and JavaScript bundles, preparing assets for production.

To rebuild and re-bundle the frontend:
```
make build-styles
make cp-bundle 
```
### Running Tests

To ensure the codebase remains stable, we encourage running tests regularly.

-   **Backend Tests**:
    
    `docker exec -it <container_id> ./manage.py test` 
    
-   **Frontend Tests**:  
    Run `npm test` in the root for any unit or integration tests defined.
    

## Contributing

BOM Squad is open to contributions! Here’s how you can get involved:

1.  **Fork the repository** and create a branch for your feature or bug fix.
2.  **Commit your changes** with clear and concise messages.
3.  **Submit a pull request** with details about your changes for review.

## Supporting the Project

If BOM Squad has been helpful to you, consider supporting development costs via [Ko-fi](https://ko-fi.com/bomsquad/) to help maintain server and hosting expenses.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.



