import os
import numpy as np
import pandas as pd
from flask import Flask, render_template, request
from flask_cors import CORS
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import json
import bs4 as bs
import urllib.request
from urllib.request import Request, urlopen
import pickle
import traceback

# Load the NLP model and TF-IDF vectorizer from disk
filename = 'nlp_model.pkl'
try:
    clf = pickle.load(open(filename, 'rb'))
    vectorizer = pickle.load(open('transform.pkl', 'rb'))
except FileNotFoundError:
    print("Model or vectorizer file not found!")
    clf, vectorizer = None, None


def create_similarity():
    data = pd.read_csv('main_data.csv')
    # Creating a count matrix
    cv = CountVectorizer()
    count_matrix = cv.fit_transform(data['comb'])
    # Creating a similarity score matrix
    similarity = cosine_similarity(count_matrix)
    return data, similarity


def rcmd(m):
    m = m.lower()
    try:
        data.head()
        similarity.shape
    except:
        data, similarity = create_similarity()
    if m not in data['movie_title'].unique():
        return 'Sorry! The movie you requested is not in our database. Please check the spelling or try with some other movies.'
    else:
        i = data.loc[data['movie_title'] == m].index[0]
        lst = list(enumerate(similarity[i]))
        lst = sorted(lst, key=lambda x: x[1], reverse=True)
        # Exclude first item since it is the requested movie itself
        lst = lst[1:11]
        return [data['movie_title'][a] for a in (x[0] for x in lst)]


# Converting list of strings to a list (eg. "["abc","def"]" to ["abc","def"])
def convert_to_list(my_list):
    try:
        return json.loads(my_list)
    except json.JSONDecodeError:
        return []


def get_suggestions():
    data = pd.read_csv('main_data.csv')
    return list(data['movie_title'].str.capitalize())


app = Flask(__name__)
CORS(app)  # Enable CORS for the app


@app.route("/")
@app.route("/home")
def home():
    suggestions = get_suggestions()
    return render_template('home.html', suggestions=suggestions)


@app.route("/similarity", methods=["POST"])
def similarity():
    movie = request.form['name']
    rc = rcmd(movie)
    if isinstance(rc, str):
        return rc
    else:
        return "---".join(rc)


@app.route("/recommend", methods=["POST"])
def recommend():
    try:
        # Getting data from AJAX request
        title = request.form['title']
        cast_ids = request.form['cast_ids']
        cast_names = request.form['cast_names']
        cast_chars = request.form['cast_chars']
        cast_bdays = request.form['cast_bdays']
        cast_bios = request.form['cast_bios']
        cast_places = request.form['cast_places']
        cast_profiles = request.form['cast_profiles']
        imdb_id = request.form['imdb_id']
        poster = request.form['poster']
        genres = request.form['genres']
        overview = request.form['overview']
        vote_average = request.form['rating']
        vote_count = request.form['vote_count']
        release_date = request.form['release_date']
        runtime = request.form['runtime']
        status = request.form['status']
        rec_movies = request.form['rec_movies']
        rec_posters = request.form['rec_posters']

        # Get movie suggestions for auto-complete
        suggestions = get_suggestions()

        # Convert strings that need to be converted to lists
        rec_movies = convert_to_list(rec_movies)
        rec_posters = convert_to_list(rec_posters)
        cast_names = convert_to_list(cast_names)
        cast_chars = convert_to_list(cast_chars)
        cast_profiles = convert_to_list(cast_profiles)
        cast_bdays = convert_to_list(cast_bdays)
        cast_bios = convert_to_list(cast_bios)
        cast_places = convert_to_list(cast_places)

        # Convert string to list (eg. "[1,2,3]" to [1,2,3])
        cast_ids = cast_ids.strip("[]").split(',')

        # Rendering the string to python string
        for i in range(len(cast_bios)):
            cast_bios[i] = cast_bios[i].replace(
                r'\n', '\n').replace(r'\"', '\"')

        # Combining multiple lists as a dictionary which can be passed to the HTML file
        movie_cards = {rec_posters[i]: rec_movies[i]
                       for i in range(len(rec_posters))}
        casts = {cast_names[i]: [cast_ids[i], cast_chars[i],
                                 cast_profiles[i]] for i in range(len(cast_profiles))}
        cast_details = {cast_names[i]: [cast_ids[i], cast_profiles[i], cast_bdays[i],
                                        cast_places[i], cast_bios[i]] for i in range(len(cast_places))}

        # Web scraping to get user reviews from IMDb site
        url = f'https://www.imdb.com/title/{imdb_id}/reviews?ref_=tt_ov_rt'
        req = Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        sauce = urlopen(req).read()
        soup = bs.BeautifulSoup(sauce, 'lxml')
        soup_result = soup.find_all(
            "div", {"class": "text show-more__control"})

        reviews_list = []  # List of reviews
        reviews_status = []  # List of comments (good or bad)
        for reviews in soup_result:
            if reviews.string:
                reviews_list.append(reviews.string)
                # Passing the review to our model
                movie_review_list = np.array([reviews.string])
                movie_vector = vectorizer.transform(movie_review_list)
                pred = clf.predict(movie_vector)
                reviews_status.append('Good' if pred else 'Bad')

        # Combining reviews and comments into a dictionary
        movie_reviews = {reviews_list[i]: reviews_status[i]
                         for i in range(len(reviews_list))}

        # Passing all the data to the HTML file
        return render_template('recommend.html', title=title, poster=poster, overview=overview,
                               vote_average=vote_average, vote_count=vote_count, release_date=release_date,
                               runtime=runtime, status=status, genres=genres, movie_cards=movie_cards,
                               reviews=movie_reviews, casts=casts, cast_details=cast_details)

    except Exception as e:
        print("Error in recommend route:", traceback.format_exc())
        return "Internal Server Error", 500


# Keep this section only for local testing
# if __name__ == '__main__':
#     port = int(os.environ.get("PORT", 5000))
#     app.run(host='0.0.0.0', port=port, debug=True)
