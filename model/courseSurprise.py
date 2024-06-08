# -*- coding: utf-8 -*-
"""
Created on Sat Jun  8 12:51:52 2024

@author: ASUS
"""

import pandas as pd
import numpy as np
from surprise import Dataset, Reader, SVD
from surprise.model_selection import train_test_split
from surprise import accuracy

# Muat data
courses = pd.read_csv('dr01_courses_cleaned.csv', delimiter=";")
ratings = pd.read_csv('ratings.csv', delimiter=";")
ratings.rename(columns={'respondent_identifier': 'user_id'}, inplace=True)
print("Courses columns:", courses.columns)
print("Ratings columns:", ratings.columns)

# Membuat objek Reader untuk mendefinisikan format data rating
reader = Reader(rating_scale=(1, 5))

# Membuat dataset Surprise dari dataframe ratings
data = Dataset.load_from_df(ratings[['user_id', 'course_id', 'rating']], reader)

# Split data menjadi train dan test set
trainset, testset = train_test_split(data, test_size=0.2)

# Menggunakan model SVD
model = SVD()
model.fit(trainset)

# Evaluasi model
predictions = model.test(testset)
print(f'RMSE: {accuracy.rmse(predictions)}')

def get_recommendations(user_id, model, courses, ratings, n_recommendations=10):
    # Daftar kursus yang telah diikuti oleh user
    user_courses = ratings[ratings['user_id'] == user_id]['course_id'].tolist()
    
    # Daftar semua kursus
    all_courses = courses['id'].tolist()
    
    # Kursus yang belum diikuti
    courses_to_predict = [course for course in all_courses if course not in user_courses]
    
    # Prediksi rating untuk kursus yang belum diikuti
    predictions = [model.predict(user_id, course_id) for course_id in courses_to_predict]
    
    # Sortir prediksi berdasarkan rating yang diprediksi
    predictions.sort(key=lambda x: x.est, reverse=True)
    
    # Ambil n rekomendasi teratas
    top_predictions = predictions[:n_recommendations]
    
    # Ambil detail kursus dari tabel courses
    recommended_courses = courses[courses['id'].isin([pred.iid for pred in top_predictions])].copy()
    
    # Tambahkan kolom rating yang diprediksi ke dataframe recommended_courses
    recommended_courses['predicted_rating'] = [pred.est for pred in top_predictions]
    
    # Urutkan recommended_courses berdasarkan predicted_rating
    recommended_courses = recommended_courses.sort_values(by='predicted_rating', ascending=False)

    
    return recommended_courses

def get_cold_start_recommendations(courses, ratings, n_recommendations=10):
    # Menghitung popularitas kursus berdasarkan jumlah pendaftar
    popular_courses = courses.copy()
    popular_courses['popularity'] = popular_courses['id'].apply(lambda x: ratings[ratings['course_id'] == x].shape[0])
    
    # Urutkan kursus berdasarkan popularitas
    popular_courses = popular_courses.sort_values(by='popularity', ascending=False)
    
    # Ambil n rekomendasi teratas
    recommended_courses = popular_courses.head(n_recommendations)
    
    return recommended_courses

# Contoh penggunaan
user_id = 105  # Ganti dengan user_id yang diinginkan

# Cek apakah user adalah cold start user
if ratings[ratings['user_id'] == user_id].empty:
    print("Cold Start User Detected")
    recommended_courses = get_cold_start_recommendations(courses, ratings)
else:
    recommended_courses = get_recommendations(user_id, model, courses, ratings)

print(recommended_courses[['id', 'name', 'predicted_rating' if 'predicted_rating' in recommended_courses.columns else 'popularity']])
