
const Mongoose = require('mongoose');
const Joi = require('joi');

// Setup Mongoos
Mongoose.connect(process.env.MONGODB_URI);
const constactDb = Mongoose.connection;
constactDb.on('error', (err) => {
  console.error('[Mongoose Error] %s', err);
  process.exit(1);
});

// Contact Schema
let contactSchema = Mongoose.Schema({
    first_name: String,
    last_name: String,
    email: String,
    telephone: {
      home: String,
      work: String,
      mobile: String
    }
});
let Contacts = Mongoose.model('Contacts', contactSchema);

// Validation object for all user data
const validateContactPayload = {
  first_name: Joi.string().required(),
  last_name:Joi.string().required(),
  email: Joi.string().email().required(),
  telephone: {
    home: Joi.string().regex(/^\+[0-9]+$/),
    work: Joi.string().regex(/^\+[0-9]+$/),
    mobile: Joi.string().regex(/^\+[0-9]+$/),
  }
};

// Get single contact
const getContactById = (id, reply) => {
  Contacts.findById({ _id: id}, (err, contacts) => {
    if (err) return console.error(err);
    reply({ data: contacts })
  })
};

module.exports = [
  // List all nodes
  {
    method: 'GET',
    path: '/contact',
    config: {
      description: 'List all contacts',
      tags: ['api'],
      handler: (request, reply) => {
        Contacts.find((err, contacts) => {
          if (err) return console.error(err);
          reply({ data: contacts })
        })
      }
    }
  },
  // Create new contact
  {
    method: 'POST',
    path: '/contact',
    config: {
      description: 'Create new contact',
      tags: ['api'],
      handler: (request, reply) => {
        let contact = new Contacts(request.payload);
        reply(contact.save());
      },
      validate: {
        payload: validateContactPayload
      }
    }
  },
  // Get specific contact
  {
    method: 'GET',
    path: '/contact/{contactId}',
    config: {
      description: 'Get specific contact',
      tags: ['api'],
      handler: (request, reply) => {
        getContactById(request.params.contactId, reply);
      },
      validate: {
        params: {
          contactId: Joi.string().alphanum().required()
        }
      }
    }
  },
  // Update specific contact
  {
    method: 'PUT',
    path: '/contact/{contactId}',
    config: {
      description: 'Update specific contact',
      tags: ['api'],
      handler: (request, reply) => {
        Contacts.update(
          { _id: request.params.contactId},
          request.payload,
          (err, contacts) => {
          if (err) return console.error(err);
          getContactById(request.params.contactId, reply);
        })
      },
      validate: {
        params: {
          contactId: Joi.string().alphanum().required()
        },
        payload: validateContactPayload
      }
    }
  },
]
