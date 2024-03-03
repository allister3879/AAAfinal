const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const Movie = require('../models/movie'); // Подключаем модель фильмов
const router = express.Router();

router.get('/', (req, res) => {
  res.render('movie', { movieData: [] }); // Передаем пустой массив для movieData
});

router.post('/', async (req, res) => {
  const searchQuery = req.body.search;
  try {
    const response = await axios.get(`https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(searchQuery)}&api_key=7bec46e32bca9c8f51a8253b096ca69d`);
    const movieData = response.data.results;

    // Сохраняем данные фильмов в базе данных
    const decodedToken = jwt.decode(req.cookies.token);
    const userId = decodedToken.userId; // Получаем userId из токена

    // Получаем запись фильмов для данного пользователя
    let userMovies = await Movie.findOne({ userId });

    // Если нет записи, создаем новую
    if (!userMovies) {
    const search = req.body.search;
      userMovies = new Movie({ userId, search, movieList: [] });
    }

    // Добавляем новые данные фильмов в массив movieList4000
    movieData.forEach(movie => {
      userMovies.movieList.push({
        imageUrl: movie.poster_path ? `https://image.tmdb.org/t/p/original/${movie.poster_path}` : 'N/A',
        title: movie.title ? movie.title : 'N/A',
        voteAverage: movie.vote_average ? movie.vote_average : null,
        popularity: movie.popularity ? movie.popularity : null,
        releaseDate: movie.release_date ? new Date(movie.release_date) : null // Изменено на тип Date
      });
    });

    // Сохраняем обновленную запись фильмов
    await userMovies.save();

    res.render('movie', { movieData });
  } catch (error) {
    console.error(error);
  }
});

module.exports = router;
