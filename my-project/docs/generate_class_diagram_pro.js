const fs = require('fs');

// ============================================================
//  Générateur Diagramme de Classe Globale — StageFlow
//  Style : Professionnel, inspiré du style UML classique
//  Orange/Amber headers, clean white body, proper UML
// ============================================================

let id = 2;
const nid = () => String(id++);
const cells = [];

// Escape XML entities
function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function addCell(value, style, x, y, w, h, parent = '1') {
  const i = nid();
  cells.push(`<mxCell id="${i}" value="${esc(value)}" style="${style}" vertex="1" parent="${parent}"><mxGeometry x="${x}" y="${y}" width="${w}" height="${h}" as="geometry"/></mxCell>`);
  return i;
}

function addEdge(src, tgt, style, label = '', exitX, exitY, entryX, entryY) {
  const i = nid();
  let geo = '<mxGeometry relative="1" as="geometry"/>';
  if (exitX !== undefined) {
    geo = `<mxGeometry relative="1" as="geometry"><Array as="points"/></mxGeometry>`;
  }
  let extra = '';
  if (exitX !== undefined) extra += `exitX=${exitX};exitY=${exitY};entryX=${entryX};entryY=${entryY};exitDx=0;exitDy=0;entryDx=0;entryDy=0;`;
  cells.push(`<mxCell id="${i}" value="${esc(label)}" style="${style}${extra}" edge="1" source="${src}" target="${tgt}" parent="1">${geo}</mxCell>`);
  return i;
}

// ============================================================
//  STYLES — Professional Orange UML Theme
// ============================================================

// Class title bar — orange/amber gradient
const titleStyle = 'swimlane;fontStyle=1;align=center;startSize=26;html=1;collapsible=0;fillColor=#F5A623;strokeColor=#D4881E;strokeWidth=2;fontSize=12;fontColor=#FFFFFF;fontFamily=Segoe UI;rounded=0;arcSize=0;shadow=0;swimlaneLine=1;';

// Attributes section
const attrStyle = 'text;strokeColor=none;fillColor=#FFFFFF;align=left;verticalAlign=top;spacingLeft=8;spacingRight=6;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontColor=#333333;fontSize=10;fontFamily=Segoe UI;html=1;';

// Separator line
const lineStyle = 'line;strokeWidth=1;fillColor=none;align=left;verticalAlign=middle;spacingTop=-1;spacingLeft=3;spacingRight=3;rotatable=0;labelPosition=left;points=[];portConstraint=eastwest;strokeColor=#D4881E;html=1;';

// Methods section  
const methStyle = 'text;strokeColor=none;fillColor=#FFFFFF;align=left;verticalAlign=top;spacingLeft=8;spacingRight=6;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontColor=#333333;fontSize=10;fontFamily=Segoe UI;html=1;';

// Association styles
const assocLine = 'endArrow=none;html=1;strokeColor=#555555;strokeWidth=1.5;fontSize=9;fontColor=#444444;fontFamily=Segoe UI;jumpStyle=arc;jumpSize=6;';
const compLine = 'endArrow=diamondThin;endFill=1;endSize=10;html=1;strokeColor=#555555;strokeWidth=1.5;fontSize=9;fontColor=#444444;fontFamily=Segoe UI;jumpStyle=arc;jumpSize=6;';
const inheritLine = 'endArrow=block;endFill=0;endSize=12;html=1;strokeColor=#555555;strokeWidth=1.5;fontSize=9;fontColor=#444444;fontFamily=Segoe UI;jumpStyle=arc;jumpSize=6;';

// ============================================================
//  HELPER — addClass
// ============================================================
function addClass(name, attrs, methods, x, y, w) {
  const titleH = 26;
  const lineH = 8;
  const linePerAttr = 16;
  const linePerMeth = 16;
  const attrH = attrs.length * linePerAttr + 10;
  const methH = methods.length > 0 ? methods.length * linePerMeth + 10 : 0;
  const totalH = titleH + attrH + (methods.length > 0 ? lineH : 0) + methH;

  const cid = addCell(name, titleStyle, x, y, w, totalH);
  const aid = addCell(attrs.join('<br>'), attrStyle, 0, titleH, w, attrH, cid);
  
  let mid = null;
  if (methods.length > 0) {
    addCell('', lineStyle, 0, titleH + attrH, w, lineH, cid);
    mid = addCell(methods.join('<br>'), methStyle, 0, titleH + attrH + lineH, w, methH, cid);
  }

  return { id: cid, attrId: aid, methId: mid, x, y, w, h: totalH };
}

// ============================================================
//  CLASSES LAYOUT (Optimized for readability)
// ============================================================

// ROW 1 — Top row (Auth & Org)
const utilisateur = addClass('Utilisateur', [
  '- id : Integer «PK»',
  '- email : String «unique»',
  '- password_hash : String',
  '- nom : String',
  '- prenom : String',
  '- role : Enum',
  '- telephone : String',
  '- entity : Enum {GIAS, CSM}',
  '- departement_id : Integer «FK»',
  '- is_active : Boolean',
  '- last_login : DateTime',
], [
  '+ validatePassword() : Boolean',
  '+ getFullName() : String',
  '+ hasRole(role) : Boolean',
  '+ toPublicJSON() : Object',
], 620, 20, 270);

const admin = addClass('Admin', [
  '- id : Integer «PK»',
  '- utilisateur_id : Integer «FK»',
  '- poste : String',
  '- service : String',
  '- permissions_level : Integer',
], [], 980, 20, 230);

const departement = addClass('Departement', [
  '- id : Integer «PK»',
  '- nom : String',
  '- code : String «unique»',
  '- description : Text',
  '- responsable_id : Integer «FK»',
  '- parent_id : Integer «FK»',
  '- entity : Enum {GIAS, CSM}',
  '- capacite_accueil : Integer',
  '- est_actif : Boolean',
], [
  '+ deactivate() : void',
  '+ activate() : void',
], 290, 20, 260);

const passwordReset = addClass('PasswordReset', [
  '- id : Integer «PK»',
  '- user_id : Integer «FK»',
  '- token_hash : String',
  '- expires_at : DateTime',
  '- used_at : DateTime',
], [
  '+ isValid() : Boolean',
  '+ createToken() : Object',
], 1280, 20, 230);

const loginAttempt = addClass('LoginAttempt', [
  '- id : Integer «PK»',
  '- email : String',
  '- ip_address : String',
  '- success : Boolean',
  '- failure_reason : String',
], [
  '+ record(data) : LoginAttempt',
], 1280, 220, 230);

// ROW 2 — Middle row (Stage & Suivi)
const stagiaire = addClass('Stagiaire', [
  '- id : Integer «PK»',
  '- utilisateur_id : Integer «FK»',
  '- etablissement : String',
  '- filiere : String',
  '- niveau_etude : String',
  '- departement_id : Integer «FK»',
  '- tuteur_id : Integer «FK»',
  '- date_demarrage : Date',
  '- date_fin : Date',
  '- entity : Enum {GIAS, CSM}',
  '- statut : Enum {actif, termine}',
], [
  '+ archiver(raison) : void',
  '+ terminer() : void',
  '+ reactiver() : void',
], 620, 380, 270);

const candidature = addClass('Candidature', [
  '- id : Integer «PK»',
  '- nom : String',
  '- prenom : String',
  '- email : String',
  '- etablissement : String',
  '- filiere : String',
  '- departement_souhaite : Integer «FK»',
  '- type_stage : Enum',
  '- cv_url : String',
  '- statut : Enum',
  '- numero_suivi : String «unique»',
  '- score_matching : Integer',
], [
  '+ accepter() : void',
  '+ refuser() : void',
  '+ traiter() : void',
], 20, 380, 260);

const presence = addClass('Presence', [
  '- id : Integer «PK»',
  '- stage_id : Integer «FK»',
  '- date : Date',
  '- statut : Enum {P, AJ, ANJ}',
  '- heure_entree : Time',
  '- heure_sortie : Time',
  '- justificatif : String',
  '- valide : Boolean',
  '- valide_par : Integer «FK»',
], [
  '+ getHeuresEffectuees() : Float',
  '+ valider(userId) : void',
], 310, 380, 250);

const evaluation = addClass('Evaluation', [
  '- id : Integer «PK»',
  '- stage_id : Integer «FK»',
  '- tuteur_id : Integer «FK»',
  '- type : Enum {INTEGRATION, MI_PARCOURS, FINALE}',
  '- note_technique : Decimal',
  '- note_prof : Decimal',
  '- note_com : Decimal',
  '- note_totale : Decimal',
  '- mention : String',
  '- statut : Enum',
], [
  '+ calculerNote() : Object',
  '+ getMention() : String',
], 960, 380, 270);

const stagArchive = addClass('StagiaireArchive', [
  '- id : Integer «PK»',
  '- original_id : Integer',
  '- utilisateur_id : Integer «FK»',
  '- departement_id : Integer «FK»',
  '- date_archive : Date',
  '- archived_at : DateTime',
  '- retention_end_date : Date',
], [], 1280, 420, 230);

// ROW 3 — Bottom row (Documents & Communication)
const convention = addClass('Convention', [
  '- id : Integer «PK»',
  '- candidature_id : Integer «FK»',
  '- numero : String «unique»',
  '- fichier_genere : String',
  '- fichier_signe : String',
  '- statut : Enum',
  '- date_generation : DateTime',
  '- date_signature : DateTime',
  '- archive : Boolean',
], [
  '+ signer() : void',
  '+ archiver() : void',
], 20, 750, 250);

const document_ = addClass('Document', [
  '- id : Integer «PK»',
  '- stage_id : Integer «FK»',
  '- type : Enum {ATTESTATION, PRESENCE, RAPPORT}',
  '- fichier_path : String',
  '- fichier_nom : String',
  '- taille_fichier : Integer',
  '- genere_par : Integer «FK»',
  '- archive : Boolean',
], [
  '+ programmerArchivage() : void',
], 310, 750, 250);

const message = addClass('Message', [
  '- id : Integer «PK»',
  '- expediteur_id : Integer «FK»',
  '- destinataire_id : Integer «FK»',
  '- stage_id : Integer «FK»',
  '- sujet : String',
  '- contenu : Text',
  '- lu : Boolean',
  '- piece_jointe_nom : String',
], [], 620, 750, 260);

const notification = addClass('Notification', [
  '- id : Integer «PK»',
  '- utilisateur_id : Integer «FK»',
  '- titre : String',
  '- message : Text',
  '- type : Enum',
  '- lien : String',
  '- lue : Boolean',
  '- donnees_extra : JSON',
], [], 940, 750, 250);

const auditLog = addClass('AuditLog', [
  '- id : Integer «PK»',
  '- user_id : Integer «FK»',
  '- action : String',
  '- ip_address : String',
  '- details : JSON',
  '- resource_type : String',
  '- resource_id : Integer',
], [
  '+ log(data) : AuditLog',
  '+ getUserLogs() : List',
], 1240, 750, 250);


// ============================================================
//  ASSOCIATIONS
// ============================================================

// --- Utilisateur ↔ Admin (1 — 0..1) ---
addEdge(utilisateur.id, admin.id, assocLine, '1                    0..1');

// --- Utilisateur ↔ PasswordReset (1 — 0..*) ---
addEdge(utilisateur.id, passwordReset.id, assocLine, '1          0..*');

// --- Utilisateur ↔ Departement (0..* — 0..1) ---
addEdge(utilisateur.id, departement.id, assocLine, '0..*          0..1');

// --- Utilisateur ↔ Stagiaire (1 — 0..*) ---
addEdge(utilisateur.id, stagiaire.id, compLine, '1       0..*');

// --- Stagiaire ↔ Departement (0..* — 0..1) ---
addEdge(stagiaire.id, departement.id, assocLine, '0..*          0..1');

// --- Stagiaire ↔ Presence (1 — 0..*) ---
addEdge(stagiaire.id, presence.id, compLine, '1       0..*');

// --- Stagiaire ↔ Evaluation (1 — 0..*) ---
addEdge(stagiaire.id, evaluation.id, compLine, '1          0..*');

// --- Stagiaire ↔ Document (1 — 0..*) ---
addEdge(stagiaire.id, document_.id, compLine, '1       0..*');

// --- Stagiaire ↔ Message (1 — 0..*) ---
addEdge(stagiaire.id, message.id, assocLine, '1       0..*');

// --- Stagiaire ↔ StagiaireArchive ---
addEdge(stagiaire.id, stagArchive.id, inheritLine, '«archive»');

// --- Candidature ↔ Departement (0..* — 0..1) ---
addEdge(candidature.id, departement.id, assocLine, '0..*         0..1');

// --- Convention ↔ Candidature (0..1 — 1) ---
addEdge(convention.id, candidature.id, assocLine, '0..1          1');

// --- Evaluation ↔ Utilisateur (tuteur) ---
addEdge(evaluation.id, utilisateur.id, assocLine, '0..*       1  évalué par');

// --- Notification ↔ Utilisateur ---
addEdge(notification.id, utilisateur.id, assocLine, '0..*       1');

// --- Message ↔ Utilisateur (expediteur) ---
addEdge(message.id, utilisateur.id, assocLine, '0..*       1  envoyé par');

// --- AuditLog ↔ Utilisateur ---
addEdge(auditLog.id, utilisateur.id, assocLine, '0..*       0..1');

// --- Document ↔ Utilisateur (generateur) ---
addEdge(document_.id, utilisateur.id, assocLine, '0..*       0..1  généré par');

// --- Presence ↔ Utilisateur (validateur) ---
addEdge(presence.id, utilisateur.id, assocLine, '0..*       0..1  validée par');


// ============================================================
//  GENERATE XML
// ============================================================

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="app.diagrams.net" type="device">
  <diagram name="Diagramme de Classe Globale — StageFlow" id="cl_pro_1">
    <mxGraphModel dx="2000" dy="1400" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="0" pageScale="1" pageWidth="2200" pageHeight="1400" math="0" shadow="0" background="#FFFFFF">
      <root>
        <mxCell id="0"/>
        <mxCell id="1" parent="0"/>
        ${cells.join('\n        ')}
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;

// Output path
const outDir = __dirname;
const outFile = require('path').join(outDir, 'diagramme_classe_globale_pro.drawio');
fs.writeFileSync(outFile, xml, 'utf8');
console.log(`✅ Diagramme de classe professionnel généré : ${outFile}`);
console.log(`   → Ouvrir avec draw.io (app.diagrams.net)`);
