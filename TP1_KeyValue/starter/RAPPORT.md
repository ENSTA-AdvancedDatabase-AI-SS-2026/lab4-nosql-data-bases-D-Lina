# RAPPORT TP1 — Redis : Système de Cache E-commerce
## ShopFast — Plateforme E-commerce Algérienne

---

## 1. Comparaison de performance : Cache HIT vs MISS

| Scénario | Temps moyen |
|----------|-------------|
| Cache MISS | ~2000ms |
| Cache HIT | ~1ms |
| Gain | ×2000 |

Le premier appel déclenche un MISS : Redis ne contient pas encore la donnée, la fonction interroge la base simulée qui introduit 2 secondes de délai. Le résultat est sérialisé en JSON et stocké avec un TTL de 600 secondes. Les appels suivants sont des HITs retournés en moins de 2ms directement depuis la mémoire.

---

## 2. Justification des choix de modélisation

**Produits → Hash (`HSET product:{id}`)**
Idéal pour un objet structuré à plusieurs champs. Permet de récupérer un champ précis sans désérialiser tout l'objet, contrairement à un String JSON.

**Panier → Hash (`HINCRBY cart:{user_id}`)**
Chaque champ est un `product_id`, la valeur est la quantité. `HINCRBY` incrémente atomiquement sans risque de race condition.

**Historique → List (`LPUSH` + `LTRIM`)**
`LPUSH` insère en tête en O(1). `LTRIM` maintient automatiquement la taille à `max_history` éléments sans intervention manuelle.

**Catégories → Set (`SADD` + `SINTER`)**
Le Set garantit l'unicité. `SINTER` effectue l'intersection de plusieurs catégories en une seule commande côté serveur Redis.

**Classement → Sorted Set (`ZINCRBY` + `ZREVRANGE`)**
Le tri par score est maintenu automatiquement. `ZINCRBY` incrémente atomiquement, `ZREVRANGE` retourne les meilleurs en O(log N).

**Cache produits → String JSON (`SETEX`)**
Stockage du produit sérialisé avec TTL défini en une commande atomique.

---

## 3. Réponses aux questions de réflexion

**Q1 : Que se passe-t-il si Redis redémarre ?**

Sans persistance, toutes les données en mémoire sont perdues. Dans notre configuration, deux mécanismes sont activés : les snapshots RDB périodiques (`save 900 1`, `save 300 10`) et le journal AOF (`appendonly yes`). Avec AOF, Redis rejoue les opérations au redémarrage et reconstruit l'état. Le cache se repeuplera progressivement via le pattern Cache-Aside lors des premiers accès (tous des MISS).

**Q2 : Comment gérer la cohérence cache/DB en cas d'accès concurrent ?**

Deux requêtes simultanées peuvent détecter un MISS et toutes deux interroger la DB (thundering herd). Solutions : verrouillage distribué avec `SET key value NX EX timeout` pour qu'un seul processus peuple le cache, ou invalidation systématique via `invalidate_product_cache()` à chaque mise à jour en base.

**Q3 : Quand un TTL trop court est-il problématique ?**

Un TTL trop court provoque un taux de MISS élevé qui annule le bénéfice du cache et surcharge la base. Il faut calibrer selon la fréquence de mise à jour : données statiques (fiche produit) → TTL long (600s+), données dynamiques (stock temps réel) → TTL court (10-30s).
