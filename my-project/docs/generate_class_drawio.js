const fs = require('fs');
let id = 2;
const nid = () => String(id++);
const cells = [];

function addCell(value, style, x, y, w, h, parent = '1') {
  const i = nid();
  cells.push(`<mxCell id="${i}" value="${value}" style="${style}" vertex="1" parent="${parent}"><mxGeometry x="${x}" y="${y}" width="${w}" height="${h}" as="geometry"/></mxCell>`);
  return i;
}
function addEdge(src, tgt, style, label = '') {
  const i = nid();
  cells.push(`<mxCell id="${i}" value="${label}" style="${style}" edge="1" source="${src}" target="${tgt}" parent="1"><mxGeometry relative="1" as="geometry"/></mxCell>`);
  return i;
}

const clsTitle = 'swimlane;fontStyle=1;align=center;startSize=28;html=1;collapsible=0;fillColor=#dae8fc;strokeColor=#6c8ebf;strokeWidth=1.5;fontSize=12;fontColor=#1A237E;rounded=1;arcSize=4;shadow=0;';
const clsSec = 'text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=6;spacingRight=4;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontColor=#2C3E50;fontSize=10;html=1;';
const clsLine = 'line;strokeWidth=1;fillColor=none;align=left;verticalAlign=middle;spacingTop=-1;spacingLeft=3;spacingRight=3;rotatable=0;labelPosition=left;points=[];portConstraint=eastwest;strokeColor=#6c8ebf;html=1;';
const assocStyle = 'endArrow=none;html=1;strokeColor=#5B7FC7;strokeWidth=1.5;fontSize=9;fontColor=#5B7FC7;';
const compStyle = 'endArrow=diamondThin;endFill=1;endSize=10;html=1;strokeColor=#5B7FC7;strokeWidth=1.5;fontSize=9;fontColor=#5B7FC7;';

function addClass(name, attrs, methods, x, y, w, color) {
  const titleH = 28;
  const attrH = attrs.length * 17 + 8;
  const lineH = 8;
  const methH = methods.length > 0 ? methods.length * 17 + 8 : 0;
  const totalH = titleH + attrH + lineH + methH;
  const style = clsTitle.replace('#dae8fc', color);
  const cid = addCell(name, style, x, y, w, totalH);
  addCell(attrs.join('<br>'), clsSec, x, y + titleH, w, attrH, '1');
  addCell('', clsLine, x, y + titleH + attrH, w, lineH, '1');
  if (methods.length > 0) addCell(methods.join('<br>'), clsSec, x, y + titleH + attrH + lineH, w, methH, '1');
  return { id: cid, bottom: y + totalH };
}

// ==================== CLASSES ====================

// Utilisateur (center)
const utilisateur = addClass('Utilisateur', [
  '- id : Integer «PK»',
  '- email : String «unique»',
  '- password_hash : String',
  '- nom : String',
  '- prenom : String',
  '- role : Enum {super_admin, admin_rh, tuteur, encadrant, stagiaire}',
  '- telephone : String',
  '- photo_url : String',
  '- entity : Enum {GIAS, CSM, SHARED}',
  '- departement_id : Integer «FK»',
  '- is_active : Boolean',
  '- last_login : DateTime',
], [
  '+ validatePassword() : Boolean',
  '+ getFullName() : String',
  '+ hasRole(role) : Boolean',
  '+ updatePassword() : void',
  '+ toPublicJSON() : Object',
], 700, 20, 310, '#dae8fc');

// Admin
const admin = addClass('Admin', [
  '- id : Integer «PK»',
  '- utilisateur_id : Integer «FK»',
  '- poste : String',
  '- service : String',
  '- permissions_level : Integer',
], [], 1100, 20, 250, '#dae8fc');

// Departement
const departement = addClass('Departement', [
  '- id : Integer «PK»',
  '- nom : String',
  '- code : String «unique»',
  '- description : Text',
  '- responsable_id : Integer «FK»',
  '- parent_id : Integer «FK»',
  '- entity : Enum {GIAS, CSM, SHARED}',
  '- capacite_accueil : Integer',
  '- est_actif : Boolean',
], [
  '+ deactivate() : void',
  '+ activate() : void',
  '+ hasChildren() : Boolean',
], 350, 20, 280, '#d5e8d4');

// Stagiaire
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
  '- entity : Enum {GIAS, CSM, SHARED}',
  '- statut : Enum {actif, termine, archive}',
  '- date_archive : Date',
  '- raison_archive : Text',
], [
  '+ archiver(raison) : void',
  '+ terminer() : void',
  '+ reactiver() : void',
], 700, 400, 310, '#e1d5e7');

// Candidature
const candidature = addClass('Candidature', [
  '- id : Integer «PK»',
  '- nom, prenom, email, telephone',
  '- etablissement : String',
  '- filiere : String',
  '- niveau_etude : String',
  '- departement_souhaite : Integer «FK»',
  '- date_debut / date_fin : Date',
  '- theme : Text',
  '- type_stage : Enum {pfe, ete, initiation, professionnel}',
  '- cv_url, lm_url : String',
  '- statut : Enum {en_attente, en_cours, acceptee, refusee, ...}',
  '- numero_suivi : String «unique»',
  '- score_matching : Integer',
  '- commentaire : Text',
], [
  '+ accepter() : void',
  '+ refuser() : void',
  '+ traiter() : void',
  '+ generateSuiviNumber() : String',
], 20, 400, 310, '#fff2cc');

// Presence
const presence = addClass('Presence', [
  '- id : Integer «PK»',
  '- stage_id : Integer «FK»',
  '- date : Date',
  '- statut : Enum {P, AJ, ANJ, C, R, DA, TT, JF}',
  '- heure_entree / heure_sortie : Time',
  '- justificatif : String',
  '- commentaire : Text',
  '- valide : Boolean',
  '- valide_par : Integer «FK»',
  '- alerte_generee : Boolean',
], [
  '+ getHeuresEffectuees() : Float',
  '+ valider(userId) : void',
  '+ calculateTauxPresence() : Integer',
], 380, 400, 280, '#f8cecc');

// Evaluation
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
  '- points_forts : Text',
  '- axes_amelioration : Text',
  '- statut : Enum {BROUILLON, SOUMISE, VALIDEE_RH, REFUSEE}',
  '- rh_validee_par : Integer «FK»',
], [
  '+ calculerNote() : Object',
  '+ getMentionFromNote(note) : Object',
], 1060, 400, 300, '#f8cecc');

// Convention
const convention = addClass('Convention', [
  '- id : Integer «PK»',
  '- candidature_id : Integer «FK»',
  '- numero : String «unique»',
  '- fichier_genere / fichier_signe : String',
  '- statut : Enum {generee, en_signature, signee, annulee}',
  '- date_generation : DateTime',
  '- date_signature : DateTime',
  '- commentaire : Text',
  '- archive : Boolean',
], [
  '+ signer() : void',
  '+ archiver() : void',
  '+ generateNumber() : String',
], 20, 20, 280, '#b1ddf0');

// Document
const document = addClass('Document', [
  '- id : Integer «PK»',
  '- stage_id : Integer «FK»',
  '- type : Enum {ATTESTATION, FEUILLE_PRESENCE, RAPPORT, CONVENTION}',
  '- fichier_path / fichier_nom : String',
  '- periode_mois / periode_annee : Integer',
  '- taille_fichier : Integer',
  '- genere_par : Integer «FK»',
  '- archive : Boolean',
], [
  '+ programmerArchivage() : void',
], 20, 820, 290, '#b1ddf0');

// Notification
const notification = addClass('Notification', [
  '- id : Integer «PK»',
  '- utilisateur_id : Integer «FK»',
  '- titre : String',
  '- message : Text',
  '- type : Enum {CANDIDATURE_NOUVELLE, ABSENCE, EVALUATION, ...}',
  '- lien : String',
  '- lue : Boolean',
  '- donnees_extra : JSON',
], [], 1100, 820, 280, '#ffe6cc');

// Message
const message = addClass('Message', [
  '- id : Integer «PK»',
  '- expediteur_id : Integer «FK»',
  '- destinataire_id : Integer «FK»',
  '- stage_id : Integer «FK»',
  '- sujet : String',
  '- contenu : Text',
  '- lu : Boolean',
  '- piece_jointe_nom : String',
], [], 750, 820, 280, '#ffe6cc');

// AuditLog
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
  '+ getUserLogs(userId) : List',
], 380, 820, 280, '#f5f5f5');

// LoginAttempt
const loginAttempt = addClass('LoginAttempt', [
  '- id : Integer «PK»',
  '- email : String',
  '- ip_address : String',
  '- success : Boolean',
  '- failure_reason : String',
], [
  '+ record(data) : LoginAttempt',
  '+ countRecentAttempts() : Integer',
], 1100, 230, 250, '#f5f5f5');

// PasswordReset
const passwordReset = addClass('PasswordReset', [
  '- id : Integer «PK»',
  '- user_id : Integer «FK»',
  '- token_hash : String',
  '- expires_at : DateTime',
  '- used_at : DateTime',
], [
  '+ createToken(userId) : Object',
  '+ validateToken() : Object',
], 1400, 20, 250, '#f5f5f5');

// StagiaireArchive
const stagArchive = addClass('StagiaireArchive', [
  '- id : Integer «PK»',
  '- original_id : Integer',
  '- utilisateur_id : Integer «FK»',
  '- departement_id : Integer «FK»',
  '- archived_at : DateTime',
  '- retention_end_date : Date',
], [], 1400, 400, 250, '#e1d5e7');

// ==================== ASSOCIATIONS ====================
// Utilisateur - Admin (1..0..1)
addEdge(utilisateur.id, admin.id, assocStyle, '1          0..1');
// Utilisateur - Departement
addEdge(utilisateur.id, departement.id, assocStyle, '0..*     0..1');
// Utilisateur - Stagiaire
addEdge(utilisateur.id, stagiaire.id, compStyle, '1     0..*');
// Utilisateur - PasswordReset
addEdge(utilisateur.id, passwordReset.id, assocStyle, '1       0..*');
// Stagiaire - Departement
addEdge(stagiaire.id, departement.id, assocStyle, '0..*         0..1');
// Stagiaire - Presence
addEdge(stagiaire.id, presence.id, compStyle, '1     0..*');
// Stagiaire - Evaluation
addEdge(stagiaire.id, evaluation.id, compStyle, '1     0..*');
// Stagiaire - Document
addEdge(stagiaire.id, document.id, compStyle, '1        0..*');
// Stagiaire - Message
addEdge(stagiaire.id, message.id, assocStyle, '1     0..*');
// Candidature - Departement
addEdge(candidature.id, departement.id, assocStyle, '0..*       0..1');
// Convention - Candidature
addEdge(convention.id, candidature.id, assocStyle, '0..1       1');
// Notification - Utilisateur
addEdge(notification.id, utilisateur.id, assocStyle, '0..*       1');
// AuditLog - Utilisateur
addEdge(auditLog.id, utilisateur.id, assocStyle, '0..*       0..1');
// Message - Utilisateur (expediteur)
addEdge(message.id, utilisateur.id, assocStyle, '0..*       1');
// Evaluation - Utilisateur (tuteur)
addEdge(evaluation.id, utilisateur.id, assocStyle, '0..*       1');

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="app.diagrams.net" type="device">
  <diagram name="Classe Globale" id="cl1">
    <mxGraphModel dx="1600" dy="1000" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="0" pageScale="1" pageWidth="1800" pageHeight="1200" math="0" shadow="0">
      <root>
        <mxCell id="0"/>
        <mxCell id="1" parent="0"/>
        ${cells.join('\n        ')}
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;

fs.writeFileSync('specs/diagrammes/diagramme_classe_globale.drawio', xml);
console.log('Class diagram generated!');
