// Common medical terms for autocomplete suggestions

export const commonMedications = [
  // Antibiotics
  'Amoxicillin',
  'Azithromycin',
  'Ciprofloxacin',
  'Doxycycline',
  'Metronidazole',
  'Penicillin',
  'Cephalexin',
  'Clindamycin',
  'Trimethoprim',
  'Sulfamethoxazole',
  
  // Dermatology Medications
  'Acitretin',
  'Adalimumab',
  'Alitretinoin',
  'Azelaic Acid',
  'Benzoyl Peroxide',
  'Betamethasone',
  'Clobetasol',
  'Clotrimazole',
  'Cyclosporine',
  'Desonide',
  'Fluocinonide',
  'Hydrocortisone',
  'Imiquimod',
  'Isotretinoin',
  'Ketoconazole',
  'Methotrexate',
  'Minocycline',
  'Mometasone',
  'Mupirocin',
  'Nystatin',
  'Prednisolone',
  'Salicylic Acid',
  'Tacrolimus',
  'Tazarotene',
  'Tretinoin',
  'Triamcinolone',
  
  // Antihistamines/Allergy
  'Cetirizine',
  'Desloratadine',
  'Diphenhydramine',
  'Fexofenadine',
  'Loratadine',
  
  // Pain Medications
  'Acetaminophen',
  'Ibuprofen',
  'Naproxen',
  'Tramadol',
  'Codeine',
  
  // Others
  'Amlodipine',
  'Atorvastatin',
  'Levothyroxine',
  'Lisinopril',
  'Metformin',
  'Omeprazole',
  'Simvastatin'
];

export const commonDiagnoses = [
  // Dermatological Conditions
  'Acne Vulgaris',
  'Actinic Keratosis',
  'Alopecia Areata',
  'Atopic Dermatitis',
  'Basal Cell Carcinoma',
  'Cellulitis',
  'Contact Dermatitis',
  'Dermatitis Herpetiformis',
  'Eczema',
  'Erythema Multiforme',
  'Folliculitis',
  'Fungal Infection',
  'Hidradenitis Suppurativa',
  'Impetigo',
  'Keratosis Pilaris',
  'Lichen Planus',
  'Lupus',
  'Melanoma',
  'Melasma',
  'Moles (Nevus)',
  'Molluscum Contagiosum',
  'Pemphigus',
  'Perioral Dermatitis',
  'Pityriasis Rosea',
  'Psoriasis',
  'Rosacea',
  'Scabies',
  'Seborrheic Dermatitis',
  'Seborrheic Keratosis',
  'Shingles (Herpes Zoster)',
  'Squamous Cell Carcinoma',
  'Tinea Corporis (Ringworm)',
  'Tinea Pedis (Athlete\'s Foot)',
  'Urticaria (Hives)',
  'Vitiligo',
  'Warts'
];

export const commonAllergies = [
  // Common Allergies
  'Amoxicillin',
  'Aspirin',
  'Bee Stings',
  'Cat Dander',
  'Cephalosporins',
  'Dairy',
  'Dog Dander',
  'Dust Mites',
  'Eggs',
  'Fish',
  'Ibuprofen',
  'Latex',
  'Mold',
  'Nuts',
  'Penicillin',
  'Pollen',
  'Shellfish',
  'Soy',
  'Sulfa Drugs',
  'Wheat'
];

export const commonTreatmentOptions = [
  // Treatment Options
  'Topical Steroid',
  'Oral Antibiotic',
  'Topical Retinoid',
  'Antifungal Cream',
  'Antihistamine',
  'Phototherapy',
  'Immunosuppressant',
  'Corticosteroid Injection',
  'Emollient',
  'Cryotherapy',
  'Patch Testing',
  'Biopsy',
  'Excision',
  'Laser Therapy',
  'Chemical Peel',
  'Moisturizer',
  'Antibacterial Soap'
];

export const commonMedicalTerms = {
  // Combine all categories for general search
  medications: commonMedications,
  diagnoses: commonDiagnoses,
  allergies: commonAllergies,
  treatments: commonTreatmentOptions,
  
  // Function to get suggestions for a specific category
  getSuggestions: (category: 'medications' | 'diagnoses' | 'allergies' | 'treatments') => {
    switch (category) {
      case 'medications':
        return commonMedications;
      case 'diagnoses':
        return commonDiagnoses;
      case 'allergies':
        return commonAllergies;
      case 'treatments':
        return commonTreatmentOptions;
      default:
        return [...commonMedications, ...commonDiagnoses, ...commonAllergies, ...commonTreatmentOptions];
    }
  },
  
  // Function to get medical history suggestions
  getMedicalHistorySuggestions: () => {
    return [
      'No significant medical history',
      'No known allergies',
      'History of hypertension',
      'History of diabetes',
      'History of asthma',
      'Previous skin cancer',
      'Family history of melanoma',
      'History of eczema since childhood',
      'Previous dermatological procedures',
      'Current immunosuppressive therapy'
    ];
  }
};

// Function to save and retrieve user-specific terms for autocomplete learning
export const userSpecificTerms = {
  // Save a term to localStorage
  saveUserTerm: (category: string, term: string) => {
    try {
      const storageKey = `user_terms_${category}`;
      const existingTerms = localStorage.getItem(storageKey);
      let terms = existingTerms ? JSON.parse(existingTerms) : [];
      
      // Only add if it doesn't already exist
      if (!terms.includes(term)) {
        terms.push(term);
        // Keep only the most recent 50 terms
        if (terms.length > 50) {
          terms = terms.slice(terms.length - 50);
        }
        localStorage.setItem(storageKey, JSON.stringify(terms));
      }
    } catch (error) {
      console.error('Error saving user term:', error);
    }
  },
  
  // Get user-specific terms for a category
  getUserTerms: (category: string): string[] => {
    try {
      const storageKey = `user_terms_${category}`;
      const terms = localStorage.getItem(storageKey);
      return terms ? JSON.parse(terms) : [];
    } catch (error) {
      console.error('Error getting user terms:', error);
      return [];
    }
  },
  
  // Get combined suggestions (common + user specific)
  getCombinedSuggestions: (category: 'medications' | 'diagnoses' | 'allergies' | 'treatments') => {
    const commonTerms = commonMedicalTerms.getSuggestions(category);
    const userTerms = userSpecificTerms.getUserTerms(category);
    
    // Combine and remove duplicates
    return [...new Set([...commonTerms, ...userTerms])];
  }
}; 