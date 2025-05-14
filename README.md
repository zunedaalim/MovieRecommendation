# Movie Recommendation System

This project is a movie recommendation system that suggests similar movies based on the one selected by the user. It combines content-based filtering with natural language processing and data from The Movie Database (TMDB) API to provide intelligent movie suggestions and basic sentiment analysis from IMDb reviews.

## Features

- Movie recommendations based on cast, director, and genres
- Poster and metadata display using TMDB API
- Sentiment analysis of user reviews using a trained NLP model
- Autocomplete movie search
- Flask-based backend with HTML/CSS/JS frontend

## Technologies Used

- Python
- Flask
- Scikit-learn
- Pandas
- BeautifulSoup
- TMDB API
- IMDb web scraping
- CountVectorizer and cosine similarity
- HTML, CSS, JavaScript (with autoComplete.js)

## Dataset and Processing

Data is aggregated from:

- `movie_metadata.csv`
- `credits.csv`
- `movies_metadata.csv`
- Wikipedia pages for movies from 2018 to 2021
- TMDB API for additional metadata

Multiple preprocessing scripts clean and merge these datasets into a final `main_data.csv` used for recommendations.

## How It Works

1. Movie features (actors, director, genres) are combined into a single string.
2. A count matrix is created using CountVectorizer.
3. Cosine similarity is computed between all movie vectors.
4. When a user selects a movie, the system returns the top 10 most similar movies.
5. Reviews are scraped from IMDb and analyzed for sentiment using a pre-trained Naive Bayes model.

## Getting Started

### Prerequisites

- Python 3.x
- pip

### Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/movie-recommendation-system.git
cd movie-recommendation-system
