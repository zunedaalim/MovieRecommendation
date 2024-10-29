$(function () {
  // Enable button only when there is input in the field
  const source = document.getElementById("autoComplete");
  source.addEventListener("input", function (e) {
    $(".movie-button").attr("disabled", e.target.value === "");
  });

  $(".movie-button").on("click", function () {
    var my_api_key = "4b2d7e0ed6a6f1c4ed55a45437eacca9";
    var title = $(".movie").val();
    if (title === "") {
      $(".results").css("display", "none");
      $(".fail").css("display", "block");
    } else {
      load_details(my_api_key, title);
    }
  });
});

// Trigger when clicking on recommended movies
function recommendcard(e) {
  var my_api_key = "4b2d7e0ed6a6f1c4ed55a45437eacca9";
  var title = e.getAttribute("title");
  load_details(my_api_key, title);
}

// Fetch basic details of the movie from API (based on the name of the movie)
function load_details(my_api_key, title) {
  $.ajax({
    type: "GET",
    url: `https://api.themoviedb.org/3/search/movie?api_key=${my_api_key}&query=${title}`,
    success: function (movie) {
      if (movie.results.length < 1) {
        $(".fail").css("display", "block");
        $(".results").css("display", "none");
        $("#loader").delay(500).fadeOut();
      } else {
        $("#loader").fadeIn();
        $(".fail").css("display", "none");
        $(".results").delay(1000).css("display", "block");
        var movie_id = movie.results[0].id;
        var movie_title = movie.results[0].original_title;
        movie_recs(movie_title, movie_id, my_api_key);
      }
    },
    error: function () {
      alert("Invalid Request");
      $("#loader").delay(500).fadeOut();
    },
  });
}

// Get similar movie recommendations from Flask
function movie_recs(movie_title, movie_id, my_api_key) {
  $.ajax({
    type: "POST",
    url: "https://movierecommendationbyzuned.streamlit.app/similarity",
    data: { name: movie_title },
    success: function (recs) {
      if (recs === "Sorry! The movie you requested is not in our database.") {
        $(".fail").css("display", "block");
        $(".results").css("display", "none");
        $("#loader").delay(500).fadeOut();
      } else {
        $(".fail").css("display", "none");
        $(".results").css("display", "block");
        var movie_arr = recs.split("---");
        get_movie_details(movie_id, my_api_key, movie_arr, movie_title);
      }
    },
    error: function () {
      alert("Error retrieving recommendations");
      $("#loader").delay(500).fadeOut();
    },
  });
}

// Fetch all details of a movie using the movie ID
function get_movie_details(movie_id, my_api_key, arr, movie_title) {
  $.ajax({
    type: "GET",
    url: `https://api.themoviedb.org/3/movie/${movie_id}?api_key=${my_api_key}`,
    success: function (movie_details) {
      show_details(movie_details, arr, movie_title, my_api_key, movie_id);
    },
    error: function () {
      alert("API Error!");
      $("#loader").delay(500).fadeOut();
    },
  });
}

// Display and scrape movie reviews, send details to Flask
async function show_details(
  movie_details,
  arr,
  movie_title,
  my_api_key,
  movie_id
) {
  try {
    const imdb_id = movie_details.imdb_id;
    const poster =
      "https://image.tmdb.org/t/p/original" + movie_details.poster_path;
    const overview = movie_details.overview;
    const genres = movie_details.genres.map((genre) => genre.name).join(", ");
    const rating = movie_details.vote_average;
    const vote_count = movie_details.vote_count.toLocaleString();
    const release_date = new Date(movie_details.release_date)
      .toDateString()
      .slice(4);
    const runtime_display = `${Math.floor(movie_details.runtime / 60)} hr ${
      movie_details.runtime % 60
    } min`;
    const status = movie_details.status;

    // Fetch additional data
    const arr_poster = await get_movie_posters(arr, my_api_key);
    const movie_cast = await get_movie_cast(movie_id, my_api_key);
    const ind_cast = await get_individual_cast(movie_cast, my_api_key);

    // Prepare details to send
    const details = {
      title: movie_title,
      cast_ids: JSON.stringify(movie_cast.cast_ids),
      cast_names: JSON.stringify(movie_cast.cast_names),
      cast_chars: JSON.stringify(movie_cast.cast_chars),
      cast_profiles: JSON.stringify(movie_cast.cast_profiles),
      cast_bdays: JSON.stringify(ind_cast.cast_bdays),
      cast_bios: JSON.stringify(ind_cast.cast_bios),
      cast_places: JSON.stringify(ind_cast.cast_places),
      imdb_id: imdb_id,
      poster: poster,
      genres: genres,
      overview: overview,
      rating: rating,
      vote_count: vote_count,
      release_date: release_date,
      runtime: runtime_display,
      status: status,
      rec_movies: JSON.stringify(arr),
      rec_posters: JSON.stringify(arr_poster),
    };

    $.ajax({
      type: "POST",
      data: details,
      url: "https://movierecommendationbyzuned.streamlit.app/recommend",
      dataType: "html",
      complete: function () {
        $("#loader").delay(500).fadeOut();
      },
      success: function (response) {
        $(".results").html(response);
        $("#autoComplete").val("");
        $(window).scrollTop(0);
      },
    });
  } catch (error) {
    console.error("Error in show_details:", error);
  }
}

// Asynchronous helper function to get movie posters
function get_movie_posters(arr, my_api_key) {
  const requests = arr.map((movie_name) =>
    $.ajax({
      type: "GET",
      url: `https://api.themoviedb.org/3/search/movie?api_key=${my_api_key}&query=${movie_name}`,
    })
  );

  return Promise.all(requests)
    .then((responses) => {
      return responses.map(
        (m_data) =>
          "https://image.tmdb.org/t/p/original" + m_data.results[0].poster_path
      );
    })
    .catch(() => {
      alert("Error fetching movie posters");
    });
}

// Asynchronous helper function to get movie cast
function get_movie_cast(movie_id, my_api_key) {
  return $.ajax({
    type: "GET",
    url: `https://api.themoviedb.org/3/movie/${movie_id}/credits?api_key=${my_api_key}`,
  })
    .then((my_movie) => {
      const top_cast = my_movie.cast.slice(0, 10);
      const cast_ids = top_cast.map((cast) => cast.id);
      const cast_names = top_cast.map((cast) => cast.name);
      const cast_chars = top_cast.map((cast) => cast.character);
      const cast_profiles = top_cast.map(
        (cast) => "https://image.tmdb.org/t/p/original" + cast.profile_path
      );

      return { cast_ids, cast_names, cast_chars, cast_profiles };
    })
    .catch(() => {
      alert("Error fetching movie cast");
    });
}

// Asynchronous helper function to get individual cast details
function get_individual_cast(movie_cast, my_api_key) {
  const requests = movie_cast.cast_ids.map((cast_id) =>
    $.ajax({
      type: "GET",
      url: `https://api.themoviedb.org/3/person/${cast_id}?api_key=${my_api_key}`,
    })
  );

  return Promise.all(requests)
    .then((responses) => {
      const cast_bdays = responses.map((cast) =>
        new Date(cast.birthday).toDateString().slice(4)
      );
      const cast_bios = responses.map((cast) => cast.biography);
      const cast_places = responses.map((cast) => cast.place_of_birth);

      return { cast_bdays, cast_bios, cast_places };
    })
    .catch(() => {
      alert("Error fetching cast details");
    });
}
