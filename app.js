const express = require("express");

const app = express();

app.use(express.json());

const { open } = require("sqlite");

const sqlite3 = require("sqlite3");

const path = require("path");

const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(2000, () => {
      console.log("Server Running at 2000");
    });
  } catch (error) {
    console.log(`Error msg: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const convertMovieDbObjectToResponseObject = (eachObject) => {
  return {
    movieId: eachObject.movie_id,
    directorId: eachObject.director_id,
    movieName: eachObject.movie_name,
    leadActor: eachObject.lead_actor,
  };
};

const convertDirectorDbObjectToResponseObject = (eachObject) => {
  return {
    directorId: eachObject.director_id,
    directorName: eachObject.director_name,
  };
};

app.get("/movies/", async (request, response) => {
  const movieNames = `
    SELECT 
   movie_name
    FROM 
    movie;`;

  const movies = await db.all(movieNames);
  response.send(
    movies.map((name) => convertMovieDbObjectToResponseObject(name))
  );
});

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
    SELECT 
      *
    FROM 
      movie 
    WHERE 
      movie_id = ${movieId};`;
  const movie = await db.get(getMovieQuery);
  response.send(convertMovieDbObjectToResponseObject(movie));
});

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;

  const createQuery = `
INSERT INTO 
movie
(director_id, movie_name,  lead_actor)
VALUES
(${directorId},'"${movieName}', '${leadActor}');`;

  await db.run(createQuery);
  response.send("Movie Successfully Added");
});

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;

  const { directorId, movieName, leadActor } = request.body;

  const updateQuery = `
UPDATE movie
SET 
director_id=${directorId},
 movie_name='${movieName}',
 lead_actor='${leadActor}' 

WHERE 
movie_id=${movieId};`;

  await db.run(updateQuery);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;

  const deleteQuery = `
DELETE FROM 
movie 
WHERE 
movie_id=${movieId};`;

  await db.run(deleteQuery);

  response.send("Movie Removed");
});

app.get("/directors/", async (request, response) => {
  const getQuery = `
  SELECT 
  * 
  FROM
  director;`;

  const directorList = await db.all(getQuery);
  response.send(
    directorList.map((list) => convertDirectorDbObjectToResponseObject(list))
  );
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;

  const getQuery = `
  SELECT
  movie_name
  FROM
  movie 
  WHERE 
  director_id=${directorId};`;

  const movieNames = await db.all(getQuery);
  response.send(
    movieNames.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

module.exports = app;
