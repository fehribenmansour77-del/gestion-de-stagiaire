/**
 * Service: PDF Generation (via PDFKit)
 * Centralized logic for creating official documents
 */

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const company = require('../config/company');

/**
 * Common Header for all documents
 */
const addHeader = (doc, title) => {
  // Logo placeholder style
  doc.fillColor(company.colors.primary)
     .rect(50, 20, 60, 30)
     .fill();
  
  doc.fillColor('#ffffff')
     .fontSize(10)
     .text(company.logoText, 55, 30);
  
  // Company details
  doc.fillColor(company.colors.text)
     .fontSize(18)
     .text(company.name, 120, 25);
  
  doc.fontSize(10)
     .fillColor(company.colors.muted)
     .text(`${company.group} - ${company.address}, ${company.city}, ${company.country}`, 120, 45);
  
  // Document Title
  doc.fontSize(16)
     .fillColor(company.colors.text)
     .text(title, 50, 80);
  
  // Decorative line
  doc.strokeColor(company.colors.light)
     .lineWidth(2)
     .moveTo(50, 100)
     .lineTo(560, 100)
     .stroke();
  
  return 120; // Return Y coordinate for next element
};

/**
 * Common Footer for all documents
 */
const addFooter = (doc) => {
  const pageHeight = doc.page.height;
  
  doc.strokeColor(company.colors.light)
     .lineWidth(1)
     .moveTo(50, pageHeight - 50)
     .lineTo(560, pageHeight - 50)
     .stroke();
  
  doc.fontSize(8)
     .fillColor(company.colors.muted)
     .text(
       `Document généré le ${new Date().toLocaleDateString('fr-FR')} | ${company.name}`,
       50,
       pageHeight - 40,
       { align: 'center' }
     )
     .text(
       `${company.website} | ${company.email} | Tél: ${company.phone}`,
       50,
       pageHeight - 30,
       { align: 'center' }
     );
};

/**
 * Generate a Convention PDF
 */
const generateConventionPDF = async (candidature, filePath) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);
      
      addHeader(doc, 'CONVENTION DE STAGE');
      let y = 130;
      
      doc.fontSize(12).fillColor(company.colors.text);
      
      // Partager info
      doc.font('Helvetica-Bold').text(`ENTRE :`, 50, y);
      y += 20;
      doc.font('Helvetica').text(`La société ${company.name}, sise à ${company.address}, ${company.city}, représentée par son département Ressources Humaines.`, 50, y, { width: 500 });
      y += 40;
      
      doc.font('Helvetica-Bold').text(`ET :`, 50, y);
      y += 20;
      doc.font('Helvetica').text(`M/Mme ${candidature.prenom.toUpperCase()} ${candidature.nom.toUpperCase()}, étudiant(e) à l'établissement ${candidature.etablissement}.`, 50, y, { width: 500 });
      y += 50;
      
      doc.font('Helvetica-Bold').text(`ARTICLE 1 : OBJET DU STAGE`, 50, y);
      y += 20;
      doc.font('Helvetica').text(`Le présent stage s'inscrit dans le cadre de la formation du stagiaire et a pour thème :`, 50, y);
      y += 20;
      doc.font('Helvetica-Bold').text(candidature.theme || 'Sujet à définir avec le tuteur', 70, y, { italic: true });
      y += 40;
      
      doc.font('Helvetica-Bold').text(`ARTICLE 2 : DURÉE ET MODALITÉS`, 50, y);
      y += 20;
      doc.font('Helvetica').text(`Le stage aura une durée prévue du ${new Date(candidature.date_debut).toLocaleDateString('fr-FR')} au ${new Date(candidature.date_fin).toLocaleDateString('fr-FR')}.`, 50, y);
      y += 20;
      doc.text(`Le stagiaire est tenu de respecter les horaires de l'entreprise (08h00 - 16h00) ainsi que le règlement intérieur.`, 50, y);
      y += 50;
      
      // Signatures
      doc.font('Helvetica-Bold').text(`Signatures et Cachets :`, 50, y);
      y += 30;
      
      doc.text(`L'Entreprise`, 70, y);
      doc.text(`L'Établissement`, 250, y);
      doc.text(`Le Stagiaire`, 430, y);
      
      addFooter(doc);
      doc.end();
      
      stream.on('finish', () => resolve(filePath));
      stream.on('error', reject);
    } catch (err) {
      reject(err);
    }
  });
};

/**
 * Generate an Attestation PDF (Refactored logic)
 */
const generateAttestationPDF = async (stageData, filePath) => {
  // Logic very similar to documents.js but using centralized config
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);
      
      const nom = (stageData.nom || 'STAGIAIRE').toUpperCase();
      const prenom = (stageData.prenom || '').toUpperCase();
      const dateDebut = stageData.dateDebut || '...';
      const dateFin = stageData.dateFin || '...';
      const departement = stageData.departement || '...';
      const tuteur = stageData.tuteur || '...';

      addHeader(doc, 'ATTESTATION DE FIN DE STAGE');
      let y = 140;
      
      doc.fontSize(12).fillColor(company.colors.text);
      doc.text(`Nous soussignés, la société ${company.name}, certifions par la présente que :`, 50, y);
      y += 30;
      
      doc.fontSize(16).font('Helvetica-Bold').fillColor(company.colors.primary).text(`M/Mme ${nom} ${prenom}`, 50, y, { align: 'center' });
      y += 40;
      
      doc.fontSize(12).font('Helvetica').fillColor(company.colors.text).text(`A effectué un stage au sein de notre établissement durant la période allant du :`, 50, y);
      y += 25;
      doc.font('Helvetica-Bold').text(`${dateDebut} au ${dateFin}`, 50, y, { align: 'center' });
      y += 40;
      
      doc.font('Helvetica').text(`Ce stage s'est déroulé au sein du département ${departement} sous l'encadrement de Mr/Mme ${tuteur}.`, 50, y, { width: 500 });
      y += 30;
      
      if (stageData.mention) {
        doc.text(`Mention obtenue : ${stageData.mention}`, 50, y);
        y += 20;
      }
      
      doc.text(`En foi de quoi, la présente attestation lui est délivrée pour valoir ce que de droit.`, 50, y + 40);
      
      addFooter(doc);
      doc.end();
      
      stream.on('finish', () => resolve(filePath));
      stream.on('error', reject);
    } catch (err) {
      reject(err);
    }
  });
};

/**
 * Generate a Presence Sheet PDF
 */
const generatePresencePDF = async (data, filePath) => {
  return new Promise((resolve, reject) => {
    try {
      const { stage, presences, mois, annee } = data;
      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);
      
      const monthNames = [
        'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
      ];
      
      addHeader(doc, `FEUILLE DE PRÉSENCE - ${monthNames[mois - 1].toUpperCase()} ${annee}`);
      let y = 140;
      
      doc.fontSize(12).fillColor(company.colors.text);
      doc.font('Helvetica-Bold').text(`Stagiaire : ${stage.nom} ${stage.prenom}`, 50, y);
      y += 20;
      doc.font('Helvetica').text(`Département : ${stage.departement?.nom || 'N/A'}`, 50, y);
      y += 20;
      doc.text(`Tuteur : ${stage.tuteur?.nom || ''} ${stage.tuteur?.prenom || ''}`, 50, y);
      y += 30;
      
      // Table Header
      doc.rect(50, y, 510, 20).fill(company.colors.primary);
      doc.fillColor('#ffffff').fontSize(10);
      doc.text('Jour', 55, y + 5);
      doc.text('Statut', 130, y + 5);
      doc.text('Entrée', 230, y + 5);
      doc.text('Sortie', 330, y + 5);
      doc.text('Commentaire', 430, y + 5);
      y += 20;
      
      const statusLabels = {
        P: 'Présent', AJ: 'Abs. Justifiée', ANJ: 'Abs. Non Justifiée',
        C: 'Congé', R: 'Retard', DA: 'Départ Ant.', TT: 'Télétravail', JF: 'Jour Férié'
      };
      
      const joursDansMois = new Date(annee, mois, 0).getDate();
      for (let jour = 1; jour <= joursDansMois; jour++) {
        const presence = presences.find(p => new Date(p.date).getDate() === jour);
        const dateObj = new Date(annee, mois - 1, jour);
        const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
        
        doc.fillColor(isWeekend ? '#f3f4f6' : '#ffffff')
           .rect(50, y, 510, 18)
           .fill();
        
        doc.fillColor(company.colors.text).text(`${jour}`, 55, y + 3);
        
        if (presence) {
          doc.text(statusLabels[presence.statut] || presence.statut, 130, y + 3);
          doc.text(presence.heure_entree || '-', 230, y + 3);
          doc.text(presence.heure_sortie || '-', 330, y + 3);
          doc.text(presence.commentaire || '-', 430, y + 3, { width: 120 });
        } else if (isWeekend) {
          doc.fillColor(company.colors.muted).text('Weekend', 130, y + 3);
        }
        
        y += 18;
        if (y > 700) { doc.addPage(); y = 50; }
      }
      
      addFooter(doc);
      doc.end();
      
      stream.on('finish', () => resolve(filePath));
      stream.on('error', reject);
    } catch (err) {
      reject(err);
    }
  });
};

/**
 * Generate an Evaluation Report PDF
 */
const generateEvaluationReportPDF = async (data, filePath) => {
  return new Promise((resolve, reject) => {
    try {
      const { stage, evaluation, date_generation } = data;
      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);
      
      addHeader(doc, 'RAPPORT D\'ÉVALUATION TECHNIQUE');
      let y = 130;
      
      doc.fontSize(12).fillColor(company.colors.text);
      doc.font('Helvetica-Bold').text(`Stagiaire : ${stage.utilisateur?.nom || stage.nom} ${stage.utilisateur?.prenom || stage.prenom}`, 50, y);
      y += 20;
      doc.font('Helvetica').text(`Période : Du ${new Date(stage.date_demarrage).toLocaleDateString('fr-FR')} au ${new Date(stage.date_fin).toLocaleDateString('fr-FR')}`, 50, y);
      y += 20;
      doc.text(`Tuteur principal : ${stage.tuteur?.nom || ''} ${stage.tuteur?.prenom || 'N/A'}`, 50, y);
      y += 40;
      
      // Résultats
      doc.rect(50, y, 510, 25).fill(company.colors.primary);
      doc.fillColor('#ffffff').font('Helvetica-Bold').text('RÉSULTATS DE L\'ÉVALUATION', 60, y + 7);
      y += 40;
      
      const scores = [
        { label: 'Compétences Techniques', score: evaluation.note_technique, max: 40 },
        { label: 'Qualités Professionnelles', score: evaluation.note_prof, max: 30 },
        { label: 'Communication / Rapport', score: evaluation.note_com, max: 30 }
      ];
      
      scores.forEach(s => {
        doc.fillColor(company.colors.text).font('Helvetica-Bold').text(s.label, 50, y);
        doc.font('Helvetica').text(`${s.score} / ${s.max}`, 480, y, { align: 'right' });
        y += 15;
        doc.rect(50, y, 510, 8).fill('#f3f4f6');
        doc.rect(50, y, (s.score / s.max) * 510, 8).fill(company.colors.primary);
        y += 25;
      });
      
      const total = Number(evaluation.note_technique) + Number(evaluation.note_prof) + Number(evaluation.note_com);
      doc.moveDown(1);
      y = doc.y;
      doc.fontSize(14).font('Helvetica-Bold').text(`NOTE GLOBALE : ${total} / 100`, 50, y, { align: 'center' });
      y += 40;
      
      // Commentaires
      doc.fontSize(12).font('Helvetica-Bold').text('APPRÉCIATION DU TUTEUR', 50, y);
      y += 20;
      doc.font('Helvetica').fontSize(10).text(`Points forts : ${evaluation.points_forts || 'N/A'}`, 60, y, { width: 480 });
      y += 40;
      doc.text(`Axes d'amélioration : ${evaluation.axes_amelioration || 'N/A'}`, 60, y, { width: 480 });
      y += 40;
      
      addFooter(doc);
      doc.end();
      
      stream.on('finish', () => resolve(filePath));
      stream.on('error', reject);
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = {
  generateConventionPDF,
  generateAttestationPDF,
  generatePresencePDF,
  generateEvaluationReportPDF
};
