/**
 * Configuration: Company Branding & Contact Info
 * Used for PDF generation and Emails
 */

module.exports = {
  name: 'CSM GIAS / GIAS Industries',
  group: 'HMS (Horizon Management Services)',
  address: 'Zone Industrielle de Bouargoub',
  city: 'Nabeul 8040',
  country: 'Tunisie',
  phone: '(+216) 29 009 632',
  email: 'info.rh@csmgias.com.tn',
  website: 'https://www.csmgias.com.tn',
  logoText: 'GIAS / CSM',
  
  // Specific Entity Info
  entities: {
    GIAS_INDUSTRIES: {
      fullName: 'GIAS Industries',
      description: 'Fabrication de margarine et produits agroalimentaires'
    },
    CSM_GIAS: {
      fullName: 'CSM GIAS Ingredients',
      description: 'Ingrédients pour la boulangerie et la pâtisserie'
    }
  },
  
  // PDF Styling
  colors: {
    primary: '#1e40af', // Royal Blue
    secondary: '#374151',
    text: '#1f2937',
    muted: '#6b7280',
    light: '#f3f4f6'
  }
};
