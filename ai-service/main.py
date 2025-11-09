from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import numpy as np
from sklearn.cluster import KMeans
import math

app = FastAPI(
    title="LogiFlow AI Service",
    description="Microservicio de IA para optimización de rutas y análisis predictivo",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class OrderPoint(BaseModel):
    id: str
    lat: float
    lng: float
    address: str

class RouteOptimizationRequest(BaseModel):
    orders: List[OrderPoint]
    depot_lat: Optional[float] = -34.9205
    depot_lng: Optional[float] = -57.9536

class OptimizedRouteResponse(BaseModel):
    route: List[dict]
    totalDistance: float
    estimatedTime: int
    orderedPoints: List[dict]

def calculate_distance(lat1, lng1, lat2, lng2):
    """Calcula distancia entre dos puntos usando fórmula de Haversine"""
    R = 6371  # Radio de la Tierra en km
    
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    
    a = (math.sin(dlat / 2) * math.sin(dlat / 2) +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlng / 2) * math.sin(dlng / 2))
    
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    distance = R * c
    
    return distance

def nearest_neighbor_tsp(points, depot):
    """
    Algoritmo del vecino más cercano para resolver TSP
    (Traveling Salesman Problem)
    """
    unvisited = points.copy()
    current = depot
    route = [current]
    total_distance = 0
    
    while unvisited:
        nearest = None
        min_dist = float('inf')
        
        for point in unvisited:
            dist = calculate_distance(
                current['lat'], current['lng'],
                point['lat'], point['lng']
            )
            if dist < min_dist:
                min_dist = dist
                nearest = point
        
        route.append(nearest)
        total_distance += min_dist
        current = nearest
        unvisited.remove(nearest)
    
    # Volver al depot
    total_distance += calculate_distance(
        current['lat'], current['lng'],
        depot['lat'], depot['lng']
    )
    
    return route, total_distance

def cluster_orders(orders, n_clusters=3):
    """Agrupa pedidos por zona usando K-Means"""
    if len(orders) < n_clusters:
        return [orders]
    
    coords = np.array([[o['lat'], o['lng']] for o in orders])
    kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
    labels = kmeans.fit_predict(coords)
    
    clusters = []
    for i in range(n_clusters):
        cluster = [orders[j] for j in range(len(orders)) if labels[j] == i]
        if cluster:
            clusters.append(cluster)
    
    return clusters

@app.get("/")
def root():
    return {
        "service": "LogiFlow AI Service",
        "status": "online",
        "version": "1.0.0"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.post("/optimize-route", response_model=OptimizedRouteResponse)
async def optimize_route(request: RouteOptimizationRequest):
    """
    Optimiza una ruta de entregas usando algoritmo de vecino más cercano
    """
    try:
        if not request.orders:
            raise HTTPException(status_code=400, detail="No orders provided")
        
        # Punto de partida (depósito/base)
        depot = {
            'id': 'depot',
            'lat': request.depot_lat,
            'lng': request.depot_lng,
            'address': 'Depósito Central'
        }
        
        # Convertir pedidos a diccionarios
        orders_dict = [
            {
                'id': o.id,
                'lat': o.lat,
                'lng': o.lng,
                'address': o.address
            }
            for o in request.orders
        ]
        
        # Si hay muchos pedidos, agrupar por zonas primero
        if len(orders_dict) > 10:
            clusters = cluster_orders(orders_dict, n_clusters=3)
            
            # Optimizar cada cluster
            all_routes = []
            total_dist = 0
            
            for cluster in clusters:
                route, dist = nearest_neighbor_tsp(cluster, depot)
                all_routes.extend(route[1:])  # Excluir depot de cada cluster
                total_dist += dist
            
            optimized_route = [depot] + all_routes
            total_distance = total_dist
        else:
            # Optimizar directamente
            optimized_route, total_distance = nearest_neighbor_tsp(orders_dict, depot)
        
        # Calcular tiempo estimado (40 km/h promedio + 10 min por entrega)
        avg_speed = 40  # km/h
        time_per_delivery = 10  # minutos
        
        travel_time = (total_distance / avg_speed) * 60  # minutos
        delivery_time = len(orders_dict) * time_per_delivery
        estimated_time = int(travel_time + delivery_time)
        
        # Preparar respuesta
        ordered_points = []
        for idx, point in enumerate(optimized_route):
            if point['id'] != 'depot':
                ordered_points.append({
                    'id': point['id'],
                    'sequence': idx,
                    'lat': point['lat'],
                    'lng': point['lng'],
                    'address': point['address']
                })
        
        return OptimizedRouteResponse(
            route=optimized_route,
            totalDistance=round(total_distance, 2),
            estimatedTime=estimated_time,
            orderedPoints=ordered_points
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/cluster-zones")
async def cluster_zones(orders: List[OrderPoint], n_clusters: int = 3):
    """
    Agrupa pedidos en zonas usando K-Means clustering
    """
    try:
        if not orders or len(orders) < n_clusters:
            raise HTTPException(
                status_code=400,
                detail="Not enough orders for clustering"
            )
        
        orders_dict = [
            {'id': o.id, 'lat': o.lat, 'lng': o.lng, 'address': o.address}
            for o in orders
        ]
        
        clusters = cluster_orders(orders_dict, n_clusters)
        
        return {
            "clusters": [
                {
                    "cluster_id": idx,
                    "orders": cluster,
                    "count": len(cluster)
                }
                for idx, cluster in enumerate(clusters)
            ],
            "total_clusters": len(clusters)
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict-delivery-time")
async def predict_delivery_time(
    distance: float,
    num_orders: int,
    hour_of_day: int,
    weather: Optional[str] = "clear"
):
    """
    Predice el tiempo de entrega basado en múltiples factores
    """
    try:
        # Velocidad base
        base_speed = 40  # km/h
        
        # Ajustar por hora del día (horas pico)
        if 7 <= hour_of_day <= 9 or 17 <= hour_of_day <= 19:
            speed_factor = 0.7  # Tráfico pesado
        elif 12 <= hour_of_day <= 14:
            speed_factor = 0.85  # Tráfico moderado
        else:
            speed_factor = 1.0  # Tráfico normal
        
        # Ajustar por clima
        weather_factor = {
            'clear': 1.0,
            'rain': 0.8,
            'storm': 0.6,
            'fog': 0.7
        }.get(weather, 1.0)
        
        # Calcular velocidad ajustada
        adjusted_speed = base_speed * speed_factor * weather_factor
        
        # Tiempo de viaje
        travel_time = (distance / adjusted_speed) * 60  # minutos
        
        # Tiempo por entrega (incluyendo búsqueda de dirección, espera, etc.)
        time_per_delivery = 10  # minutos
        delivery_time = num_orders * time_per_delivery
        
        # Tiempo total
        total_time = int(travel_time + delivery_time)
        
        # Calcular confianza de la predicción
        confidence = 0.85 if weather == 'clear' else 0.70
        
        return {
            "estimated_time_minutes": total_time,
            "travel_time": int(travel_time),
            "delivery_time": int(delivery_time),
            "confidence": confidence,
            "factors": {
                "speed_factor": speed_factor,
                "weather_factor": weather_factor,
                "adjusted_speed_kmh": round(adjusted_speed, 2)
            }
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
