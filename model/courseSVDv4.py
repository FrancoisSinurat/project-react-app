import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.decomposition import TruncatedSVD
from sklearn.metrics import mean_squared_error
from sklearn.preprocessing import MinMaxScaler


# Muat data
courses_for_course = pd.read_csv('./data/dr01_courses.csv')
ratings_for_course = pd.read_excel('./data/ratings.xlsx')
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

# Rescale predictions to the range 1-5
scaler = MinMaxScaler(feature_range=(1, 5))
predicted_ratings = scaler.fit_transform(predicted_ratings)


# Evaluasi model
test_user_ids = test_data['user_id'].unique()
test_matrix = ratings_pivot.loc[test_user_ids].values
predicted_ratings_test = np.dot(model.transform(test_matrix), model.components_)

# Rescale test predictions to the range 1-5
predicted_ratings_test = scaler.transform(predicted_ratings_test)

# Membuat matrix untuk nilai aktual pada test set
actual_ratings_test = ratings_pivot.loc[test_user_ids].values

# Hanya mengukur error pada nilai yang tidak nol (yang ada dalam test set)
mask = actual_ratings_test > 0
rmse = np.sqrt(mean_squared_error(actual_ratings_test[mask], predicted_ratings_test[mask]))
print(f'RMSE: {rmse}')

# Prediksi penuh untuk semua user-item pair
predicted_ratings_full = np.dot(model.transform(ratings_pivot.values), model.components_)

# Rescale full predictions to the range 1-5
predicted_ratings_full = scaler.transform(predicted_ratings_full)

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

# Contoh penggunaan
user_id = 401  # Ganti dengan user_id yang diinginkan

if ratings_for_course[ratings_for_course['user_id'] == user_id].empty:
    print("Cold Start User Detected")
    recommended_courses = get_cold_start_recommendations(courses_for_course, ratings_for_course)
else:
    recommended_courses = get_recommendations(user_id, model, courses_for_course, ratings_for_course, ratings_pivot, predicted_ratings_full)

print(recommended_courses[['id', 'name', 'predicted_rating' if 'predicted_rating' in recommended_courses.columns else 'popularity']])
