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
nltk.download('popular')

app = Flask(__name__)
CORS(app, resources={r"/predict": {"origins": "http://localhost:3000"}})  # Enable CORS for /predict route from localhost:3000

# Load Data
courses_df = pd.read_csv('dr01_courses_cleaned.csv', delimiter=";")
jobs_df = pd.read_csv('dr01_jobs_cleaned.csv', delimiter=";")
ratings_df = pd.read_csv('ratings.csv', delimiter=";")
job_applicant_df = pd.read_csv('job_applicant.csv', delimiter=";")

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
courses_df['description'] = courses_df['description'].apply(clean_text)
jobs_df['description'] = jobs_df['description'].apply(clean_text)

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
    rated_courses = ratings_df[ratings_df['respondent_identifier'] == user_id]['course_id'].unique()
    user_courses = courses_df[courses_df['id'].isin(rated_courses)]
    # user_courses = coba
    job_applications = job_applicant_df[job_applicant_df['user_id'] == user_id]['vacancy_id'].unique()

    # Menghitung jumlah kursus yang diselesaikan berdasarkan learning path
    learning_paths = courses_df['learning_path'].unique()
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
        for _, job in jobs_df.iterrows():
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


@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    user_id = data.get('user_id')
    user_recommendations = recommend_jobs(user_id)
    recommended_jobs = [rec[0] for rec in user_recommendations]
    rec_sim = [rec[1] for rec in user_recommendations]
    recommended_positions = [jobs_df[jobs_df['id'] == job_id]['position'].values[0] for job_id in recommended_jobs]
    # Mengembalikan rekomendasi sebagai JSON
    return jsonify({'id': recommended_jobs, 'position': recommended_positions, 'similiarity': rec_sim})
if __name__ == '__main__':
    app.run(debug=True)
