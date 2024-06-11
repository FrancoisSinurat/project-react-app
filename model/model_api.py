from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import pandas as pd
import re
import string
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.decomposition import TruncatedSVD
from sklearn.metrics import mean_squared_error
nltk.download('popular')

app = Flask(__name__)
CORS(app, resources={r"/predict-job": {"origins": "http://localhost:3000"}})
CORS(app, resources={r"/predict-course": {"origins": "http://localhost:3000"}})

# =================================================== JOB ====================================================
# Load Data
courses_df = pd.read_csv('dr01_courses_cleaned.csv', delimiter=";")
jobs_df = pd.read_csv('dr01_jobs_cleaned.csv', delimiter=";")
ratings_df = pd.read_csv('ratings.csv', delimiter=";")
job_applicant_df = pd.read_csv('job_applicant.csv', delimiter=";")

courses_for_job = courses_df.copy()
jobs_for_job = jobs_df.copy()
ratings_for_job = ratings_df.copy()
job_applicant_for_job = job_applicant_df.copy()

# Fungsi membersihkan deskripsi
def clean_text(text):
    # Menghilangkan tag html
    text = re.sub(r'<[^>]+>', ' ', text)
    # Mengubah menjadi lowecase
    text = text.lower()
    # Menghilangkan angka
    text = re.sub(r"\d+", r'', text)
    # Menghilangkan tanda baca
    text = text.translate(str.maketrans("", "", string.punctuation))
    # Menghilangkan tautan
    pola_tautan = re.compile(r'https?://\S+|www\.\S+')
    text = pola_tautan.sub(r'', text)
    # Menghilangkan whitespace
    text = text.strip()
    # Tokenize
    word_list = word_tokenize(text)
    # List stopwords
    stopwords_list = stopwords.words('indonesian')
    # Hapus stopword
    list_no_stopwords = [word for word in word_list if word not in stopwords_list]
    text = ' '.join(list_no_stopwords)
    return text

# Apply cleaning to course and job descriptions
courses_for_job['description'] = courses_for_job['description'].apply(clean_text)
jobs_for_job['description'] = jobs_for_job['description'].apply(clean_text)

# Cek kemiripan beberapa kriteria
def calculate_similarity(course, job):
    # Hitung similarity untuk description
    desc_vectorizer = TfidfVectorizer()
    desc_tfidf = desc_vectorizer.fit_transform([course['description'], job['description']])
    desc_similarity = cosine_similarity(desc_tfidf[0:1], desc_tfidf[1:2])[0][0]

    # Hitung similarity untuk name&path/position
    name_vectorizer = TfidfVectorizer()
    combined_text = f"{course['name']} {course['learning_path']}"
    name_tfidf = name_vectorizer.fit_transform([combined_text, job['position']])
    name_similarity = cosine_similarity(name_tfidf[0:1], name_tfidf[1:2])[0][0]

    # Hitung kesamaan level dan experience
    levels = ['FUNDAMENTAL', 'BEGINNER', 'INTERMEDIATE', 'PROFESSIONAL']
    experiences = ['freshgraduate', 'one_to_three_years', 'four_to_five_years', 'six_to_ten_years', 'more_than_ten_years']
    level_index = levels.index(course['level'])
    experience_index = experiences.index(job['minimum_job_experience'])
    level_similarity = 1 - abs(level_index - experience_index) / max(len(levels), len(experiences))

    # Hitung technology frequency
    tech_list = course['technology'].split(',')
    tech_list = [tech.lower() for tech in tech_list]
    tech_count = sum(job['description'].count(tech.strip()) for tech in tech_list)
    tech_similarity = tech_count / len(tech_list)
    # Combine all similarities with weights
    total_similarity = (0.4 * name_similarity + 0.3 * desc_similarity + 0.2 * level_similarity + 0.05 * tech_similarity)
    return total_similarity

# Rekomendasi jobs untuk user
def recommend_jobs(user_id):
    rated_courses = ratings_for_job[ratings_for_job['respondent_identifier'] == user_id]['course_id'].unique()
    user_courses = courses_for_job[courses_for_job['id'].isin(rated_courses)]
    # user_courses = coba
    job_applications = job_applicant_for_job[job_applicant_for_job['user_id'] == user_id]['vacancy_id'].unique()

    # Menghitung jumlah kursus yang diselesaikan berdasarkan learning path
    learning_paths = courses_for_job['learning_path'].unique()
    learning_path_counts = user_courses['learning_path'].value_counts().to_dict()
    # Menghitung proporsi rekomendasi berdasarkan jumlah kursus yang diselesaikan
    total_courses = sum(learning_path_counts.values())
    learning_path_proportions = {path: np.floor((count / total_courses) * 10) / 10 for path, count in
                                 learning_path_counts.items()}

    # Mengurutkan learning path berdasarkan proporsi terbesar
    sorted_learning_paths = sorted(learning_path_proportions.items(), key=lambda x: x[1], reverse=True)

    # Menentukan proporsi untuk learning path dengan proporsi terkecil
    remaining_proportion = 1 - sum(prop for path, prop in sorted_learning_paths[:-1])
    sorted_learning_paths[-1] = (sorted_learning_paths[-1][0], remaining_proportion)

    recommendations = []

    # Mendapatkan proporsi rekomendasi untuk setiap learning path
    for path, proportion in learning_path_proportions.items():
        num_recommendations = int(proportion * 10)  # Menghitung jumlah rekomendasi untuk learning path ini
        path_courses = user_courses[user_courses['learning_path'] == path]

        path_recommendations = []
        for _, job in jobs_for_job.iterrows():
            if job['id'] not in job_applications:
                max_similarity = 0
                for _, course in path_courses.iterrows():
                    similarity = calculate_similarity(course, job)
                    if similarity > max_similarity:
                        max_similarity = similarity
                path_recommendations.append((job['id'], max_similarity))

        # Mengurutkan dan memilih top N rekomendasi untuk learning path ini
        path_recommendations = sorted(path_recommendations, key=lambda x: x[1], reverse=True)[:num_recommendations]
        recommendations.extend(path_recommendations)

    recommendations = sorted(recommendations, key=lambda x: x[1], reverse=True)[:10]
    return recommendations


@app.route('/predict-job', methods=['POST'])
def predict_job():
    data = request.get_json()
    user_id = data.get('user_id')
    user_recommendations = recommend_jobs(user_id)
    recommended_jobs = [rec[0] for rec in user_recommendations]
    rec_sim = [rec[1] for rec in user_recommendations]
    recommended_positions = [jobs_for_job[jobs_for_job['id'] == job_id]['position'].values[0] for job_id in recommended_jobs]
    # Mengembalikan rekomendasi sebagai JSON
    return jsonify({'id': recommended_jobs, 'position': recommended_positions, 'similiarity': rec_sim})

# ================================================ COURSE ====================================================
courses_for_course = courses_df.copy()
ratings_for_course = ratings_df.copy()
ratings_for_course.rename(columns={'respondent_identifier': 'user_id'}, inplace=True)
print("Courses columns:", courses_for_course.columns)
print("Ratings columns:", ratings_for_course.columns)

# Menghapus duplikat
ratings_for_course = ratings_for_course.drop_duplicates(subset=['user_id', 'course_id'])

# Pivot table untuk membentuk user-item matrix
ratings_pivot = ratings_for_course.pivot(index='user_id', columns='course_id', values='rating').fillna(0)

# Split data menjadi train dan test set
train_data, test_data = train_test_split(ratings_for_course, test_size=0.2)

# Pivot train set untuk SVD
train_pivot = train_data.pivot(index='user_id', columns='course_id', values='rating').fillna(0)

# Menggunakan model TruncatedSVD
model = TruncatedSVD(n_components=20, random_state=42)
train_matrix = train_pivot.values
model.fit(train_matrix)

# Transform data untuk mendapatkan prediksi
train_svd = model.transform(train_matrix)
predicted_ratings = np.dot(train_svd, model.components_)

# Evaluasi model
test_user_ids = test_data['user_id'].unique()
test_matrix = ratings_pivot.loc[test_user_ids].values
predicted_ratings_test = np.dot(model.transform(test_matrix), model.components_)

# Membuat matrix untuk nilai aktual pada test set
actual_ratings_test = ratings_pivot.loc[test_user_ids].values

# Hanya mengukur error pada nilai yang tidak nol (yang ada dalam test set)
mask = actual_ratings_test > 0
rmse = np.sqrt(mean_squared_error(actual_ratings_test[mask], predicted_ratings_test[mask]))
print(f'RMSE: {rmse}')

def get_recommendations(user_id, model, courses, ratings, ratings_pivot, predicted_ratings_full, n_recommendations=10):
    if user_id not in ratings_pivot.index:
        return get_cold_start_recommendations(courses, ratings, n_recommendations)
    
    user_idx = ratings_pivot.index.get_loc(user_id)
    user_ratings = predicted_ratings_full[user_idx]
    user_courses = ratings_pivot.columns[ratings_pivot.loc[user_id] > 0].tolist()
    
    courses_to_predict = [course for course in ratings_pivot.columns if course not in user_courses]
    course_predictions = {course: user_ratings[ratings_pivot.columns.get_loc(course)] for course in courses_to_predict}
    
    sorted_courses = sorted(course_predictions.items(), key=lambda x: x[1], reverse=True)
    exist_course = courses['id'].unique()
    recomend_exist = [(id, rating) for id, rating in sorted_courses if id in exist_course]
    top_courses = recomend_exist[:n_recommendations]
    recommended_course_ids = [course_id for course_id, _ in top_courses]
    recommended_ratings = [rating for _, rating in top_courses]
    
    recommended_courses = courses[courses['id'].isin(recommended_course_ids)].copy()
    recommended_courses['predicted_rating'] = recommended_courses['id'].apply(lambda x: recommended_ratings[recommended_course_ids.index(x)])
    
    return recommended_courses.sort_values(by='predicted_rating', ascending=False)

def get_cold_start_recommendations(courses, ratings, n_recommendations=10):
    popular_courses = courses.copy()
    popular_courses['popularity'] = popular_courses['id'].apply(lambda x: ratings[ratings['course_id'] == x].shape[0])
    popular_courses = popular_courses.sort_values(by='popularity', ascending=False)
    return popular_courses.head(n_recommendations)

# Prediksi penuh untuk semua user-item pair
predicted_ratings_full = np.dot(model.transform(ratings_pivot.values), model.components_)

@app.route('/predict-course', methods=['POST'])
def predict_course():
    data = request.get_json()
    user_id = data.get('user_id')
    if ratings_for_course[ratings_for_course['user_id'] == user_id].empty:
        print("Cold Start User Detected")
        recommended_courses = get_cold_start_recommendations(courses_for_course, ratings_for_course)
        recommended_course_ratings = recommended_courses['popularity'].tolist()
    else:
        recommended_courses = get_recommendations(user_id, model, courses_for_course, ratings_for_course, ratings_pivot, predicted_ratings_full)
        recommended_course_ratings = recommended_courses['predicted_rating'].tolist()
    # Mengembalikan rekomendasi sebagai JSON
    recommended_course_ids = recommended_courses['id'].tolist()
    return jsonify({'id': recommended_course_ids, "ratings": recommended_course_ratings})

if __name__ == '__main__':
    app.run(debug=True)
