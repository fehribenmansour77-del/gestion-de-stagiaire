const fs = require('fs');
const path = require('path');

// ============================================================
//  Générateur de Diagrammes de Classes Draw.io Modulaires
// ============================================================

// Helper XML Entities Escape
function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

class DrawioDiagram {
  constructor(fillColor, strokeColor) {
    this.idCounter = 2;
    this.cells = [];
    
    // Core Styles
    this.titleStyle = `swimlane;fontStyle=1;align=center;startSize=26;html=1;collapsible=0;fillColor=${fillColor};strokeColor=${strokeColor};strokeWidth=2;fontSize=12;fontColor=#FFFFFF;fontFamily=Segoe UI;rounded=0;arcSize=0;shadow=0;swimlaneLine=1;`;
    this.attrStyle = `text;strokeColor=none;fillColor=#FFFFFF;align=left;verticalAlign=top;spacingLeft=8;spacingRight=6;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontColor=#333333;fontSize=10;fontFamily=Segoe UI;html=1;`;
    this.lineStyle = `line;strokeWidth=1;fillColor=none;align=left;verticalAlign=middle;spacingTop=-1;spacingLeft=3;spacingRight=3;rotatable=0;labelPosition=left;points=[];portConstraint=eastwest;strokeColor=${strokeColor};html=1;`;
    this.methStyle = `text;strokeColor=none;fillColor=#FFFFFF;align=left;verticalAlign=top;spacingLeft=8;spacingRight=6;overflow=hidden;rotatable=0;points=[[0,0.5],[1,0.5]];portConstraint=eastwest;fontColor=#333333;fontSize=10;fontFamily=Segoe UI;html=1;`;

    // Association Styles
    this.assocLine = 'endArrow=none;html=1;strokeColor=#555555;strokeWidth=1.5;fontSize=9;fontColor=#444444;fontFamily=Segoe UI;jumpStyle=arc;jumpSize=6;';
    this.compLine = 'endArrow=diamondThin;endFill=1;endSize=10;html=1;strokeColor=#555555;strokeWidth=1.5;fontSize=9;fontColor=#444444;fontFamily=Segoe UI;jumpStyle=arc;jumpSize=6;';
    this.inheritLine = 'endArrow=block;endFill=0;endSize=12;html=1;strokeColor=#555555;strokeWidth=1.5;fontSize=9;fontColor=#444444;fontFamily=Segoe UI;jumpStyle=arc;jumpSize=6;';
  }

  nid() {
    return String(this.idCounter++);
  }

  addCell(value, style, x, y, w, h, parent = '1') {
    const id = this.nid();
    this.cells.push(`<mxCell id="${id}" value="${esc(value)}" style="${style}" vertex="1" parent="${parent}"><mxGeometry x="${x}" y="${y}" width="${w}" height="${h}" as="geometry"/></mxCell>`);
    return id;
  }

  addEdge(src, tgt, style, label = '', exitX, exitY, entryX, entryY) {
    const id = this.nid();
    let geo = '<mxGeometry relative="1" as="geometry"/>';
    let extra = '';
    if (exitX !== undefined) {
      geo = `<mxGeometry relative="1" as="geometry"><Array as="points"/></mxGeometry>`;
      extra += `exitX=${exitX};exitY=${exitY};entryX=${entryX};entryY=${entryY};exitDx=0;exitDy=0;entryDx=0;entryDy=0;`;
    }
    this.cells.push(`<mxCell id="${id}" value="${esc(label)}" style="${style}${extra}" edge="1" source="${src}" target="${tgt}" parent="1">${geo}</mxCell>`);
    return id;
  }

  addClass(name, attrs, methods, x, y, w) {
    const titleH = 26;
    const lineH = 8;
    const linePerAttr = 16;
    const linePerMeth = 16;
    const attrH = attrs.length * linePerAttr + 10;
    const methH = methods.length > 0 ? methods.length * linePerMeth + 10 : 0;
    const totalH = titleH + attrH + (methods.length > 0 ? lineH : 0) + methH;

    const cid = this.addCell(name, this.titleStyle, x, y, w, totalH);
    const aid = this.addCell(attrs.join('<br>'), this.attrStyle, 0, titleH, w, attrH, cid);
    
    let mid = null;
    if (methods.length > 0) {
      this.addCell('', this.lineStyle, 0, titleH + attrH, w, lineH, cid);
      mid = this.addCell(methods.join('<br>'), this.methStyle, 0, titleH + attrH + lineH, w, methH, cid);
    }

    return { id: cid, attrId: aid, methId: mid, x, y, w, h: totalH };
  }

  getXML(name) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="app.diagrams.net" type="device">
  <diagram name="${esc(name)}" id="${esc(name.replace(/\s+/g, '_'))}">
    <mxGraphModel dx="1200" dy="800" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="827" pageHeight="1169" math="0" shadow="0" background="#FFFFFF">
      <root>
        <mxCell id="0"/>
        <mxCell id="1" parent="0"/>
        ${this.cells.join('\n        ')}
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;
  }
}

const outDir = __dirname;

// ============================================================
//  1. DIAGRAMME AUTH & UTILISATEURS (Bleu / Navy)
// ============================================================
const d1 = new DrawioDiagram('#4A6FA5', '#2C3E50');
const u1 = d1.addClass('Utilisateur', [
  '- id : Integer «PK»',
  '- email : String «unique»',
  '- password_hash : String',
  '- nom : String',
  '- prenom : String',
  '- role : Enum {super_admin, admin_rh, tuteur...}',
  '- telephone : String',
  '- entity : Enum {GIAS, CSM}',
  '- departement_id : Integer «FK»',
  '- is_active : Boolean',
], [
  '+ validatePassword() : Boolean',
  '+ getFullName() : String',
  '+ hasRole(role) : Boolean',
], 40, 40, 260);

const ad1 = d1.addClass('Admin', [
  '- id : Integer «PK»',
  '- utilisateur_id : Integer «FK»',
  '- poste : String',
  '- service : String',
  '- permissions_level : Integer',
], [], 380, 40, 220);

const pr1 = d1.addClass('PasswordReset', [
  '- id : Integer «PK»',
  '- user_id : Integer «FK»',
  '- token_hash : String',
  '- expires_at : DateTime',
], [
  '+ isValid() : Boolean',
], 380, 220, 220);

const la1 = d1.addClass('LoginAttempt', [
  '- id : Integer «PK»',
  '- email : String',
  '- ip_address : String',
  '- success : Boolean',
  '- failure_reason : String',
], [
  '+ record() : void',
], 40, 340, 260);

d1.addEdge(u1.id, ad1.id, d1.assocLine, '1                   0..1');
d1.addEdge(u1.id, pr1.id, d1.assocLine, '1            0..*');
fs.writeFileSync(path.join(outDir, 'diagramme_classe_auth.drawio'), d1.getXML('Module Authentification & Utilisateurs'), 'utf8');

// ============================================================
//  2. DIAGRAMME ORGANISATION (Vert)
// ============================================================
const d2 = new DrawioDiagram('#2ECC71', '#27AE60');
const dep2 = d2.addClass('Departement', [
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
], 40, 40, 250);

const u2 = d2.addClass('Utilisateur', [
  '- id : Integer «PK»',
  '- nom : String',
  '- prenom : String',
  '- role : Enum',
], [], 380, 40, 200);

d2.addEdge(dep2.id, dep2.id, d2.assocLine, '0..*     parent   0..1', 0.8, 0, 0.5, 0);
d2.addEdge(dep2.id, u2.id, d2.assocLine, '0..*   dirigé par   0..1');
d2.addEdge(u2.id, dep2.id, d2.assocLine, '0..*   appartient   0..1');
fs.writeFileSync(path.join(outDir, 'diagramme_classe_org.drawio'), d2.getXML('Module Organisation'), 'utf8');

// ============================================================
//  3. DIAGRAMME CANDIDATURES (Orange)
// ============================================================
const d3 = new DrawioDiagram('#E67E22', '#D35400');
const cand3 = d3.addClass('Candidature', [
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
  '- score_matching : Integer',
], [
  '+ accepter() : void',
  '+ refuser() : void',
], 40, 40, 260);

const dep3 = d3.addClass('Departement', [
  '- id : Integer «PK»',
  '- nom : String',
  '- code : String',
], [], 380, 40, 200);

const conv3 = d3.addClass('Convention', [
  '- id : Integer «PK»',
  '- candidature_id : Integer «FK»',
  '- numero : String',
  '- statut : Enum',
], [], 380, 200, 200);

d3.addEdge(cand3.id, dep3.id, d3.assocLine, '0..*   souhaité   0..1');
d3.addEdge(conv3.id, cand3.id, d3.assocLine, '0..1   basée sur   1');
fs.writeFileSync(path.join(outDir, 'diagramme_classe_candidature.drawio'), d3.getXML('Module Candidatures'), 'utf8');

// ============================================================
//  4. DIAGRAMME STAGES & SUIVI (Violet)
// ============================================================
const d4 = new DrawioDiagram('#9B59B6', '#8E44AD');
const stg4 = d4.addClass('Stagiaire', [
  '- id : Integer «PK»',
  '- utilisateur_id : Integer «FK»',
  '- etablissement : String',
  '- filiere : String',
  '- departement_id : Integer «FK»',
  '- tuteur_id : Integer «FK»',
  '- date_demarrage : Date',
  '- date_fin : Date',
  '- statut : Enum',
], [
  '+ archiver() : void',
  '+ terminer() : void',
], 40, 40, 260);

const pres4 = d4.addClass('Presence', [
  '- id : Integer «PK»',
  '- stage_id : Integer «FK»',
  '- date : Date',
  '- statut : Enum {P, AJ, ANJ}',
  '- valide : Boolean',
], [
  '+ valider() : void',
], 380, 40, 220);

const eval4 = d4.addClass('Evaluation', [
  '- id : Integer «PK»',
  '- stage_id : Integer «FK»',
  '- type : Enum',
  '- note_totale : Decimal',
  '- mention : String',
  '- statut : Enum',
], [
  '+ calculerNote() : Object',
], 380, 240, 220);

const arch4 = d4.addClass('StagiaireArchive', [
  '- id : Integer «PK»',
  '- original_id : Integer',
  '- date_archive : Date',
  '- raison_archive : Text',
], [], 40, 360, 260);

d4.addEdge(stg4.id, pres4.id, d4.compLine, '1         0..*');
d4.addEdge(stg4.id, eval4.id, d4.compLine, '1         0..*');
d4.addEdge(stg4.id, arch4.id, d4.inheritLine, '«archive»');
fs.writeFileSync(path.join(outDir, 'diagramme_classe_stage.drawio'), d4.getXML('Module Stages et Suivi'), 'utf8');

// ============================================================
//  5. GESTION DOCUMENTAIRE (Rouge)
// ============================================================
const d5 = new DrawioDiagram('#E74C3C', '#C0392B');
const conv5 = d5.addClass('Convention', [
  '- id : Integer «PK»',
  '- candidature_id : Integer «FK»',
  '- numero : String',
  '- fichier_genere : String',
  '- statut : Enum',
  '- date_generation : DateTime',
], [], 40, 40, 250);

const doc5 = d5.addClass('Document', [
  '- id : Integer «PK»',
  '- stage_id : Integer «FK»',
  '- type : Enum {ATTESTATION, RAPPORT...}',
  '- fichier_path : String',
  '- genere_par : Integer «FK»',
], [
  '+ programmerArchivage() : void',
], 380, 40, 250);

const stg5 = d5.addClass('Stagiaire', [
  '- id : Integer «PK»',
  '- nom : String',
  '- prenom : String',
], [], 40, 300, 200);

const cand5 = d5.addClass('Candidature', [
  '- id : Integer «PK»',
  '- nom : String',
], [], 380, 300, 200);

d5.addEdge(conv5.id, cand5.id, d5.assocLine, '0..1       1');
d5.addEdge(conv5.id, stg5.id, d5.assocLine, '0..*       0..1');
d5.addEdge(doc5.id, stg5.id, d5.assocLine, '0..*       1');
fs.writeFileSync(path.join(outDir, 'diagramme_classe_document.drawio'), d5.getXML('Module Documentaire'), 'utf8');

// ============================================================
//  6. COMMUNICATION & AUDIT (Lavande / Mauve)
// ============================================================
const d6 = new DrawioDiagram('#8E44AD', '#7D3C98');
const notif6 = d6.addClass('Notification', [
  '- id : Integer «PK»',
  '- utilisateur_id : Integer «FK»',
  '- titre : String',
  '- message : Text',
  '- lue : Boolean',
], [], 40, 40, 220);

const msg6 = d6.addClass('Message', [
  '- id : Integer «PK»',
  '- expediteur_id : Integer «FK»',
  '- destinataire_id : Integer «FK»',
  '- sujet : String',
  '- contenu : Text',
], [], 300, 40, 240);

const audit6 = d6.addClass('AuditLog', [
  '- id : Integer «PK»',
  '- user_id : Integer «FK»',
  '- action : String',
  '- ip_address : String',
], [
  '+ log() : AuditLog',
], 580, 40, 210);

const u6 = d6.addClass('Utilisateur', [
  '- id : Integer «PK»',
  '- nom : String',
], [], 300, 320, 200);

d6.addEdge(notif6.id, u6.id, d6.assocLine, '0..*     destinée à     1');
d6.addEdge(msg6.id, u6.id, d6.assocLine, '0..*     envoyé par     1');
d6.addEdge(audit6.id, u6.id, d6.assocLine, '0..*     consigne     0..1');
fs.writeFileSync(path.join(outDir, 'diagramme_classe_com.drawio'), d6.getXML('Module Communication et Audit'), 'utf8');

console.log('🎉 Tous les 6 diagrammes Draw.io modulaires ont été générés avec succès !');
