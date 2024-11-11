import requests
import csv

# Clé API TMDb
api_key = "035ca99f5580ee111a9315298c7382e5"
# Jeton d'accès en lecture
access_token = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwMzVjYTk5ZjU1ODBlZTExMWE5MzE1Mjk4YzczODJlNSIsIm5iZiI6MTcyOTc3MzY3OS42ODM5OSwic3ViIjoiNjcxN2M0NDA4ZTA1YThjOWE4NGQzY2NkIiwic2NvcGVzIjpbImFwaV9yZWFkIl0sInZlcnNpb24iOjF9.aUhB4FpMaJIdKaJbmuw5kPlt6XIiF6-PIRy02JpOybw"

# URL de base de l'API TMDb
base_url = "https://api.themoviedb.org/3"

# Fonction pour récupérer les plateformes disponibles en France
def get_providers_for_movie(movie_id):
    url = f"{base_url}/movie/{movie_id}/watch/providers"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json;charset=utf-8"
    }
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        providers = response.json()
        # Extraire les plateformes pour la France
        if 'results' in providers and 'FR' in providers['results']:
            return providers['results']['FR'].get('flatrate', [])
    return []

# Fonction pour récupérer plusieurs pages de films populaires
def get_popular_movies(num_pages=5):
    all_movies = []
    for page in range(1, num_pages + 1):
        url = f"{base_url}/movie/popular"
        params = {
            "api_key": api_key,
            "language": "fr-FR",
            "page": page
        }
        response = requests.get(url, params=params)
        if response.status_code == 200:
            all_movies.extend(response.json().get('results', []))
    return all_movies

# Fonction pour récupérer plusieurs pages de séries populaires
def get_popular_tv_shows(num_pages=5):
    all_tv_shows = []
    for page in range(1, num_pages + 1):
        url = f"{base_url}/tv/popular"
        params = {
            "api_key": api_key,
            "language": "fr-FR",
            "page": page
        }
        response = requests.get(url, params=params)
        if response.status_code == 200:
            all_tv_shows.extend(response.json().get('results', []))
    return all_tv_shows

# Fonction pour récupérer les films et séries avec leurs plateformes
def get_movies_and_tv_by_platform(num_pages=5):
    movies = get_popular_movies(num_pages=num_pages)
    tv_shows = get_popular_tv_shows(num_pages=num_pages)
    
    movie_platforms = []
    for movie in movies:
        platforms = get_providers_for_movie(movie['id'])
        movie_platforms.append({
            'title': movie['title'],
            'type': 'Movie',
            'platforms': [p['provider_name'] for p in platforms] if platforms else "Non disponible en France"
        })
    
    tv_platforms = []
    for show in tv_shows:
        platforms = get_providers_for_movie(show['id'])
        tv_platforms.append({
            'title': show['name'],
            'type': 'TV Show',
            'platforms': [p['provider_name'] for p in platforms] if platforms else "Non disponible en France"
        })
    
    return movie_platforms, tv_platforms

# Fonction pour sauvegarder les données dans un fichier CSV
def save_to_csv(movies, tv_shows, filename='movies_tv_platforms.csv'):
    with open(filename, mode='w', newline='', encoding='utf-8') as file:
        writer = csv.writer(file)
        # Ecrire l'en-tête du fichier CSV
        writer.writerow(['Title', 'Type', 'Platforms'])
        
        # Ajouter les films
        for movie in movies:
            writer.writerow([movie['title'], movie['type'], ', '.join(movie['platforms'])])
        
        # Ajouter les séries
        for show in tv_shows:
            writer.writerow([show['title'], show['type'], ', '.join(show['platforms'])])

if __name__ == "__main__":
    # Récupère 10 pages de films et séries
    movies, tv_shows = get_movies_and_tv_by_platform(num_pages=10)
    save_to_csv(movies, tv_shows)
    print("Données sauvegardées dans le fichier 'movies_tv_platforms.csv'")
