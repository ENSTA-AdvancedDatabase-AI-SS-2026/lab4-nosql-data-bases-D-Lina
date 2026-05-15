// TP4 - Exercice 1 : Création du graphe UniConnect DZ

MATCH (n) DETACH DELETE n;

// ─── 1.1 : Contraintes d'unicité ─────────────────────────────────────────────
CREATE CONSTRAINT etudiant_id IF NOT EXISTS FOR (e:Etudiant) REQUIRE e.id IS UNIQUE;
CREATE CONSTRAINT cours_code IF NOT EXISTS FOR (c:Cours) REQUIRE c.code IS UNIQUE;
CREATE CONSTRAINT competence_nom IF NOT EXISTS FOR (c:Competence) REQUIRE c.nom IS UNIQUE;

// ─── 1.2 : Créer les compétences ──────────────────────────────────────────────
UNWIND [
  {nom: "Python", categorie: "Programmation"},
  {nom: "Java", categorie: "Programmation"},
  {nom: "SQL", categorie: "Bases de Données"},
  {nom: "NoSQL", categorie: "Bases de Données"},
  {nom: "Machine Learning", categorie: "IA"},
  {nom: "Deep Learning", categorie: "IA"},
  {nom: "React", categorie: "Web"},
  {nom: "Docker", categorie: "DevOps"},
  {nom: "Linux", categorie: "Systèmes"},
  {nom: "Réseaux", categorie: "Infrastructure"}
] AS comp
MERGE (:Competence {nom: comp.nom, categorie: comp.categorie});

// ─── 1.3 : Créer les cours ────────────────────────────────────────────────────
UNWIND [
  {code: "INFO401", intitule: "Bases de Données Avancées", credits: 6, dept: "Informatique"},
  {code: "INFO402", intitule: "Intelligence Artificielle", credits: 6, dept: "Informatique"},
  {code: "INFO403", intitule: "Développement Web", credits: 4, dept: "Informatique"},
  {code: "INFO404", intitule: "Systèmes Distribués", credits: 5, dept: "Informatique"},
  {code: "INFO405", intitule: "Cloud Computing", credits: 4, dept: "Informatique"}
] AS cours
MERGE (:Cours {code: cours.code, intitule: cours.intitule,
               credits: cours.credits, departement: cours.dept});

// ─── 1.4 : Créer les clubs ────────────────────────────────────────────────────
UNWIND [
  {nom: "Club IA USTHB", universite: "USTHB", domaine: "Intelligence Artificielle"},
  {nom: "Club Dev UMBB", universite: "UMBB", domaine: "Développement Web"},
  {nom: "Club Cyber USTO", universite: "USTO", domaine: "Cybersécurité"},
  {nom: "Club Robotique UMC", universite: "UMC", domaine: "Robotique"},
  {nom: "Club Data UBMA", universite: "UBMA", domaine: "Data Science"}
] AS club
MERGE (:Club {nom: club.nom, universite: club.universite, domaine: club.domaine});

// ─── 1.5 : Créer les entreprises ─────────────────────────────────────────────
UNWIND [
  {nom: "Sonatrach", secteur: "Énergie", ville: "Alger"},
  {nom: "Djezzy", secteur: "Télécoms", ville: "Alger"},
  {nom: "Ooredoo", secteur: "Télécoms", ville: "Alger"},
  {nom: "Cerist", secteur: "Recherche", ville: "Alger"},
  {nom: "IBM Algérie", secteur: "IT", ville: "Alger"}
] AS ent
MERGE (:Entreprise {nom: ent.nom, secteur: ent.secteur, ville: ent.ville});

// ─── 1.6 : Créer les 50 étudiants ────────────────────────────────────────────
UNWIND [
  {id: "E001", prenom: "Ahmed",    nom: "Bensalem",   universite: "USTHB", filiere: "Informatique",  annee: 3, ville: "Alger"},
  {id: "E002", prenom: "Fatima",   nom: "Ouali",       universite: "USTHB", filiere: "Informatique",  annee: 3, ville: "Alger"},
  {id: "E003", prenom: "Yasmina", nom: "Merad",       universite: "USTHB", filiere: "GL",            annee: 4, ville: "Alger"},
  {id: "E004", prenom: "Karim",   nom: "Hadj Ali",    universite: "USTHB", filiere: "Mathématiques", annee: 2, ville: "Alger"},
  {id: "E005", prenom: "Amina",   nom: "Boukerche",   universite: "USTHB", filiere: "Informatique",  annee: 5, ville: "Blida"},
  {id: "E006", prenom: "Omar",    nom: "Zerrouki",    universite: "UMBB",  filiere: "Informatique",  annee: 3, ville: "Boumerdes"},
  {id: "E007", prenom: "Sara",    nom: "Khelif",      universite: "UMBB",  filiere: "GL",            annee: 4, ville: "Boumerdes"},
  {id: "E008", prenom: "Youcef",  nom: "Tlemcani",    universite: "UMBB",  filiere: "Telecoms",      annee: 3, ville: "Boumerdes"},
  {id: "E009", prenom: "Nadia",   nom: "Ferrahi",     universite: "UMBB",  filiere: "Electronique",  annee: 2, ville: "Boumerdes"},
  {id: "E010", prenom: "Sofiane", nom: "Messaoudi",   universite: "UMBB",  filiere: "Informatique",  annee: 5, ville: "Alger"},
  {id: "E011", prenom: "Imene",   nom: "Chaouch",     universite: "USTO",  filiere: "Informatique",  annee: 3, ville: "Oran"},
  {id: "E012", prenom: "Rachid",  nom: "Bouzid",      universite: "USTO",  filiere: "GL",            annee: 4, ville: "Oran"},
  {id: "E013", prenom: "Meriem",  nom: "Hadjadj",     universite: "USTO",  filiere: "Mathématiques", annee: 2, ville: "Oran"},
  {id: "E014", prenom: "Hamid",   nom: "Lounis",      universite: "USTO",  filiere: "Telecoms",      annee: 3, ville: "Oran"},
  {id: "E015", prenom: "Rania",   nom: "Djoudi",      universite: "USTO",  filiere: "Electronique",  annee: 5, ville: "Oran"},
  {id: "E016", prenom: "Bilal",   nom: "Amrani",      universite: "UMC",   filiere: "Informatique",  annee: 3, ville: "Constantine"},
  {id: "E017", prenom: "Houria",  nom: "Kebir",       universite: "UMC",   filiere: "GL",            annee: 4, ville: "Constantine"},
  {id: "E018", prenom: "Walid",   nom: "Belmahi",     universite: "UMC",   filiere: "Mathématiques", annee: 2, ville: "Constantine"},
  {id: "E019", prenom: "Asma",    nom: "Larbi",       universite: "UMC",   filiere: "Telecoms",      annee: 3, ville: "Constantine"},
  {id: "E020", prenom: "Nassim",  nom: "Benhamida",   universite: "UMC",   filiere: "Electronique",  annee: 5, ville: "Constantine"},
  {id: "E021", prenom: "Lina",    nom: "Saadi",       universite: "UBMA",  filiere: "Informatique",  annee: 3, ville: "Annaba"},
  {id: "E022", prenom: "Djamel",  nom: "Hamdi",       universite: "UBMA",  filiere: "GL",            annee: 4, ville: "Annaba"},
  {id: "E023", prenom: "Sabrina", nom: "Benali",      universite: "UBMA",  filiere: "Mathématiques", annee: 2, ville: "Annaba"},
  {id: "E024", prenom: "Ryad",    nom: "Mansouri",    universite: "UBMA",  filiere: "Telecoms",      annee: 3, ville: "Annaba"},
  {id: "E025", prenom: "Cylia",   nom: "Belaidi",     universite: "UBMA",  filiere: "Electronique",  annee: 5, ville: "Annaba"},
  {id: "E026", prenom: "Mehdi",   nom: "Boudiaf",     universite: "USTHB", filiere: "GL",            annee: 2, ville: "Alger"},
  {id: "E027", prenom: "Wafa",    nom: "Chibani",     universite: "USTHB", filiere: "Informatique",  annee: 4, ville: "Alger"},
  {id: "E028", prenom: "Amine",   nom: "Haddar",      universite: "UMBB",  filiere: "Informatique",  annee: 3, ville: "Boumerdes"},
  {id: "E029", prenom: "Sonia",   nom: "Rahmani",     universite: "UMBB",  filiere: "GL",            annee: 2, ville: "Boumerdes"},
  {id: "E030", prenom: "Fares",   nom: "Belkacem",    universite: "USTO",  filiere: "Informatique",  annee: 4, ville: "Oran"},
  {id: "E031", prenom: "Ilyes",   nom: "Aouadi",      universite: "USTHB", filiere: "Informatique",  annee: 3, ville: "Alger"},
  {id: "E032", prenom: "Chaima",  nom: "Boudissa",    universite: "USTHB", filiere: "Telecoms",      annee: 4, ville: "Alger"},
  {id: "E033", prenom: "Zakaria", nom: "Slimani",     universite: "UMBB",  filiere: "GL",            annee: 3, ville: "Boumerdes"},
  {id: "E034", prenom: "Yasmine", nom: "Derbal",      universite: "UMC",   filiere: "Informatique",  annee: 2, ville: "Constantine"},
  {id: "E035", prenom: "Tarek",   nom: "Ghali",       universite: "UBMA",  filiere: "Informatique",  annee: 3, ville: "Annaba"},
  {id: "E036", prenom: "Hanane",  nom: "Moussaoui",   universite: "USTO",  filiere: "Mathématiques", annee: 4, ville: "Oran"},
  {id: "E037", prenom: "Lotfi",   nom: "Zidane",      universite: "USTHB", filiere: "Electronique",  annee: 3, ville: "Alger"},
  {id: "E038", prenom: "Narimane",nom: "Kaci",        universite: "UMBB",  filiere: "Informatique",  annee: 5, ville: "Boumerdes"},
  {id: "E039", prenom: "Ayoub",   nom: "Meziane",     universite: "UMC",   filiere: "GL",            annee: 3, ville: "Constantine"},
  {id: "E040", prenom: "Selma",   nom: "Oukil",       universite: "UBMA",  filiere: "Informatique",  annee: 4, ville: "Annaba"},
  {id: "E041", prenom: "Islem",   nom: "Brahimi",     universite: "USTHB", filiere: "GL",            annee: 2, ville: "Alger"},
  {id: "E042", prenom: "Ghiles",  nom: "Ait Ouali",   universite: "USTHB", filiere: "Informatique",  annee: 4, ville: "Tizi Ouzou"},
  {id: "E043", prenom: "Roumaissa",nom:"Ferhat",      universite: "UMBB",  filiere: "Telecoms",      annee: 3, ville: "Boumerdes"},
  {id: "E044", prenom: "Oussama", nom: "Belaid",      universite: "USTO",  filiere: "Informatique",  annee: 5, ville: "Oran"},
  {id: "E045", prenom: "Dounia",  nom: "Taleb",       universite: "UMC",   filiere: "Mathématiques", annee: 3, ville: "Constantine"},
  {id: "E046", prenom: "Rédha",   nom: "Haddad",      universite: "UBMA",  filiere: "GL",            annee: 2, ville: "Annaba"},
  {id: "E047", prenom: "Tinhinane",nom:"Mazouz",      universite: "USTHB", filiere: "Informatique",  annee: 3, ville: "Alger"},
  {id: "E048", prenom: "Abdelkrim",nom:"Bougherara",  universite: "UMBB",  filiere: "Electronique",  annee: 4, ville: "Boumerdes"},
  {id: "E049", prenom: "Lydia",   nom: "Yahi",        universite: "USTO",  filiere: "GL",            annee: 3, ville: "Oran"},
  {id: "E050", prenom: "Hamza",   nom: "Cherif",      universite: "UMC",   filiere: "Informatique",  annee: 5, ville: "Constantine"}
] AS data
MERGE (e:Etudiant {id: data.id})
SET e += data;

// ─── 1.7 : Relations CONNAIT ─────────────────────────────────────────────────
// Réseau connexe : chaîne de base + connexions inter-universités
UNWIND [
  ["E001","E002"], ["E001","E003"], ["E001","E004"], ["E002","E005"],
  ["E002","E006"], ["E003","E007"], ["E004","E008"], ["E005","E009"],
  ["E006","E010"], ["E006","E011"], ["E007","E012"], ["E008","E013"],
  ["E009","E014"], ["E010","E015"], ["E011","E016"], ["E012","E017"],
  ["E013","E018"], ["E014","E019"], ["E015","E020"], ["E016","E021"],
  ["E017","E022"], ["E018","E023"], ["E019","E024"], ["E020","E025"],
  ["E021","E026"], ["E022","E027"], ["E023","E028"], ["E024","E029"],
  ["E025","E030"], ["E026","E031"], ["E027","E032"], ["E028","E033"],
  ["E029","E034"], ["E030","E035"], ["E031","E036"], ["E032","E037"],
  ["E033","E038"], ["E034","E039"], ["E035","E040"], ["E036","E041"],
  ["E037","E042"], ["E038","E043"], ["E039","E044"], ["E040","E045"],
  ["E041","E046"], ["E042","E047"], ["E043","E048"], ["E044","E049"],
  ["E045","E050"], ["E046","E001"], ["E047","E006"], ["E048","E011"],
  ["E049","E016"], ["E050","E021"], ["E001","E031"], ["E002","E032"],
  ["E003","E033"], ["E011","E041"], ["E021","E001"], ["E016","E006"]
] AS lien
MATCH (a:Etudiant {id: lien[0]}), (b:Etudiant {id: lien[1]})
MERGE (a)-[:CONNAIT {depuis: 2023, contexte: "université"}]->(b)
MERGE (b)-[:CONNAIT {depuis: 2023, contexte: "université"}]->(a);

// ─── 1.8 : Relations SUIT ────────────────────────────────────────────────────
UNWIND [
  ["E001","INFO401",15.5], ["E001","INFO402",14.0], ["E002","INFO401",16.0],
  ["E002","INFO403",13.5], ["E003","INFO402",17.0], ["E003","INFO404",15.0],
  ["E004","INFO401",12.0], ["E004","INFO403",14.5], ["E005","INFO402",18.0],
  ["E005","INFO405",16.5], ["E006","INFO401",13.0], ["E006","INFO404",15.5],
  ["E007","INFO403",14.0], ["E007","INFO402",16.0], ["E008","INFO405",12.5],
  ["E009","INFO401",11.0], ["E010","INFO402",15.0], ["E011","INFO403",16.5],
  ["E012","INFO404",14.0], ["E013","INFO401",13.5], ["E014","INFO402",17.5],
  ["E015","INFO405",15.0], ["E016","INFO401",16.0], ["E017","INFO403",14.5],
  ["E018","INFO402",13.0], ["E019","INFO404",15.5], ["E020","INFO405",18.0],
  ["E021","INFO401",14.0], ["E022","INFO402",15.0], ["E023","INFO403",16.0],
  ["E024","INFO404",13.5], ["E025","INFO405",17.0], ["E026","INFO401",12.5],
  ["E027","INFO402",14.0], ["E028","INFO403",15.5], ["E029","INFO404",16.0],
  ["E030","INFO401",13.0], ["E031","INFO402",17.0], ["E032","INFO403",14.5],
  ["E033","INFO404",15.0], ["E034","INFO405",16.5], ["E035","INFO401",14.0],
  ["E036","INFO402",13.5], ["E037","INFO403",15.0], ["E038","INFO404",16.0],
  ["E039","INFO405",17.5], ["E040","INFO401",15.5], ["E041","INFO402",14.0],
  ["E042","INFO403",16.0], ["E043","INFO404",13.0], ["E044","INFO405",15.0]
] AS s
MATCH (e:Etudiant {id: s[0]}), (c:Cours {code: s[1]})
MERGE (e)-[:SUIT {semestre: "S1-2024", note: s[2]}]->(c);

// ─── 1.9 : Relations MAITRISE ────────────────────────────────────────────────
UNWIND [
  ["E001","Python","avancé"],    ["E001","SQL","intermédiaire"],
  ["E002","Java","avancé"],      ["E002","React","intermédiaire"],
  ["E003","Machine Learning","avancé"], ["E003","Python","avancé"],
  ["E004","SQL","avancé"],       ["E004","NoSQL","intermédiaire"],
  ["E005","Deep Learning","avancé"], ["E005","Python","avancé"],
  ["E006","Docker","intermédiaire"], ["E006","Linux","avancé"],
  ["E007","React","avancé"],     ["E007","Java","intermédiaire"],
  ["E008","Réseaux","avancé"],   ["E009","SQL","débutant"],
  ["E010","Machine Learning","intermédiaire"], ["E011","Python","intermédiaire"],
  ["E012","NoSQL","avancé"],     ["E013","SQL","intermédiaire"],
  ["E014","Deep Learning","intermédiaire"], ["E015","Docker","avancé"],
  ["E016","Python","avancé"],    ["E017","React","avancé"],
  ["E018","Java","intermédiaire"], ["E019","Réseaux","avancé"],
  ["E020","Linux","avancé"],     ["E021","SQL","avancé"],
  ["E022","Machine Learning","intermédiaire"], ["E023","Python","débutant"],
  ["E024","NoSQL","avancé"],     ["E025","Deep Learning","avancé"],
  ["E026","Docker","intermédiaire"], ["E027","React","intermédiaire"],
  ["E028","Java","avancé"],      ["E029","SQL","intermédiaire"],
  ["E030","Python","avancé"],    ["E031","Machine Learning","avancé"],
  ["E032","Réseaux","intermédiaire"], ["E033","Linux","avancé"],
  ["E034","NoSQL","intermédiaire"], ["E035","SQL","avancé"],
  ["E036","Deep Learning","débutant"], ["E037","Docker","avancé"],
  ["E038","Python","avancé"],    ["E039","React","intermédiaire"],
  ["E040","Java","avancé"],      ["E041","Machine Learning","intermédiaire"],
  ["E042","SQL","avancé"],       ["E043","NoSQL","intermédiaire"],
  ["E044","Linux","avancé"],     ["E045","Python","intermédiaire"],
  ["E046","Réseaux","avancé"],   ["E047","Docker","intermédiaire"],
  ["E048","React","avancé"],     ["E049","Java","intermédiaire"],
  ["E050","Machine Learning","avancé"]
] AS m
MATCH (e:Etudiant {id: m[0]}), (c:Competence {nom: m[1]})
MERGE (e)-[:MAITRISE {niveau: m[2]}]->(c);

// ─── 1.10 : Relations MEMBRE_DE ──────────────────────────────────────────────
UNWIND [
  ["E001","Club IA USTHB","membre"],   ["E003","Club IA USTHB","président"],
  ["E005","Club IA USTHB","membre"],   ["E027","Club IA USTHB","membre"],
  ["E006","Club Dev UMBB","membre"],   ["E007","Club Dev UMBB","président"],
  ["E028","Club Dev UMBB","membre"],   ["E033","Club Dev UMBB","membre"],
  ["E011","Club Cyber USTO","membre"], ["E012","Club Cyber USTO","président"],
  ["E030","Club Cyber USTO","membre"], ["E044","Club Cyber USTO","membre"],
  ["E016","Club Robotique UMC","membre"], ["E017","Club Robotique UMC","président"],
  ["E039","Club Robotique UMC","membre"], ["E050","Club Robotique UMC","membre"],
  ["E021","Club Data UBMA","membre"],  ["E022","Club Data UBMA","président"],
  ["E040","Club Data UBMA","membre"],  ["E046","Club Data UBMA","membre"]
] AS mb
MATCH (e:Etudiant {id: mb[0]}), (cl:Club {nom: mb[1]})
MERGE (e)-[:MEMBRE_DE {role: mb[2]}]->(cl);

// ─── 1.11 : Relations A_STAGE_CHEZ ───────────────────────────────────────────
UNWIND [
  ["E005","Sonatrach",2023,6],  ["E010","Djezzy",2023,4],
  ["E015","Ooredoo",2022,6],    ["E020","Cerist",2023,3],
  ["E025","IBM Algérie",2023,6],["E038","Sonatrach",2024,4],
  ["E044","Djezzy",2023,6],     ["E050","IBM Algérie",2024,3]
] AS st
MATCH (e:Etudiant {id: st[0]}), (ent:Entreprise {nom: st[1]})
MERGE (e)-[:A_STAGE_CHEZ {annee: st[2], duree_mois: st[3]}]->(ent);

// ─── Vérification ─────────────────────────────────────────────────────────────
MATCH (n) RETURN labels(n)[0] AS type, count(n) AS total ORDER BY total DESC;
MATCH ()-[r]->() RETURN type(r) AS relation, count(r) AS total ORDER BY total DESC;
