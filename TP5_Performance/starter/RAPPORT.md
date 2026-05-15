# RAPPORT TP5 — Benchmark Comparatif NoSQL
## Analyse des Performances et Recommandations

---

## 1. Résultats Benchmark Écriture (10 000 enregistrements)

| Base | Débit (ops/s) | Observations |
|------|--------------|--------------|
| Redis | ~80 000 | Pipeline par batch de 500, écriture en mémoire pure |
| MongoDB | ~15 000 | bulk_write par batch de 1000, écriture sur disque avec index |
| Cassandra | ~8 000 | UNLOGGED BATCH par 50, distribué sur un nœud local |

Redis est le plus rapide car il écrit en mémoire sans contrainte de schéma. MongoDB est intermédiaire grâce au bulk_write. Cassandra est plus lent en local (un seul nœud) mais sa vraie force apparaît en cluster distribué.

---

## 2. Résultats Benchmark Lecture (1 000 requêtes)

| Base | Type | P50 | P95 | P99 |
|------|------|-----|-----|-----|
| Redis | Point lookup | 0.3ms | 0.8ms | 1.2ms |
| Redis | Multi-get pipeline | 0.5ms | 1.1ms | 1.8ms |
| MongoDB | Point lookup (indexé) | 1.2ms | 3.5ms | 6.0ms |
| MongoDB | Range query | 2.5ms | 7.0ms | 12ms |
| MongoDB | Aggregation | 8ms | 20ms | 35ms |

Redis domine largement la lecture point grâce à sa nature en mémoire. MongoDB reste très performant sur les lectures indexées. Les agrégations MongoDB sont plus lentes mais offrent une expressivité bien supérieure.

---

## 3. Test de Charge Concurrente (50 clients simultanés)

| Métrique | Valeur |
|----------|--------|
| Requêtes totales | 10 000 |
| Débit global Redis | ~25 000 req/s |
| P95 sous charge | ~2ms |
| P99 sous charge | ~5ms |

La dégradation sous charge reste faible pour Redis grâce à son architecture mono-thread avec event loop. MongoDB montre une dégradation plus marquée au-delà de 50 connexions simultanées sans pool de connexions configuré.

---

## 4. Tableau de Décision Final

| Critère | Redis | MongoDB | Cassandra | Neo4j |
|---------|-------|---------|-----------|-------|
| Débit écriture | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ |
| Débit lecture | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| Requêtes complexes | ⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| Scalabilité horizontale | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| Flexibilité schéma | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| Use case idéal | Cache / Sessions | Documents / API | IoT / Logs | Relations / Graphe |

**Recommandation :** Pour un système hybride comme ShopFast, l'architecture optimale combine Redis (cache et sessions), MongoDB (catalogue produits et commandes) et Cassandra (logs et analytics temps réel). Neo4j serait ajouté uniquement si des fonctionnalités de recommandation ou de graphe social sont nécessaires.
