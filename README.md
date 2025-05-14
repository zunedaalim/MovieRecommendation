# Movie Recommendation System

A web application that recommends movies to users based on content similarity and analyzes the sentiment of IMDb reviews for selected movies.

## Overview

This project implements a hybrid recommendation approach:
1.  **Content-Based Filtering:** Recommends movies similar to a user's selected movie based on features like genres, director, and cast.
2.  **Sentiment Analysis:** For a chosen movie, it scrapes IMDb reviews and classifies their sentiment (positive/negative) using a pre-trained NLP model.

The application is built with a Python Flask backend and a simple HTML/JS frontend.

## Features

*   **Movie Recommendations:** Enter a movie title and get a list of 10 similar movies.
*   **Movie Details:** View details like poster, cast, genres, overview, and rating for the selected movie and its recommendations (fetched via TMDB API).
*   **IMDb Review Sentiment Analysis:** See sentiment classification (Good/Bad) for recent IMDb reviews of the selected movie.
*   **Autocomplete Search:** Autocomplete suggestions for movie titles as you type.
*   **Web Interface:** User-friendly interface to interact with the system.

## How It Works

1.  **Data Preprocessing:**
    *   Movie metadata (from `movie_metadata.csv`, Wikipedia for newer movies) is cleaned and combined.
    *   Key features (genres, director, actors, title) are extracted and processed.
    *   A combined feature string is created for each movie.
    *   The final processed dataset is stored in `main_data.csv`.
2.  **Similarity Model:**
    *   `CountVectorizer` is used to convert the combined textual features of movies into a numerical matrix.
    *   `cosine_similarity` is calculated between all movies to find similarity scores.
3.  **Sentiment Analysis Model:**
    *   A TF-IDF Vectorizer and a Naive Bayes classifier are trained on a dataset of movie reviews (`reviews.txt`).
    *   The trained vectorizer (`tranform.pkl`) and model (`nlp_model.pkl`) are saved.
4.  **Web Application (Flask - `main.py`):**
    *   User enters a movie title in the web UI.
    *   The backend finds the 10 most similar movies using the pre-calculated cosine similarity scores.
    *   It fetches detailed movie information (poster, cast, etc.) for the input movie and recommended movies from the TMDB API.
    *   It scrapes user reviews for the input movie from IMDb.
    *   The sentiment NLP model classifies these scraped reviews.
    *   All information is displayed to the user on the `recommend.html` page.
    *   Movie title suggestions for autocomplete are provided from `main_data.csv`.

## Technologies Used

*   **Backend:**
    *   Python
    *   Flask (Web framework)
    *   Pandas, NumPy (Data manipulation)
    *   Scikit-learn (`CountVectorizer`, `cosine_similarity`, `MultinomialNB`)
    *   NLTK (Stopwords for sentiment analysis)
    *   BeautifulSoup, urllib (Web scraping IMDb reviews)
*   **Frontend:**
    *   HTML, CSS
    *   JavaScript (for TMDB API calls, autocomplete, dynamic content update)
*   **APIs:**
    *   TMDB API (for movie details, posters, cast)
*   **Other:**
    *   Pickle (for saving/loading ML models)

## Project Architecture

(As described on page 1 of the document)
`Dataset` -> `Preprocessing` -> `Model` -> `WebApp` -> `Deploy (Heroku, Render)`

## Setup and Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-name>
    ```

2.  **Create a virtual environment (recommended):**
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```

3.  **Install dependencies:**
    Create a `requirements.txt` file with the following content:
    ```
    numpy
    pandas
    Flask
    scikit-learn
    nltk
    beautifulsoup4
    requests  # Used by tmdbv3api and for direct API calls
    tmdbv3api
    ```
    Then run:
    ```bash
    pip install -r requirements.txt
    ```
    You might need to download NLTK stopwords:
    ```python
    import nltk
    nltk.download('stopwords')
    ```

4.  **Obtain a TMDB API Key:**
    *   Sign up at [TMDB](https://www.themoviedb.org/signup) and get an API key.
    *   You will need to insert this API key in:
        *   `static/recommens.js` (for frontend API calls)
        *   `Preprocessing3.ipynb` (if you re-run preprocessing for 2018 movies)

5.  **Dataset and Pre-trained Models:**
    *   Ensure you have the necessary initial CSV files: `movie_metadata.csv`, `credits.csv`, `reviews.txt`.
    *   You will need the preprocessed data file `main_data.csv` and the pre-trained models `nlp_model.pkl` and `tranform.pkl`.
    *   If these are not provided, you'll need to run the preprocessing Jupyter notebooks (`Preprocessing1.ipynb`, `Preprocessing2.ipynb`, `Preprocessing3.ipynb`, `Preprocessing4.ipynb`, and `Sentiments.ipynb`) in sequence to generate them. Place the generated `.csv` and `.pkl` files in the root directory of the project.

## Usage

1.  **Ensure all required data files (`main_data.csv`) and model files (`nlp_model.pkl`, `tranform.pkl`) are in the project's root directory.**
2.  **Run the Flask application:**
    ```bash
    python main.py
    ```
3.  **Open your web browser and go to:**
    `http://127.0.0.1:5000/`

4.  Type a movie name in the search bar (autocomplete will suggest movies) and click "Search".
5.  View the recommendations and sentiment analysis results.

## File Structure 
.
├── static/
│ ├── css/
│ │ └── style.css
│ └── js/
│ ├── autocomplete.js
│ └── recommens.js
├── templates/
│ ├── home.html
│ └── recommend.html
├── Preprocessing1.ipynb
├── Preprocessing2.ipynb
├── Preprocessing3.ipynb
├── Preprocessing4.ipynb
├── Sentiments.ipynb
├── main_data.csv # Processed movie data
├── nlp_model.pkl # Trained sentiment model
├── tranform.pkl # Trained TF-IDF vectorizer
├── movie_metadata.csv # Initial dataset
├── credits.csv # Initial dataset
├── reviews.txt # Initial dataset for sentiment
├── main.py # Flask application
└── README.md

      
## Future Improvements

*   Deploy to a cloud platform (Heroku, Render).
*   Implement collaborative filtering or more advanced hybrid models.
*   Allow user accounts to save preferences and history.
*   Improve UI/UX.
*   Use environment variables for API keys.

    
