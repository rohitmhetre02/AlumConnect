const CalendarNote = require('../models/CalendarNote');

const calendarController = {
  // Get calendar notes for a user
  getNotes: async (req, res) => {
    try {
      const { userId } = req.params;
      const notes = await CalendarNote.find({ userId }).sort({ date: 1 });
      res.json({ data: notes });
    } catch (error) {
      console.error('Get calendar notes error:', error);
      res.status(500).json({ message: 'Failed to fetch calendar notes' });
    }
  },

  // Add a new calendar note
  addNote: async (req, res) => {
    try {
      const { userId, date, category, noteText } = req.body;
      
      // Check if note already exists for this date and user
      const existingNote = await CalendarNote.findOne({ userId, date });
      if (existingNote) {
        return res.status(400).json({ message: 'Note already exists for this date' });
      }

      const newNote = new CalendarNote({
        userId,
        date,
        category,
        noteText
      });

      const savedNote = await newNote.save();
      res.json({ data: savedNote });
    } catch (error) {
      console.error('Add calendar note error:', error);
      res.status(500).json({ message: 'Failed to add calendar note' });
    }
  },

  // Update a calendar note
  updateNote: async (req, res) => {
    try {
      const { noteId } = req.params;
      const { category, noteText } = req.body;
      
      const updatedNote = await CalendarNote.findByIdAndUpdate(
        noteId,
        { category, noteText, updatedAt: new Date() },
        { new: true, runValidators: true }
      );

      if (!updatedNote) {
        return res.status(404).json({ message: 'Note not found' });
      }

      res.json({ data: updatedNote });
    } catch (error) {
      console.error('Update calendar note error:', error);
      res.status(500).json({ message: 'Failed to update calendar note' });
    }
  },

  // Delete a calendar note
  deleteNote: async (req, res) => {
    try {
      const { noteId } = req.params;
      
      const deletedNote = await CalendarNote.findByIdAndDelete(noteId);
      
      if (!deletedNote) {
        return res.status(404).json({ message: 'Note not found' });
      }

      res.json({ message: 'Note deleted successfully' });
    } catch (error) {
      console.error('Delete calendar note error:', error);
      res.status(500).json({ message: 'Failed to delete calendar note' });
    }
  }
}

module.exports = calendarController
