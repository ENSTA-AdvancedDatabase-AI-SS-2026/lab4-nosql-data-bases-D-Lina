"""
TP5 - Benchmark Comparatif NoSQL
Mesurer les performances de Redis, MongoDB, Cassandra, Neo4j
"""
import time
import statistics
import json
import uuid
import random
import threading
from typing import Callable
import redis
from pymongo import MongoClient, InsertOne
from cassandra.cluster import Cluster
from cassandra.query import BatchStatement, BatchType
from neo4j import GraphDatabase


# ─── Utilitaires de mesure ────────────────────────────────────────────────────

def measure_latency(fn: Callable, iterations: int = 1000) -> dict:
    latencies = []
    for _ in range(iterations):
        start = time.perf_counter()
        fn()
        latencies.append((time.perf_counter() - start) * 1000)

    latencies.sort()
    return {
        "mean_ms":        statistics.mean(latencies),
        "p50_ms":         latencies[int(0.50 * len(latencies))],
        "p95_ms":         latencies[int(0.95 * len(latencies))],
        "p99_ms":         latencies[int(0.99 * len(latencies))],
        "max_ms":         max(latencies),
        "throughput_rps": 1000 / statistics.mean(latencies),
    }


def print_results(name: str, results: dict):
    print(f"\n{'='*50}")
    print(f" {name}")
    print(f"{'='*50}")
    for k, v in results.items():
        print(f"  {k:20s}: {v:.2f}")


# ─── Ex1 : Benchmark Écriture ─────────────────────────────────────────────────

def benchmark_write_redis(n: int = 100_000):
    r = redis.Redis(host='localhost', port=6379, decode_responses=True)
    start = time.perf_counter()

    BATCH = 500
    for i in range(0, n, BATCH):
        pipe = r.pipeline()
        for j in range(i, min(i + BATCH, n)):
            pipe.hset(f"bench:user:{j}", mapping={
                "id": j,
                "name": f"user_{j}",
                "score": random.randint(0, 1000),
                "active": 1,
            })
        pipe.execute()

    elapsed = time.perf_counter() - start
    throughput = n / elapsed
    print(f"\n[Redis  ] Écriture : {n:,} docs en {elapsed:.2f}s → {throughput:,.0f} ops/s")


def benchmark_write_mongodb(n: int = 100_000):
    client = MongoClient("mongodb://admin:admin123@localhost:27017/")
    db = client["benchmark"]
    db.bench_users.drop()

    start = time.perf_counter()
    BATCH = 1000
    for i in range(0, n, BATCH):
        ops = [
            InsertOne({
                "id": j,
                "name": f"user_{j}",
                "score": random.randint(0, 1000),
                "city": random.choice(["Alger", "Oran", "Constantine"]),
                "active": True,
            })
            for j in range(i, min(i + BATCH, n))
        ]
        db.bench_users.bulk_write(ops, ordered=False)

    elapsed = time.perf_counter() - start
    throughput = n / elapsed
    print(f"[MongoDB] Écriture : {n:,} docs en {elapsed:.2f}s → {throughput:,.0f} ops/s")
    client.close()


def benchmark_write_cassandra(n: int = 100_000):
    cluster = Cluster(['localhost'])
    session = cluster.connect()

    session.execute("""
        CREATE KEYSPACE IF NOT EXISTS benchmark
        WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 1}
    """)
    session.set_keyspace('benchmark')
    session.execute("DROP TABLE IF EXISTS bench_users")
    session.execute("""
        CREATE TABLE bench_users (
            id uuid PRIMARY KEY,
            name text,
            score int,
            city text
        )
    """)

    prepared = session.prepare(
        "INSERT INTO bench_users (id, name, score, city) VALUES (?, ?, ?, ?)"
    )

    start = time.perf_counter()
    BATCH = 50
    cities = ["Alger", "Oran", "Constantine", "Annaba", "Blida"]
    rows = [(uuid.uuid4(), f"user_{i}", random.randint(0, 1000), random.choice(cities))
            for i in range(n)]

    for i in range(0, n, BATCH):
        batch = BatchStatement(batch_type=BatchType.UNLOGGED)
        for row in rows[i:i + BATCH]:
            batch.add(prepared, row)
        session.execute(batch)

    elapsed = time.perf_counter() - start
    throughput = n / elapsed
    print(f"[Cassandra] Écriture : {n:,} rows en {elapsed:.2f}s → {throughput:,.0f} ops/s")
    cluster.shutdown()


# ─── Ex2 : Benchmark Lecture ─────────────────────────────────────────────────

def benchmark_read_redis():
    r = redis.Redis(host='localhost', port=6379, decode_responses=True)

    # Point lookup
    def point_lookup():
        r.hgetall(f"bench:user:{random.randint(0, 9999)}")

    # Multi-get via pipeline
    def multi_get():
        pipe = r.pipeline()
        for i in random.sample(range(10000), 10):
            pipe.hgetall(f"bench:user:{i}")
        pipe.execute()

    res_point = measure_latency(point_lookup, 1000)
    res_multi  = measure_latency(multi_get,  500)

    print_results("Redis — Point Lookup", res_point)
    print_results("Redis — Multi-Get (pipeline x10)", res_multi)


def benchmark_read_mongodb():
    client = MongoClient("mongodb://admin:admin123@localhost:27017/")
    db = client["benchmark"]
    db.bench_users.create_index("id")
    db.bench_users.create_index("score")

    def point_lookup():
        db.bench_users.find_one({"id": random.randint(0, 9999)})

    def range_query():
        list(db.bench_users.find({"score": {"$gte": 800}}).limit(20))

    def aggregate_query():
        list(db.bench_users.aggregate([
            {"$group": {"_id": "$city", "avg_score": {"$avg": "$score"}, "count": {"$sum": 1}}},
            {"$sort": {"avg_score": -1}}
        ]))

    print_results("MongoDB — Point Lookup",   measure_latency(point_lookup,   1000))
    print_results("MongoDB — Range Query",    measure_latency(range_query,    500))
    print_results("MongoDB — Aggregate",      measure_latency(aggregate_query, 200))
    client.close()


# ─── Ex3 : Charge concurrente ─────────────────────────────────────────────────

def benchmark_concurrent(db_fn: Callable, n_clients: int = 50, requests_per_client: int = 200):
    all_latencies = []
    lock = threading.Lock()

    def worker():
        local = []
        for _ in range(requests_per_client):
            start = time.perf_counter()
            db_fn()
            local.append((time.perf_counter() - start) * 1000)
        with lock:
            all_latencies.extend(local)

    threads = [threading.Thread(target=worker) for _ in range(n_clients)]
    t0 = time.perf_counter()
    for t in threads:
        t.start()
    for t in threads:
        t.join()
    total_time = time.perf_counter() - t0

    all_latencies.sort()
    total_requests = n_clients * requests_per_client
    print(f"\n[Concurrent] {n_clients} clients × {requests_per_client} req = {total_requests} req")
    print(f"  Durée totale   : {total_time:.2f}s")
    print(f"  Débit global   : {total_requests / total_time:,.0f} req/s")
    print(f"  P50            : {all_latencies[int(0.50 * len(all_latencies))]:.2f}ms")
    print(f"  P95            : {all_latencies[int(0.95 * len(all_latencies))]:.2f}ms")
    print(f"  P99            : {all_latencies[int(0.99 * len(all_latencies))]:.2f}ms")


# ─── Main ─────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("🚀 Benchmark NoSQL - Comparatif des 4 technologies")
    print("=" * 60)

    N = 10_000

    print(f"\n📝 Benchmark Écriture ({N:,} enregistrements)")
    benchmark_write_redis(N)
    benchmark_write_mongodb(N)
    benchmark_write_cassandra(N)

    print(f"\n📖 Benchmark Lecture (1 000 requêtes)")
    benchmark_read_redis()
    benchmark_read_mongodb()

    print(f"\n⚡ Test Charge Concurrente (50 clients — Redis point lookup)")
    r = redis.Redis(host='localhost', port=6379)
    benchmark_concurrent(
        lambda: r.hgetall(f"bench:user:{random.randint(0, N - 1)}"),
        n_clients=50,
        requests_per_client=200
    )

    print("\n✅ Benchmark terminé ! Consultez RAPPORT.md pour l'analyse.")
