import { Request, Response } from 'express';
import PatientImage from '../models/patientImage.model';
import Patient from '../models/patient.model';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads');
const patientImagesDir = path.join(uploadsDir, 'patient-images');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

if (!fs.existsSync(patientImagesDir)) {
  fs.mkdirSync(patientImagesDir);
}

// Get all patient images
export const getAllPatientImages = async (req: Request, res: Response) => {
  try {
    const { patient, category, isBefore } = req.query;
    const filter: any = {};

    if (patient) {
      filter.patient = patient;
    }

    if (category) {
      filter.category = category;
    }

    if (isBefore !== undefined) {
      filter.isBefore = isBefore === 'true';
    }

    const patientImages = await PatientImage.find(filter)
      .populate('patient', 'firstName lastName')
      .populate('uploadedBy', 'firstName lastName')
      .sort({ uploadedAt: -1 });

    res.status(200).json({
      success: true,
      count: patientImages.length,
      data: patientImages,
    });
  } catch (error) {
    console.error('Error getting patient images:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    });
  }
};

// Get patient image by ID
export const getPatientImageById = async (req: Request, res: Response) => {
  try {
    const patientImage = await PatientImage.findById(req.params.id)
      .populate('patient', 'firstName lastName')
      .populate('uploadedBy', 'firstName lastName')
      .populate('relatedImages');

    if (!patientImage) {
      return res.status(404).json({
        success: false,
        message: 'Patient image not found',
      });
    }

    res.status(200).json({
      success: true,
      data: patientImage,
    });
  } catch (error) {
    console.error('Error getting patient image:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    });
  }
};

// Upload patient image
export const uploadPatientImage = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    const { patientId, category, description, tags, isBefore, relatedImageId } = req.body;

    // Check if patient exists
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found',
      });
    }

    // Generate unique filename
    const fileExtension = path.extname(req.file.originalname);
    const filename = `${uuidv4()}${fileExtension}`;
    const thumbnailFilename = `${uuidv4()}_thumb${fileExtension}`;

    // Save original image
    const imagePath = path.join(patientImagesDir, filename);
    try {
      fs.writeFileSync(imagePath, req.file.buffer);
    } catch (error) {
      console.error('Error saving image file:', error);
      throw new Error('Failed to save image file');
    }

    // Generate thumbnail
    const thumbnailPath = path.join(patientImagesDir, thumbnailFilename);
    try {
      await sharp(req.file.buffer)
        .resize(200, 200, { fit: 'inside' })
        .toFile(thumbnailPath);
    } catch (error) {
      console.error('Error generating thumbnail:', error);
      // Clean up the original image if thumbnail generation fails
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
      throw new Error('Failed to generate thumbnail');
    }

    // Get image dimensions
    const metadata = await sharp(req.file.buffer).metadata();

    // Create new patient image record
    const newPatientImage = new PatientImage({
      patient: patientId,
      imageUrl: `/uploads/patient-images/${filename}`,
      thumbnailUrl: `/uploads/patient-images/${thumbnailFilename}`,
      category,
      description: description || '',
      uploadedBy: req.user.id,
      tags: tags ? tags.split(',').map((tag: string) => tag.trim()) : [],
      metadata: {
        originalFilename: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        width: metadata.width,
        height: metadata.height,
      },
      isBefore: isBefore === 'true',
    });

    // If this is an "after" image and there's a related "before" image
    if (relatedImageId && isBefore === 'false') {
      const beforeImage = await PatientImage.findById(relatedImageId);
      if (beforeImage && beforeImage.isBefore) {
        newPatientImage.relatedImages = [beforeImage._id];
        
        // Update the "before" image to link to this "after" image
        await PatientImage.findByIdAndUpdate(relatedImageId, {
          $push: { relatedImages: newPatientImage._id },
        });
      }
    }

    await newPatientImage.save();

    res.status(201).json({
      success: true,
      data: newPatientImage,
    });
  } catch (error: any) {
    console.error('Error uploading patient image:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'An error occurred while processing the image',
    });
  }
};

// Update patient image
export const updatePatientImage = async (req: Request, res: Response) => {
  try {
    const { category, description, tags, isBefore, relatedImageId } = req.body;
    
    // Find the patient image
    const patientImage = await PatientImage.findById(req.params.id);
    if (!patientImage) {
      return res.status(404).json({
        success: false,
        message: 'Patient image not found',
      });
    }

    // Update fields
    if (category) patientImage.category = category;
    if (description !== undefined) patientImage.description = description;
    if (tags) patientImage.tags = tags.split(',').map((tag: string) => tag.trim());
    if (isBefore !== undefined) patientImage.isBefore = isBefore === 'true';

    // Handle related images
    if (relatedImageId && isBefore === 'false') {
      // If this is an "after" image and there's a new related "before" image
      const beforeImage = await PatientImage.findById(relatedImageId);
      if (beforeImage && beforeImage.isBefore) {
        // Remove this image from any previous related images
        if (patientImage.relatedImages && patientImage.relatedImages.length > 0) {
          for (const oldRelatedId of patientImage.relatedImages) {
            await PatientImage.findByIdAndUpdate(oldRelatedId, {
              $pull: { relatedImages: patientImage._id },
            });
          }
        }

        // Set new related image
        patientImage.relatedImages = [beforeImage._id];
        
        // Update the "before" image to link to this "after" image
        await PatientImage.findByIdAndUpdate(relatedImageId, {
          $addToSet: { relatedImages: patientImage._id },
        });
      }
    }

    await patientImage.save();

    res.status(200).json({
      success: true,
      data: patientImage,
    });
  } catch (error: any) {
    console.error('Error updating patient image:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'An error occurred while updating the image',
    });
  }
};

// Delete patient image
export const deletePatientImage = async (req: Request, res: Response) => {
  try {
    const patientImage = await PatientImage.findById(req.params.id);
    
    if (!patientImage) {
      return res.status(404).json({
        success: false,
        message: 'Patient image not found',
      });
    }

    // Remove image files
    const imagePath = path.join(__dirname, '..', '..', patientImage.imageUrl);
    const thumbnailPath = path.join(__dirname, '..', '..', patientImage.thumbnailUrl);

    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    if (fs.existsSync(thumbnailPath)) {
      fs.unlinkSync(thumbnailPath);
    }

    // Remove references from related images
    if (patientImage.relatedImages && patientImage.relatedImages.length > 0) {
      for (const relatedId of patientImage.relatedImages) {
        await PatientImage.findByIdAndUpdate(relatedId, {
          $pull: { relatedImages: patientImage._id },
        });
      }
    }

    // Delete the record
    await PatientImage.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Patient image deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting patient image:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'An error occurred while deleting the image',
    });
  }
};

// Get before/after image pairs for a patient
export const getBeforeAfterPairs = async (req: Request, res: Response) => {
  try {
    const { patientId } = req.params;

    // Find all images for this patient
    const allImages = await PatientImage.find({
      patient: patientId,
    }).sort({ uploadedAt: 1 });

    console.log('🔍 All images for patient:', allImages.length);

    // Group images by category
    const imagesByCategory: Record<string, { before: any[], after: any[] }> = {};

    allImages.forEach(image => {
      if (!imagesByCategory[image.category]) {
        imagesByCategory[image.category] = { before: [], after: [] };
      }

      if (image.isBefore) {
        imagesByCategory[image.category].before.push(image);
      } else {
        imagesByCategory[image.category].after.push(image);
      }
    });

    console.log('📊 Images by category:', Object.keys(imagesByCategory));

    // Create pairs from categories that have both before and after images
    const pairs: any[] = [];

    Object.entries(imagesByCategory).forEach(([category, images]) => {
      if (images.before.length > 0) {
        // For each before image, create a pair
        images.before.forEach(beforeImage => {
          pairs.push({
            before: beforeImage,
            after: images.after.length > 0 ? images.after : null,
          });
        });
      }
    });

    console.log('🎯 Created pairs:', pairs.length);

    res.status(200).json({
      success: true,
      count: pairs.length,
      data: pairs,
    });
  } catch (error: any) {
    console.error('Error getting before/after pairs:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'An error occurred while getting before/after pairs',
    });
  }
};
