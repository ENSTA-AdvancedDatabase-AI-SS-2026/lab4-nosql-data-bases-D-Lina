"""
TP3 - Exercice 2 : Ingestion de données IoT
Use Case : SmartGrid DZ - 10 000 capteurs, 5 minutes de mesures
"""
from cassandra.cluster import Cluster
from cassandra.query import BatchStatement, BatchType
import uuid
import random
from datetime import datetime, timedelta
import time

CASSANDRA_HOST = 'localhost'
KEYSPACE = 'smartgrid'
NB_CAPTEURS = 10000
MINUTES_HISTORIQUE = 5
WILAYAS = ["Alger", "Oran", "Constantine", "Annaba", "Blida"]
COMMUNES = {
    "Alger": ["Bab Ezzouar", "Hydra", "El Harrach", "Dar El Beida"],
    "Oran": ["Bir El Djir", "Es Senia", "Arzew"],
    "Constantine": ["El Khroub", "Ain Smara", "Hamma Bouziane"],
    "Annaba": ["El Bouni", "El Hadjar", "Seraidi"],
    "Blida": ["Bougara", "Boufarik", "Larbaa"],
}


def connect():
    """Connexion au cluster Cassandra"""
    cluster = Cluster([CASSANDRA_HOST])
    session = cluster.connect(KEYSPACE)
    return session, cluster


def generate_mesure(capteur_id, wilaya, commune, timestamp):
    """Générer une mesure réaliste pour un capteur"""
    tension_base = 220

    tension = round(tension_base + random.gauss(0, 5), 2)
    alerte = tension < 200 or tension > 240 or random.random() < 0.05
    code_alerte = None
    if tension < 200:
        code_alerte = "SOUS_TENSION"
    elif tension > 240:
        code_alerte = "SUR_TENSION"
    elif alerte:
        code_alerte = "ANOMALIE"

    return {
        "capteur_id": capteur_id,
        "date_jour": timestamp.date(),
        "timestamp": timestamp,
        "wilaya": wilaya,
        "commune": commune,
        "tension_v": tension,
        "courant_a": round(random.uniform(0.5, 15.0), 2),
        "puissance_kw": round(random.uniform(0.1, 3.3), 3),
        "frequence_hz": round(50 + random.gauss(0, 0.1), 2),
        "temperature": round(random.uniform(20, 65), 1),
        "alerte": alerte,
        "code_alerte": code_alerte,
    }


def insert_single(session, mesure, prepared):
    """Insérer une seule mesure dans mesures_par_capteur via prepared statement"""
    session.execute(prepared, (
        mesure["capteur_id"],
        mesure["date_jour"],
        mesure["timestamp"],
        mesure["wilaya"],
        mesure["commune"],
        mesure["tension_v"],
        mesure["courant_a"],
        mesure["puissance_kw"],
        mesure["frequence_hz"],
        mesure["temperature"],
        mesure["alerte"],
        mesure["code_alerte"],
    ))


def insert_batch(session, mesures: list, prepared_mesure, prepared_alerte):
    """
    Insérer un batch de mesures avec UNLOGGED BATCH.
    Taille max 50 par batch (bonne pratique Cassandra).
    Les alertes sont aussi insérées dans alertes_par_wilaya.
    """
    BATCH_SIZE = 50

    for i in range(0, len(mesures), BATCH_SIZE):
        chunk = mesures[i:i + BATCH_SIZE]
        batch = BatchStatement(batch_type=BatchType.UNLOGGED)

        for m in chunk:
            batch.add(prepared_mesure, (
                m["capteur_id"],
                m["date_jour"],
                m["timestamp"],
                m["wilaya"],
                m["commune"],
                m["tension_v"],
                m["courant_a"],
                m["puissance_kw"],
                m["frequence_hz"],
                m["temperature"],
                m["alerte"],
                m["code_alerte"],
            ))

            if m["alerte"] and m["code_alerte"]:
                batch.add(prepared_alerte, (
                    m["wilaya"],
                    m["date_jour"],
                    m["timestamp"],
                    m["capteur_id"],
                    m["code_alerte"],
                    f"Alerte capteur {m['capteur_id']} : {m['code_alerte']}",
                    3 if m["code_alerte"] in ("SOUS_TENSION", "SUR_TENSION") else 2,
                    False,
                ))

        session.execute(batch)


def run_ingestion(session):
    """
    Générer et insérer NB_CAPTEURS × MINUTES_HISTORIQUE mesures.
    """
    print(f"Démarrage ingestion : {NB_CAPTEURS} capteurs × {MINUTES_HISTORIQUE} min")

    prepared_mesure = session.prepare("""
        INSERT INTO mesures_par_capteur
          (capteur_id, date_jour, timestamp, wilaya, commune,
           tension_v, courant_a, puissance_kw, frequence_hz,
           temperature, alerte, code_alerte)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        USING TTL 7776000
    """)

    prepared_alerte = session.prepare("""
        INSERT INTO alertes_par_wilaya
          (wilaya, date_jour, timestamp, capteur_id,
           code_alerte, description, gravite, resolue)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        USING TTL 31536000
    """)

    # Assigner chaque capteur à une wilaya/commune fixe
    capteurs = []
    for _ in range(NB_CAPTEURS):
        wilaya = random.choice(WILAYAS)
        commune = random.choice(COMMUNES[wilaya])
        capteurs.append((uuid.uuid4(), wilaya, commune))

    now = datetime.utcnow()
    start = time.time()
    total_insere = 0

    for minute in range(MINUTES_HISTORIQUE):
        timestamp = now - timedelta(minutes=MINUTES_HISTORIQUE - minute)
        mesures = [
            generate_mesure(cid, wilaya, commune, timestamp)
            for cid, wilaya, commune in capteurs
        ]
        insert_batch(session, mesures, prepared_mesure, prepared_alerte)
        total_insere += len(mesures)
        print(f"  Minute {minute + 1}/{MINUTES_HISTORIQUE} — {total_insere:,} mesures insérées")

    elapsed = time.time() - start
    total = NB_CAPTEURS * MINUTES_HISTORIQUE
    print(f"\n✅ {total:,} mesures insérées en {elapsed:.1f}s")
    print(f"   Débit : {total / elapsed:,.0f} mesures/seconde")


if __name__ == "__main__":
    session, cluster = connect()
    run_ingestion(session)
    cluster.shutdown()
