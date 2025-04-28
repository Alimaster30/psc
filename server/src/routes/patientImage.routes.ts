import express from 'express';
import multer from 'multer';
import { 
  getAllPatientImages, 
  getPatientImageById, 
  uploadPatientImage, 
  updatePatientImage, 
  deletePatientImage,
  getBeforeAfterPairs
} from '../controllers/patientImage.controller';
import { protect } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/auth.middleware';
import { UserRole } from '../models/user.model';

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Routes
router.get('/', protect, getAllPatientImages);
router.get('/:id', protect, getPatientImageById);
router.post('/', protect, upload.single('image'), uploadPatientImage);
router.put('/:id', protect, updatePatientImage);
router.delete('/:id', protect, authorize(UserRole.ADMIN, UserRole.DERMATOLOGIST), deletePatientImage);
router.get('/patient/:patientId/before-after', protect, getBeforeAfterPairs);

export default router;
