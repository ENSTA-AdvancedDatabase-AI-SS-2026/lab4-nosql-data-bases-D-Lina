-- TP3 - Exercice 1 : Schéma Cassandra
-- Use Case : SmartGrid DZ - IoT Électrique

-- ─── 1.1 : Créer le Keyspace ──────────────────────────────────────────────────
-- Pour le TP local on utilise SimpleStrategy avec replication_factor 1
-- En production on passerait à NetworkTopologyStrategy avec factor 3
CREATE KEYSPACE IF NOT EXISTS smartgrid
WITH replication = {
  'class': 'SimpleStrategy',
  'replication_factor': 1
}
AND durable_writes = true;

USE smartgrid;

-- ─── 1.2 : Table mesures_par_capteur ──────────────────────────────────────────
-- Requête cible : "Mesures du capteur X entre T1 et T2"
-- Partition Key : (capteur_id, date_jour)
-- On ajoute date_jour comme bucket pour éviter les hot partitions :
-- sans bucket, un capteur actif 24h/24 accumule des millions de lignes
-- dans une seule partition, ce qui surcharge un seul nœud.
-- Avec le bucket jour, chaque partition = 1 capteur × 1 jour max ~1440 lignes.
-- Clustering Key : timestamp DESC → dernières mesures retournées en premier

CREATE TABLE IF NOT EXISTS mesures_par_capteur (
  capteur_id   UUID,
  date_jour    DATE,
  timestamp    TIMESTAMP,
  wilaya       TEXT,
  commune      TEXT,
  tension_v    FLOAT,
  courant_a    FLOAT,
  puissance_kw FLOAT,
  frequence_hz FLOAT,
  temperature  FLOAT,
  alerte       BOOLEAN,
  code_alerte  TEXT,
  PRIMARY KEY ((capteur_id, date_jour), timestamp)
) WITH CLUSTERING ORDER BY (timestamp DESC)
  AND default_time_to_live = 7776000;

-- ─── 1.3 : Table alertes_par_wilaya ───────────────────────────────────────────
-- Requête cible : "Alertes de la wilaya X le jour Y"
-- Partition Key : (wilaya, date_jour) → toutes les alertes d'une wilaya
-- pour un jour donné sont dans la même partition, accès direct sans scan.
-- Clustering Key : timestamp DESC, capteur_id pour unicité

CREATE TABLE IF NOT EXISTS alertes_par_wilaya (
  wilaya       TEXT,
  date_jour    DATE,
  timestamp    TIMESTAMP,
  capteur_id   UUID,
  code_alerte  TEXT,
  description  TEXT,
  gravite      INT,
  resolue      BOOLEAN,
  PRIMARY KEY ((wilaya, date_jour), timestamp, capteur_id)
) WITH CLUSTERING ORDER BY (timestamp DESC, capteur_id ASC)
  AND default_time_to_live = 31536000;

-- ─── 1.4 : Table agregats_horaires ────────────────────────────────────────────
-- Requête cible : "Consommation moyenne par heure pour le dashboard wilaya"
-- Partition Key : wilaya → toutes les heures d'une wilaya regroupées
-- Clustering Key : date_heure DESC → heures les plus récentes en premier
-- Cette table est pré-calculée côté applicatif à chaque heure

CREATE TABLE IF NOT EXISTS agregats_horaires (
  wilaya            TEXT,
  date_heure        TIMESTAMP,
  nb_capteurs       INT,
  puissance_moy_kw  FLOAT,
  puissance_max_kw  FLOAT,
  puissance_min_kw  FLOAT,
  nb_alertes        INT,
  PRIMARY KEY (wilaya, date_heure)
) WITH CLUSTERING ORDER BY (date_heure DESC)
  AND default_time_to_live = 157680000;

-- Vérification
DESCRIBE TABLES;
