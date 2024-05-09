const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
const app = express()
app.use(express.json())
const dbPath = path.join(__dirname, 'moviesData.db')
let db = null
const initializeServerAndDB = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`Error at DB: ${e.message}`)
    process.exit(1)
  }
}

initializeServerAndDB()

const convertDbObjectToResponse = dbObject => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  }
}

//GET API returns a list of movies

app.get('/movies/', async (request, response) => {
  const getMoviesQuery = `SELECT 
   movie_name
   FROM 
   movie
   ;`
  const players = await db.all(getMoviesQuery)
  console.log(players)
  response.send(
    players.map(eachPlayer => convertDbObjectToResponse(eachPlayer)),
  )
})

//POST API creates a new movie

app.post('/movies/', async (request, response) => {
  const movieDetails = request.body
  const {directorId, movieName, leadActor} = movieDetails
  const createMovieQuery = `
  INSERT INTO
  movie(director_id,movie_name,lead_actor)
  VALUES(
    ${directorId},
    '${movieName}',
    '${leadActor}'
  );`
  const addedMovie = await db.run(createMovieQuery)
  console.log(addedMovie)
  response.send('Movie Successfully Added')
})

//GET API return a specific movie
app.get('/movies/:movieId', async (request, response) => {
  const {movieId} = request.params
  const getMoviesQuery = `SELECT 
   movie_name
   FROM 
   movie
   WHERE 
    movie_id = ${movieId}
   ;`
  const players = await db.all(getMoviesQuery)
  console.log(players)
  response.send(
    players.map(eachPlayer => convertDbObjectToResponse(eachPlayer)),
  )
})

//Put API updates a row in the database

app.put('/movies/:movieId', async (request, response) => {
  const {movieId} = request.params
  const movieDetails = request.body
  const {directorId, movieName, leadActor} = movieDetails
  const getMoviesQuery = `
  UPDATE 
   movie 
   SET 
    director_id = ${directorId},
    movie_name = '${movieName}',
    lead_actor = '${leadActor}'
   WHERE 
    movie_id = ${movieId}
   ;`
  const players = await db.run(getMoviesQuery)
  console.log(players)
  response.send('Movie Details Updated')
})

//DELETE API deletes a row in the row
app.delete('/movies/:movieId', async (request, response) => {
  const {movieId} = request.params
  const deleteMovieQuery = `DELETE 
  FROM 
   movie
  WHERE 
   movie_id = ${movieId};`
  const deletion = await db.run(deleteMovieQuery)
  console.log(deletion)
  response.send('Movie Removed')
})

//GET API returns the directors names
app.get('/directors', async (request, response) => {
  const getDirectorsQuery = `SELECT
  *
  FROM 
  director;`
  const directors = await db.all(getDirectorsQuery)
  console.log(directors)
  response.send(
    directors.map(eachDirector => convertDbObjectToResponse(eachDirector)),
  )
})

//GET API returns the movie name with specific director

app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const getDirectorQuery = `SELECT 
  movie_name
  FROM 
  movie 
  WHERE director_id = ${directorId};`
  const movies = await db.all(getDirectorQuery)
  console.log(movies)
  response.send(movies.map(eachMovie => convertDbObjectToResponse(eachMovie)))
})

module.exports = app
