![wide_logo](https://user-images.githubusercontent.com/10040486/147892285-e1b955cf-0916-4c57-92c5-ba0a21d1e6ba.png)

# An inventory and search tool for DIY Eurorack synthesizer modules and components

Welcome to Bom-Squad, the inventory and search tool for DIY Eurorack synthesizer module builders. Bom-Squad empowers users to explore DIY Eurorack modules, add modules to their personal inventory of built or "to build" modules, and catalog required components to create a customized shopping list for assembling modules. The platform simplifies the process of obtaining components from [Tayda](https://www.taydaelectronics.com/), [Mouser](https://www.mouser.com/), and other online retailers, while also enabling users to effectively manage their personal inventory of components. Moreover, Bom-Squad provides versioning capabilities for a user's personal inventories, ensuring that errors are infrequent and effortlessly rectifiable.
 
## Installation

1. Download [Docker](https://www.docker.com/products/docker-desktop) if you don't have it installed already.

2. Download and install [Node.js](https://nodejs.org/en/download) if you don't have it installed already.

3. Clone the repository:

```
git clone https://github.com/username/project.git
```

### Preparing your environment

1. **Set environment variables:** Rename `.env.example` to be `.env.dev` in the root directory of the project, and fill in a secrete key for local development.

2. **Install Node dependancies:** Run npm install in the frontend directory to install the required frontend dependencies.

3. **Build the container:** With Docker Desktop running, run `docker-compose build` to build the Docker containers.

4. **Start the container:** Once the Docker containers are built, run `docker-compose up` to start the Docker containers.

### Loading Test Data into the Database

1. **Find the Django "backend" container ID:** Open a new terminal window and run the following command to get the container ID of the Django backend container:

```
docker ps
```

2. **Enter the Django container:** Run the following command to enter the Django **<u>backend</u>** container, replacing <container_id> with the actual container ID obtained in the previous step:

```
docker exec -it <container_id> bash
```

3. **Load the test data:** Inside the container, run the following command to load the test data:

```
./manage.py loaddata fixtures/test_data.py
```

Your project should now be up and running! Visit http://localhost:3000 to access the frontend and http://localhost:8000 for the backend.




