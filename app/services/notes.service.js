const { MoleculerError } = require('moleculer').Errors;
const Note = require('../models/note.model.js');

module.exports = {
  name: 'notes',
  actions: {
    list: {
      rest: 'GET /',
      async handler(ctx) {
        const notes = await Note.find({});
        return notes;
      }
    },

    get: {
      cache: {
        keys: ['id']
      },
      rest: 'GET /:id',
      async handler(ctx) {
        const post = await this.findByID(ctx.params.id);
        return post;
      }
    },

    create: {
      rest: 'POST /',
      async handler(ctx) {
        const note = this.createNote(ctx.params);
        this.clearCache();
        return { message: 'Successfully created a note', note };
      }
    },

    update: {
      rest: 'PUT /:id',
      async handler(ctx) {
        const data = { ...ctx.params };
        delete data['id'];
        const note = this.updateNote(data, ctx.params.id);
        this.clearCache();
        return note;
      }
    },
    remove: {
      rest: 'DELETE /:id',
      async handler(ctx) {
        await this.deleteNote(ctx.params.id);
        const notes = await Note.find({});
        this.clearCache();
        return notes;
      }
    }
  },

  methods: {
    async findByID(id) {
      const note = await Note.findById(id);
      if (!note) {
        return Promise.reject(
          new MoleculerError('Note not found with id ' + id, 404)
        );
      }
      return note;
    },
    async createNote({ content, title }) {
      // Validate request
      if (!content) {
        return Promise.reject(
          new MoleculerError('Note content can not be empty', 400)
        );
      }

      // Create a Note
      const note = new Note({
        title: title || 'Untitled Note',
        content
      });

      // Save Note in the database
      try {
        const newNote = await note.save();
        return newNote;
      } catch (error) {
        return Promise.reject(
          new MoleculerError(
            err.message || 'Some error occurred while creating the Note.',
            400
          )
        );
      }
    },
    async updateNote(data, id) {
      try {
        // Find note and update it with the request body
        const note = await Note.findByIdAndUpdate(id, data, { new: true });
        return note;
      } catch (error) {
        if (error.kind === 'ObjectId') {
          return Promise.reject(
            new MoleculerError('Note not found with id ' + id, 404)
          );
        }
        return Promise.reject(
          new MoleculerError('Error updating note with id ' + id, 404)
        );
      }
    },
    async deleteNote(id) {
      try {
        // Find note and update it with the request body
        const note = await Note.findByIdAndDelete(id);
        return note;
      } catch (error) {
        if (error.kind === 'ObjectId') {
          return Promise.reject(
            new MoleculerError('Note not found with id ' + id, 404)
          );
        }
        return Promise.reject(
          new MoleculerError('Error deleting note with id ' + id, 404)
        );
      }
    },

    clearCache() {
      this.broker.broadcast('cache.clean', this.name + '.*');
    }
  }
};
