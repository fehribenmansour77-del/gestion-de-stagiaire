const fs = require('fs');

// ============================================================
//  Générateur Diagramme de Classe Simplifié — StageFlow
//  Focus uniquement sur les 8 classes métiers principales
//  Couleur: Orange/Amber chaleureux, mise en page aérée
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

function addEdge(src, tgt, style, label = '') {
  const i = nid();
  cells.push(`<mxCell id="${i}" value="${esc(label)}" style="${style}" edge="1" source="${src}" target="${tgt}" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>`);
  return i;
}

// ============================================================
//  STYLES — Orange / Amber Modern UML Theme
// ============================================================
const titleStyle = 'swimlane;fontStyle=1;align=center;startSize=28;html=1;collapsible=0;fillColor=#F5A623;strokeColor=#D4881E;strokeWidth=2;fontSize=12;fontColor=#FFFFFF;fontFamily=Segoe UI;rounded=1;arcSize=8;shadow=0;swimlaneLine=1;';
const attrStyle = 'text;strokeColor=none;fillColor=#FFFFFF;align=left;verticalAlign=top;spacingLeft=8;spacingRight=6;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontColor=#333333;fontSize=10;fontFamily=Segoe UI;html=1;';
const lineStyle = 'line;strokeWidth=1;fillColor=none;align=left;verticalAlign=middle;spacingTop=-1;spacingLeft=3;spacingRight=3;rotatable=0;labelPosition=left;points=[];portConstraint=eastwest;strokeColor=#D4881E;html=1;';
const methStyle = 'text;strokeColor=none;fillColor=#FFFFFF;align=left;verticalAlign=top;spacingLeft=8;spacingRight=6;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontColor=#333333;fontSize=10;fontFamily=Segoe UI;html=1;';

const assocLine = 'endArrow=none;html=1;strokeColor=#555555;strokeWidth=1.5;fontSize=10;fontColor=#444444;fontFamily=Segoe UI;jumpStyle=arc;jumpSize=6;';
const compLine = 'endArrow=diamondThin;endFill=1;endSize=10;html=1;strokeColor=#555555;strokeWidth=1.5;fontSize=10;fontColor=#444444;fontFamily=Segoe UI;jumpStyle=arc;jumpSize=6;';

function addClass(name, attrs, methods, x, y, w) {
  const titleH = 28;
  const lineH = 8;
  const attrH = attrs.length * 16 + 10;
  const methH = methods.length > 0 ? methods.length * 16 + 10 : 0;
  const totalH = titleH + attrH + (methods.length > 0 ? lineH : 0) + methH;

  const cid = addCell(name, titleStyle, x, y, w, totalH);
  addCell(attrs.join('<br>'), attrStyle, 0, titleH, w, attrH, cid);
  
  if (methods.length > 0) {
    addCell('', lineStyle, 0, titleH + attrH, w, lineH, cid);
    addCell(methods.join('<br>'), methStyle, 0, titleH + attrH + lineH, w, methH, cid);
  }
  return { id: cid, x, y, w, h: totalH };
}

// ============================================================
//  CLASSES (Only Core 8 Classes)
// ============================================================

// --- TOP LEVEL ---
const departement = addClass('Departement', [
  '- id : Integer «PK»',
  '- nom : String',
  '- code : String «unique»',
  '- entity : Enum {GIAS, CSM}',
  '- responsable_id : Integer «FK»',
], [
  '+ activer() : void',
  '+ desactiver() : void',
], 150, 40, 240);

const utilisateur = addClass('Utilisateur', [
  '- id : Integer «PK»',
  '- email : String «unique»',
  '- password_hash : String',
  '- nom : String',
  '- prenom : String',
  '- role : Enum {admin, tuteur, stagiaire}',
  '- telephone : String',
  '- is_active : Boolean',
], [
  '+ validatePassword() : Boolean',
  '+ getFullName() : String',
], 540, 20, 260);

// --- MIDDLE LEVEL ---
const candidature = addClass('Candidature', [
  '- id : Integer «PK»',
  '- nom : String',
  '- prenom : String',
  '- email : String',
  '- etablissement : String',
  '- filiere : String',
  '- type_stage : Enum {pfe, ete, initiation}',
  '- statut : Enum {en_attente, acceptee, refusee}',
  '- score_matching : Integer',
], [
  '+ accepter() : void',
  '+ refuser() : void',
], 150, 340, 240);

const stagiaire = addClass('Stagiaire', [
  '- id : Integer «PK»',
  '- utilisateur_id : Integer «FK»',
  '- etablissement : String',
  '- filiere : String',
  '- niveau_etude : String',
  '- date_demarrage : Date',
  '- date_fin : Date',
  '- departement_id : Integer «FK»',
  '- tuteur_id : Integer «FK»',
  '- statut : Enum {actif, termine}',
], [
  '+ terminer() : void',
  '+ archiver() : void',
], 540, 340, 260);

const presence = addClass('Presence', [
  '- id : Integer «PK»',
  '- stage_id : Integer «FK»',
  '- date : Date',
  '- statut : Enum {P, AJ, ANJ}',
  '- heure_entree : Time',
  '- heure_sortie : Time',
  '- valide : Boolean',
], [
  '+ valider(userId) : void',
], 940, 360, 220);

// --- BOTTOM LEVEL ---
const convention = addClass('Convention', [
  '- id : Integer «PK»',
  '- candidature_id : Integer «FK»',
  '- numero : String «unique»',
  '- fichier_genere : String',
  '- fichier_signe : String',
  '- statut : Enum {generee, signee}',
], [
  '+ signer() : void',
], 150, 680, 240);

const document_ = addClass('Document', [
  '- id : Integer «PK»',
  '- stage_id : Integer «FK»',
  '- type : Enum {ATTESTATION, RAPPORT}',
  '- fichier_path : String',
  '- genere_par : Integer «FK»',
], [
  '+ generer() : void',
], 440, 680, 230);

const evaluation = addClass('Evaluation', [
  '- id : Integer «PK»',
  '- stage_id : Integer «FK»',
  '- tuteur_id : Integer «FK»',
  '- type : Enum {INTEGRATION, FINALE}',
  '- note_technique : Decimal',
  '- note_comportement : Decimal',
  '- note_totale : Decimal',
  '- mention : String',
  '- statut : Enum {BROUILLON, VALIDEE}',
], [
  '+ calculerNote() : void',
], 790, 680, 250);


// ============================================================
//  RELATIONS / ASSOCIATIONS (Minimal & Clear)
// ============================================================

// Utilisateur ↔ Departement
addEdge(utilisateur.id, departement.id, assocLine, '0..*                   0..1  appartient à');

// Utilisateur ↔ Stagiaire (Un stagiaire est lié à un compte Utilisateur)
addEdge(utilisateur.id, stagiaire.id, compLine, '1\n\n0..1  est lié à');

// Stagiaire ↔ Departement
addEdge(stagiaire.id, departement.id, assocLine, '0..*                   0..1  affecté à');

// Stagiaire ↔ Tuteur (Utilisateur)
addEdge(stagiaire.id, utilisateur.id, assocLine, '0..*        1  encadré par');

// Candidature ↔ Departement
addEdge(candidature.id, departement.id, assocLine, '0..*                   0..1  concerne');

// Convention ↔ Candidature
addEdge(convention.id, candidature.id, assocLine, '0..1                   1  basée sur');

// Stagiaire ↔ Presence (Composition)
addEdge(stagiaire.id, presence.id, compLine, '1             0..*  a des');

// Stagiaire ↔ Evaluation (Composition)
addEdge(stagiaire.id, evaluation.id, compLine, '1\n\n0..*  possède');

// Stagiaire ↔ Document (Composition)
addEdge(stagiaire.id, document_.id, compLine, '1\n\n0..*  génère');


// ============================================================
//  GENERATE XML
// ============================================================

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="app.diagrams.net" type="device">
  <diagram name="Diagramme Simple et Professionnel" id="cl_simple_1">
    <mxGraphModel dx="1200" dy="800" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="0" pageScale="1" pageWidth="1400" pageHeight="950" math="0" shadow="0" background="#FFFFFF">
      <root>
        <mxCell id="0"/>
        <mxCell id="1" parent="0"/>
        ${cells.join('\n        ')}
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;

const outFile = require('path').join(__dirname, 'diagramme_classe_globale_simple.drawio');
fs.writeFileSync(outFile, xml, 'utf8');
console.log(`✅ Diagramme simplifié généré avec succès : ${outFile}`);
