'use strict';
const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Gadgets', [
      {
        id: uuidv4(),
        name: 'Explosive Pen',
        status: 'Available',
        codename: 'PEN-001',
        decommissionedAt: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        name: 'Invisible Car',
        status: 'Deployed',
        codename: 'CAR-007',
        decommissionedAt: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        name: 'Laser Watch',
        status: 'Available',
        codename: 'WATCH-003',
        decommissionedAt: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        name: 'Jetpack',
        status: 'Destroyed',
        codename: 'PACK-009',
        decommissionedAt: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        name: 'X-Ray Glasses',
        status: 'Decommissioned',
        codename: 'GLASS-005',
        decommissionedAt: new Date('2024-01-15'),
        createdAt: new Date('2023-06-10'),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Gadgets', null, {});
  }
};
