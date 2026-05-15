/**
 * TP2 - Exercice 4 : Index et Optimisation
 */
use("medical_db");

// ─── 4.1 : Créer les index appropriés ────────────────────────────────────────

// Index 1 : Recherche fréquente par wilaya + antécédents
// Composé car les deux champs apparaissent ensemble dans la plupart des filtres
db.patients.createIndex(
  { "adresse.wilaya": 1, antecedents: 1 },
  { name: "idx_wilaya_antecedents" }
);

// Index 2 : Recherche par date de consultation (champ embarqué dans tableau)
// Permet de filtrer et trier efficacement les consultations par date
db.patients.createIndex(
  { "consultations.date": 1 },
  { name: "idx_consultations_date" }
);

// Index 3 : Texte sur diagnostics pour recherche full-text
// Permet d'utiliser $text et $search sur les diagnostics
db.patients.createIndex(
  { "consultations.diagnostic": "text" },
  { name: "idx_text_diagnostic" }
);

// Index 4 : Analyses par patient (pour les $lookup et recherches par patient)
// Indispensable pour éviter un COLLSCAN lors des jointures
db.analyses.createIndex(
  { patient_id: 1 },
  { name: "idx_analyses_patient" }
);

// Index 5 : Index composé sur analyses pour filtres croisés type + patient
db.analyses.createIndex(
  { patient_id: 1, type: 1, date: -1 },
  { name: "idx_analyses_patient_type_date" }
);

// ─── 4.2 : Comparer avec explain() ────────────────────────────────────────────
const requeteTest = {
  "adresse.wilaya": "Alger",
  antecedents: "Diabète type 2"
};

// Pour simuler AVANT index, on force un COLLSCAN avec hint
print("=== AVANT index (COLLSCAN forcé) ===");
const avantIndex = db.patients.find(requeteTest)
  .hint({ $natural: 1 })
  .explain("executionStats");

print("nReturned         :", avantIndex.executionStats.nReturned);
print("totalDocsExamined :", avantIndex.executionStats.totalDocsExamined);
print("executionTimeMillis:", avantIndex.executionStats.executionTimeMillis);
print("stage             :", avantIndex.executionStats.executionStages.stage);

print("\n=== APRÈS index (idx_wilaya_antecedents) ===");
const apresIndex = db.patients.find(requeteTest)
  .hint("idx_wilaya_antecedents")
  .explain("executionStats");

print("nReturned         :", apresIndex.executionStats.nReturned);
print("totalDocsExamined :", apresIndex.executionStats.totalDocsExamined);
print("executionTimeMillis:", apresIndex.executionStats.executionTimeMillis);
print("stage             :", apresIndex.executionStats.executionStages.stage);

// ─── 4.3 : Index composé pour la requête la plus complexe ────────────────────
// Requête complexe : patients diabétiques + HTA + âge > 60 triés par wilaya
// Ordre des champs : antecedents en premier (égalité), wilaya ensuite (tri)
// ESR rule : Equality → Sort → Range
db.patients.createIndex(
  { antecedents: 1, "adresse.wilaya": 1, dateNaissance: 1 },
  { name: "idx_antecedents_wilaya_dob" }
);

print("\n=== Index composé - requête complexe ===");
const requeteComplexe = db.patients.find({
  antecedents: { $all: ["Diabète type 2", "HTA"] },
  dateNaissance: { $lte: new Date(new Date().setFullYear(new Date().getFullYear() - 60)) }
}).sort({ "adresse.wilaya": 1 }).explain("executionStats");

print("nReturned         :", requeteComplexe.executionStats.nReturned);
print("totalDocsExamined :", requeteComplexe.executionStats.totalDocsExamined);
print("executionTimeMillis:", requeteComplexe.executionStats.executionTimeMillis);

// ─── 4.4 : Index TTL pour archivage ───────────────────────────────────────────
// 5 ans = 5 * 365 * 24 * 60 * 60 = 157680000 secondes
// MongoDB supprime automatiquement les documents dont date < now - TTL
db.analyses.createIndex(
  { date: 1 },
  { expireAfterSeconds: 157680000, name: "idx_ttl_analyses_5ans" }
);

print("\n✅ Tous les index créés.");
print("Index existants sur patients :");
printjson(db.patients.getIndexes().map(i => i.name));
print("Index existants sur analyses :");
printjson(db.analyses.getIndexes().map(i => i.name));
