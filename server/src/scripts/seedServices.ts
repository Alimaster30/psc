import mongoose from 'mongoose';
import Service from '../models/service.model';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/pakskincare');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error}`);
    process.exit(1);
  }
};

// Sample services data
const services = [
  {
    name: 'Basic Skin Consultation',
    description: 'Initial consultation with a dermatologist to assess skin conditions and recommend treatments.',
    price: 50,
    category: 'Consultation',
  },
  {
    name: 'Follow-up Consultation',
    description: 'Follow-up appointment to monitor progress and adjust treatment plans.',
    price: 30,
    category: 'Consultation',
  },
  {
    name: 'Acne Treatment',
    description: 'Specialized treatment for acne including extraction and medication.',
    price: 75,
    category: 'Medical',
  },
  {
    name: 'Eczema Management',
    description: 'Treatment and management plan for eczema and related conditions.',
    price: 80,
    category: 'Medical',
  },
  {
    name: 'Psoriasis Treatment',
    description: 'Specialized treatment for psoriasis including light therapy and medication.',
    price: 90,
    category: 'Medical',
  },
  {
    name: 'Skin Cancer Screening',
    description: 'Comprehensive screening for skin cancer and precancerous lesions.',
    price: 100,
    category: 'Medical',
  },
  {
    name: 'Mole Removal',
    description: 'Removal of benign moles for cosmetic or medical reasons.',
    price: 120,
    category: 'Surgical',
  },
  {
    name: 'Wart Removal',
    description: 'Removal of warts using cryotherapy or other methods.',
    price: 85,
    category: 'Surgical',
  },
  {
    name: 'Skin Tag Removal',
    description: 'Quick removal of skin tags for cosmetic purposes.',
    price: 70,
    category: 'Surgical',
  },
  {
    name: 'Botox Injection',
    description: 'Botox injections to reduce the appearance of wrinkles and fine lines.',
    price: 250,
    category: 'Cosmetic',
  },
  {
    name: 'Dermal Fillers',
    description: 'Injectable fillers to restore volume and fullness to the face.',
    price: 300,
    category: 'Cosmetic',
  },
  {
    name: 'Chemical Peel',
    description: 'Chemical solution applied to the skin to remove damaged outer layers.',
    price: 150,
    category: 'Cosmetic',
  },
  {
    name: 'Microdermabrasion',
    description: 'Minimally invasive procedure to renew overall skin tone and texture.',
    price: 120,
    category: 'Cosmetic',
  },
  {
    name: 'Laser Hair Removal',
    description: 'Permanent reduction of unwanted hair using laser technology.',
    price: 200,
    category: 'Cosmetic',
    bundleOptions: [
      { sessions: 3, price: 540, savings: 60 },
      { sessions: 6, price: 1020, savings: 180 },
    ],
  },
  {
    name: 'Carbon Peel/Hollywood Laser',
    description: 'Non-invasive laser treatment for skin rejuvenation.',
    price: 170,
    category: 'Cosmetic',
  },
  {
    name: 'Laser Skin Resurfacing',
    description: 'Laser treatment to improve skin texture, tone, and appearance.',
    price: 350,
    category: 'Cosmetic',
  },
  {
    name: 'PRP Therapy',
    description: 'Platelet-rich plasma therapy for skin rejuvenation and hair loss.',
    price: 400,
    category: 'Advanced',
  },
  {
    name: 'Scar Revision',
    description: 'Treatment to improve the appearance of scars from surgery, injury, or acne.',
    price: 250,
    category: 'Advanced',
  },
  {
    name: 'Hyperpigmentation Treatment',
    description: 'Treatment for dark spots and uneven skin tone.',
    price: 180,
    category: 'Advanced',
  },
  {
    name: 'Rosacea Management',
    description: 'Specialized treatment for rosacea symptoms and flare-ups.',
    price: 120,
    category: 'Medical',
  },
];

// Seed services to database
const seedServices = async () => {
  try {
    // Clear existing services
    await Service.deleteMany({});
    console.log('Deleted existing services');

    // Insert new services
    const createdServices = await Service.insertMany(services);
    console.log(`Added ${createdServices.length} services to the database`);

    return createdServices;
  } catch (error) {
    console.error(`Error seeding services: ${error}`);
    process.exit(1);
  }
};

// Main function
const main = async () => {
  const conn = await connectDB();
  await seedServices();
  console.log('Services seeded successfully!');
  await mongoose.disconnect();
  console.log('MongoDB disconnected');
};

// Run the script
main();
