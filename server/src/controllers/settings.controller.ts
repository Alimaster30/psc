import { Request, Response } from 'express';
import Settings from '../models/settings.model';

export const getSettings = async (req: Request, res: Response) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      // Create default settings if not found
      settings = await Settings.create({});
    }
    res.json({ data: settings });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load system settings', error });
  }
};

export const updateSettings = async (req: Request, res: Response) => {
  try {
    const settings = await Settings.findOneAndUpdate({}, req.body, { new: true, upsert: true });
    res.json({ data: settings });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update system settings', error });
  }
}; 