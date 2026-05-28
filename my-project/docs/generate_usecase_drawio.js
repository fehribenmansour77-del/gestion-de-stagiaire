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

const actorStyle = 'shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;html=1;outlineConnect=0;fillColor=#dae8fc;strokeColor=#3F51B5;strokeWidth=1.5;fontSize=11;fontStyle=1;fontColor=#1A237E;';
const sysStyle = 'rounded=1;whiteSpace=wrap;html=1;arcSize=2;fillColor=none;strokeColor=#4A6FA5;strokeWidth=2.5;verticalAlign=top;align=center;spacingTop=8;fontSize=15;fontStyle=1;fontColor=#2C3E50;';
const pkgStyle = (color) => `rounded=1;whiteSpace=wrap;html=1;arcSize=6;fillColor=${color};strokeColor=#7B8EC8;strokeWidth=1.5;verticalAlign=top;align=center;spacingTop=5;fontSize=11;fontStyle=1;fontColor=#34495E;opacity=60;`;
const ucStyle = 'ellipse;whiteSpace=wrap;html=1;fillColor=#FFFFFF;strokeColor=#5B7FC7;strokeWidth=1.5;fontSize=10;fontColor=#2C3E50;';
const lineStyle = 'endArrow=none;html=1;strokeColor=#5B7FC7;strokeWidth=1.5;entryX=0;entryY=0.5;entryDx=0;entryDy=0;';
const lineStyleR = 'endArrow=none;html=1;strokeColor=#5B7FC7;strokeWidth=1.5;exitX=1;exitY=0.5;exitDx=0;exitDy=0;';
const inclStyle = 'html=1;dashed=1;dashPattern=8 4;strokeColor=#999;strokeWidth=1;endArrow=open;endSize=8;fontSize=9;fontColor=#666;labelBackgroundColor=#FFFFFF;';
const extStyle = 'html=1;dashed=1;dashPattern=8 4;strokeColor=#999;strokeWidth=1;endArrow=open;endSize=8;fontSize=9;fontColor=#666;labelBackgroundColor=#FFFFFF;';

// Actors LEFT
const stagiaire = addCell('Stagiaire', actorStyle, 40, 170, 30, 55);
const tuteur = addCell('Tuteur /\nEncadrant', actorStyle, 40, 560, 30, 55);

// Actors RIGHT
const adminRH = addCell('Admin RH', actorStyle, 1520, 280, 30, 55);
const superAdmin = addCell('Super Admin', actorStyle, 1520, 560, 30, 55);
const systemeIA = addCell('Système', actorStyle + 'fontColor=#666;', 1520, 810, 30, 55);

// Héritage Super Admin -> Admin RH
addEdge(superAdmin, adminRH, 'endArrow=block;endFill=0;html=1;strokeColor=#3F51B5;strokeWidth=1.5;endSize=12;');

// System boundary
addCell('<b>Système StageFlow</b><br><i>Plateforme de Gestion de Stagiaires</i>', sysStyle, 180, 20, 1270, 960);

// === PACKAGES & USE CASES ===

// 1. Auth & Compte
addCell('Authentification &amp; Compte', pkgStyle('#dae8fc'), 210, 50, 1210, 140);
const ucAuth = addCell("S'authentifier", ucStyle, 240, 95, 140, 50);
const ucInscrire = addCell("S'inscrire", ucStyle, 420, 95, 130, 50);
const ucOTP = addCell('Vérifier OTP\n(email)', ucStyle, 590, 95, 140, 50);
const ucProfil = addCell('Gérer son\nprofil', ucStyle, 780, 95, 130, 50);
const ucResetPwd = addCell('Réinitialiser\nmot de passe', ucStyle, 960, 95, 150, 50);

// 2. Candidatures
addCell('Gestion des Candidatures', pkgStyle('#fff2cc'), 210, 220, 580, 155);
const ucSoumettre = addCell('Soumettre une\ncandidature', ucStyle, 230, 265, 155, 50);
const ucSuivre = addCell('Suivre sa\ncandidature', ucStyle, 410, 265, 140, 50);
const ucTraiter = addCell('Traiter les\ncandidatures', ucStyle, 580, 265, 150, 50);

// 3. Stagiaires
addCell('Gestion des Stagiaires', pkgStyle('#d5e8d4'), 820, 220, 600, 155);
const ucListeStag = addCell('Consulter la liste\ndes stagiaires', ucStyle, 840, 260, 155, 50);
const ucGererStag = addCell('Gérer les\nstagiaires', ucStyle, 1020, 260, 140, 50);
const ucArchiver = addCell('Archiver un\nstagiaire', ucStyle, 1190, 260, 140, 50);
const ucAssigner = addCell('Assigner un\ntuteur', ucStyle, 1190, 320, 140, 50);

// 4. Présences
addCell('Gestion des Présences', pkgStyle('#e1d5e7'), 210, 405, 340, 145);
const ucConsulterPres = addCell('Consulter ses\nprésences', ucStyle, 230, 445, 145, 50);
const ucGererPres = addCell('Gérer les\nprésences', ucStyle, 390, 445, 140, 50);

// 5. Évaluations
addCell('Gestion des Évaluations', pkgStyle('#f8cecc'), 580, 405, 440, 145);
const ucConsulterEval = addCell('Consulter ses\névaluations', ucStyle, 600, 445, 145, 50);
const ucCreerEval = addCell('Créer une\névaluation', ucStyle, 760, 445, 140, 50);
const ucValiderEval = addCell('Valider une\névaluation', ucStyle, 920, 445, 140, 50);

// 6. Documents
addCell('Gestion Documentaire', pkgStyle('#b1ddf0'), 1050, 405, 370, 145);
const ucGenConv = addCell('Générer une\nconvention', ucStyle, 1070, 440, 145, 50);
const ucGenAtt = addCell('Générer une\nattestation', ucStyle, 1240, 440, 145, 50);
const ucGererDoc = addCell('Gérer les\ndocuments', ucStyle, 1155, 500, 145, 50);

// 7. Administration
addCell('Administration &amp; Supervision', pkgStyle('#f5f5f5'), 210, 580, 750, 155);
const ucDashboard = addCell('Consulter le\ntableau de bord', ucStyle, 230, 625, 155, 50);
const ucGererUsers = addCell('Gérer les\nutilisateurs', ucStyle, 410, 625, 140, 50);
const ucGererDepts = addCell('Gérer les\ndépartements', ucStyle, 570, 625, 150, 50);
const ucNotifs = addCell('Consulter les\nnotifications', ucStyle, 740, 625, 150, 50);
const ucAuditLogs = addCell('Consulter les\nlogs d\'audit', ucStyle, 410, 690, 140, 50);

// 8. Système IA
addCell('Système Intelligent (IA)', pkgStyle('#ffe6cc'), 990, 580, 430, 155);
const ucMatching = addCell('Calculer le score\nde matching', ucStyle, 1010, 630, 160, 50);
const ucSearch = addCell('Recherche\nintelligente', ucStyle, 1200, 630, 145, 50);

// === CONNECTIONS ===
// Stagiaire connections
addEdge(stagiaire, ucAuth, lineStyle);
addEdge(stagiaire, ucInscrire, lineStyle);
addEdge(stagiaire, ucProfil, lineStyle);
addEdge(stagiaire, ucSoumettre, lineStyle);
addEdge(stagiaire, ucSuivre, lineStyle);
addEdge(stagiaire, ucConsulterPres, lineStyle);
addEdge(stagiaire, ucConsulterEval, lineStyle);
addEdge(stagiaire, ucNotifs, lineStyle);

// Tuteur connections
addEdge(tuteur, ucAuth, lineStyle);
addEdge(tuteur, ucListeStag, lineStyle);
addEdge(tuteur, ucGererPres, lineStyle);
addEdge(tuteur, ucCreerEval, lineStyle);
addEdge(tuteur, ucConsulterEval, lineStyle);
addEdge(tuteur, ucDashboard, lineStyle);
addEdge(tuteur, ucNotifs, lineStyle);

// Admin RH connections
addEdge(adminRH, ucAuth, lineStyleR);
addEdge(adminRH, ucTraiter, lineStyleR);
addEdge(adminRH, ucGererStag, lineStyleR);
addEdge(adminRH, ucGererDoc, lineStyleR);
addEdge(adminRH, ucGenConv, lineStyleR);
addEdge(adminRH, ucGenAtt, lineStyleR);
addEdge(adminRH, ucGererDepts, lineStyleR);
addEdge(adminRH, ucDashboard, lineStyleR);
addEdge(adminRH, ucValiderEval, lineStyleR);
addEdge(adminRH, ucNotifs, lineStyleR);

// Super Admin connections
addEdge(superAdmin, ucGererUsers, lineStyleR);
addEdge(superAdmin, ucAuditLogs, lineStyleR);

// Système IA connections
addEdge(systemeIA, ucMatching, lineStyleR);
addEdge(systemeIA, ucSearch, lineStyleR);

// Include relationships
addEdge(ucInscrire, ucOTP, inclStyle, '&lt;&lt;include&gt;&gt;');
addEdge(ucAuth, ucOTP, inclStyle, '&lt;&lt;include&gt;&gt;');

// Extend relationships
addEdge(ucArchiver, ucGererStag, extStyle, '&lt;&lt;extend&gt;&gt;');
addEdge(ucAssigner, ucGererStag, extStyle, '&lt;&lt;extend&gt;&gt;');

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="app.diagrams.net" type="device">
  <diagram name="Cas d utilisation" id="uc1">
    <mxGraphModel dx="1422" dy="762" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="0" pageScale="1" pageWidth="1600" pageHeight="1100" math="0" shadow="0">
      <root>
        <mxCell id="0"/>
        <mxCell id="1" parent="0"/>
        ${cells.join('\n        ')}
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;

fs.writeFileSync('specs/diagrammes/diagramme_cas_utilisation.drawio', xml);
console.log('Use case diagram generated!');
