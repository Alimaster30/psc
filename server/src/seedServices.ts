import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Service from './models/service.model';
import connectDB from './config/db';

dotenv.config();

// Connect to MongoDB
connectDB();

// Prime Skin Care Catalogue data
const services = [
  // FACIALS
  {
    name: 'Simple Hydrafacial',
    description: 'Deeply cleanses and exfoliates the skin. Infuses the skin with hydration and nutrients. Improves skin texture and tone.',
    price: 7000,
    category: 'Facials',
    process: 'Cleansing\nScrubbing\nHydra facial tools:\nScrubber\nAbrasion\nRF\nUltrasound\nCold hammer\nSpray\nPDT Light',
    bundleOptions: [
      { sessions: 3, price: 24000, savings: 4000 }
    ]
  },
  {
    name: 'Silver Hydrafacial',
    description: 'Luxurious 10-step skincare experience. Advanced treatments for radiant skin. Intensive hydration and rejuvenation. Includes cleanings, scrubbing, hydra tools, brightening serum, brightening peel, and mask.',
    price: 9000,
    category: 'Facials',
    process: 'Cleansing\nScrubbing\nHydra facial tools:\nScrubber\nAbrasion\nRF\nUltrasound\nCold hammer\nSpray\nPDT Light\nBrightening serum\nBrightening peel and mask',
    bundleOptions: [
      { sessions: 3, price: 30000, savings: 6000 }
    ]
  },
  {
    name: 'Gold Hydrafacial',
    description: 'Exclusive facial journey. Tailored to individual skin needs. High-end products for ultimate luxury. Includes cleanings, scrubbing, hydra tools, carbon peel, mask, and toner.',
    price: 11000,
    category: 'Facials',
    process: 'Cleansing\nScrubbing\nHydra facial tools:\nScrubber\nAbrasion\nRF\nUltrasound\nCold hammer\nSpray\nPDT Light\nCarbon peel laser\nMask\nToner',
    bundleOptions: [
      { sessions: 3, price: 38000, savings: 6000 }
    ]
  },
  {
    name: 'Korean Hydrafacial (Glass Skin Treatment)',
    description: 'Advance skin treatment for Korean glass skin. All products from cleansing to toner are Korean products. Includes cleanings, exfoliation, neutralizer, hydra tools, brightening serum, Korean collagen mask, and toner.',
    price: 12000,
    category: 'Facials',
    process: 'Cleansing\nExfoliation\nHydra facial tools:\nScrubber\nAbrasion\nRF\nUltrasound\nCold hammer\nSpray\nPDT Light\nKorean collagen mask\nKorean toner'
  },
  {
    name: 'Signature Hydrafacial',
    description: 'Customized hydration treatment. Deeply nourishes and revitalizes skin. Restores moisture balance for radiant complexion. Includes cleanings, scrubbing, hydra tools, brightening serum, brightening peel, and mask.',
    price: 10000,
    category: 'Facials',
    process: 'Cleansing\nScrubbing\nHydra facial tools:\nScrubber\nAbrasion\nRF\nUltrasound\nCold hammer\nSpray\nPDT Light\nCarbon peel laser\nBrightening peel\nJelly mask\nToner',
    bundleOptions: [
      { sessions: 4, price: 30000, savings: 10000 },
      { sessions: 8, price: 60000, savings: 20000 }
    ]
  },
  {
    name: 'Signature Hydra Premium',
    description: 'Premium hydration treatment with BB glow for enhanced results.',
    price: 15000,
    category: 'Facials',
    process: 'Cleansing\nScrubbing\nHydra facial tools:\nScrubber\nAbrasion\nRF\nUltrasound\nCold hammer\nSpray\nPDT Light\nCarbon peel laser\nBB glow\nBrightening peel\nJelly mask\nToner'
  },
  {
    name: 'Party Peel',
    description: 'Quick refreshing treatment perfect before special events.',
    price: 4500,
    category: 'Facials',
    bundleOptions: [
      { sessions: 3, price: 15000, savings: 3000 },
      { sessions: 6, price: 75000, savings: 27000 }
    ]
  },
  {
    name: 'AcneOUT Peel',
    description: 'Specialized treatment targeting acne and breakouts.',
    price: 4500,
    category: 'Facials',
    bundleOptions: [
      { sessions: 3, price: 16000, savings: 3000 },
      { sessions: 6, price: 27000, savings: 21000 }
    ]
  },
  {
    name: 'Exosomes Booster Facial',
    description: 'Advanced anti-aging treatment with exosome technology.',
    price: 40000,
    category: 'Facials',
    bundleOptions: [
      { sessions: 3, price: 110000, savings: 10000 },
      { sessions: 6, price: 220000, savings: 200000 }
    ]
  },
  {
    name: 'Hydra Facial Basic',
    description: 'Basic hydration treatment for all skin types.',
    price: 5000,
    category: 'Facials',
    process: 'Cleansing\nScrubbing\nBrightening peel\nMask'
  },

  // LASER TREATMENTS
  {
    name: 'Carbon Peel/Hollywood Laser',
    description: 'Non-invasive laser treatment for skin rejuvenation.',
    price: 7000,
    category: 'Laser Treatments'
  },
  {
    name: 'Carbon Peel Facial',
    description: 'Combines carbon peel laser with facial treatment for enhanced results.',
    price: 11000,
    category: 'Laser Treatments'
  },
  {
    name: 'Carbon Laser + Microneedling',
    description: 'Combination treatment for improved skin texture and tone.',
    price: 15000,
    category: 'Laser Treatments'
  },
  {
    name: 'Carbon Peel Laser + RF Microneedling',
    description: 'Advanced combination treatment with radiofrequency for skin tightening.',
    price: 20000,
    category: 'Laser Treatments'
  },
  {
    name: 'Carbon Peel Laser + Microneedling Exosomes',
    description: 'Premium treatment combining laser, microneedling and exosome technology.',
    price: 30000,
    category: 'Laser Treatments'
  },

  // CONSULTATIONS
  {
    name: 'Initial Consultation',
    description: 'First-time patient consultation with dermatologist.',
    price: 3000,
    category: 'Consultations'
  },
  {
    name: 'Follow-up Consultation',
    description: 'Follow-up visit with dermatologist.',
    price: 2000,
    category: 'Consultations'
  }
];

// Seed function
const seedServices = async () => {
  try {
    // Clear existing services
    await Service.deleteMany({});
    console.log('Existing services deleted');

    // Insert new services
    await Service.insertMany(services);
    console.log(`${services.length} services inserted successfully`);

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('MongoDB disconnected');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding services:', error);
    process.exit(1);
  }
};

// Run the seed function
seedServices();
