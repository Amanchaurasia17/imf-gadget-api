const express = require('express');
const { Gadget, sequelize } = require('../models');
const { Op } = require('sequelize');
const router = express.Router();

const validateGadget = (req, res, next) => {
    const { name, codename, status } = req.body;
    const errors = [];

    if (!name || name.trim().length === 0) {
        errors.push('Name is required');
    }
    if (!codename || codename.trim().length === 0) {
        errors.push('Codename is required');
    }
    if (status && !['Available', 'Deployed', 'Destroyed', 'Decommissioned'].includes(status)) {
        errors.push('Status must be one of: Available, Deployed, Destroyed, Decommissioned');
    }

    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }
    
    next();
};

router.get('/stats', async (req, res) => {
    try {
        const stats = await Gadget.findAll({
            attributes: [
                'status',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            group: ['status']
        });

        const totalGadgets = await Gadget.count();
        
        const formattedStats = {
            total: totalGadgets,
            byStatus: stats.reduce((acc, stat) => {
                acc[stat.status] = parseInt(stat.dataValues.count);
                return acc;
            }, {})
        };

        res.json(formattedStats);
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({
            error: 'Failed to fetch statistics',
            message: 'Internal server error'
        });
    }
});

router.get('/stats/summary', async (req, res) => {
    try {
        const stats = await Gadget.findAll({
            attributes: [
                'status',
                [sequelize.fn('COUNT', sequelize.col('status')), 'count']
            ],
            group: ['status'],
            raw: true
        });
        
        const total = await Gadget.count();
        
        const summary = {
            total,
            byStatus: stats.reduce((acc, stat) => {
                acc[stat.status] = parseInt(stat.count);
                return acc;
            }, {})
        };
        
        res.json({ summary });
    } catch (error) {
        console.error('Error fetching gadget statistics:', error);
        res.status(500).json({ 
            error: 'Failed to fetch statistics',
            message: error.message 
        });
    }
});

router.get('/', async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            status, 
            search,
            sortBy = 'createdAt',
            sortOrder = 'DESC'
        } = req.query;

        const offset = (page - 1) * limit;
        const whereClause = {};

       
        if (status) {
            whereClause.status = status;
        }

        
        if (search) {
            whereClause[Op.or] = [
                { name: { [Op.iLike]: `%${search}%` } },
                { codename: { [Op.iLike]: `%${search}%` } }
            ];
        }

        const { count, rows } = await Gadget.findAndCountAll({
            where: whereClause,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [[sortBy, sortOrder.toUpperCase()]],
            attributes: ['id', 'name', 'status', 'codename', 'decommissionedAt', 'createdAt', 'updatedAt']
        });

        const totalPages = Math.ceil(count / limit);

        res.json({
            gadgets: rows,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalItems: count,
                itemsPerPage: parseInt(limit),
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
            }
        });
    } catch (error) {
        console.error('Error fetching gadgets:', error);
        res.status(500).json({ 
            error: 'Failed to fetch gadgets',
            message: error.message 
        });
    }
});


router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const gadget = await Gadget.findByPk(id, {
            attributes: ['id', 'name', 'status', 'codename', 'decommissionedAt', 'createdAt', 'updatedAt']
        });
        
        if (!gadget) {
            return res.status(404).json({ 
                error: 'Gadget not found',
                message: `No gadget found with ID: ${id}`
            });
        }
        
        res.json({ gadget });
    } catch (error) {
        console.error('Error fetching gadget:', error);
        res.status(500).json({ 
            error: 'Failed to fetch gadget',
            message: error.message 
        });
    }
});

router.post('/', validateGadget, async (req, res) => {
    try {
        const { name, codename, status = 'Available' } = req.body;
        
        const existingGadget = await Gadget.findOne({
            where: { codename }
        });
        
        if (existingGadget) {
            return res.status(409).json({
                error: 'Codename already exists',
                message: `A gadget with codename '${codename}' already exists`
            });
        }
        
        const gadget = await Gadget.create({
            name: name.trim(),
            codename: codename.trim(),
            status
        });
        
        res.status(201).json({
            message: 'Gadget created successfully',
            gadget: {
                id: gadget.id,
                name: gadget.name,
                status: gadget.status,
                codename: gadget.codename,
                decommissionedAt: gadget.decommissionedAt,
                createdAt: gadget.createdAt,
                updatedAt: gadget.updatedAt
            }
        });
    } catch (error) {
        console.error('Error creating gadget:', error);
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                error: 'Validation error',
                message: error.errors.map(err => err.message)
            });
        }
        res.status(500).json({ 
            error: 'Failed to create gadget',
            message: error.message 
        });
    }
});

router.put('/:id', validateGadget, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, codename, status } = req.body;
        
        const gadget = await Gadget.findByPk(id);
        if (!gadget) {
            return res.status(404).json({ 
                error: 'Gadget not found',
                message: `No gadget found with ID: ${id}`
            });
        }
        
        if (codename && codename !== gadget.codename) {
            const existingGadget = await Gadget.findOne({
                where: { 
                    codename,
                    id: { [Op.ne]: id }
                }
            });
            
            if (existingGadget) {
                return res.status(409).json({
                    error: 'Codename already exists',
                    message: `A gadget with codename '${codename}' already exists`
                });
            }
        }
        
        let updateData = {
            name: name.trim(),
            codename: codename.trim(),
            status
        };
        
        if (status === 'Decommissioned' && gadget.status !== 'Decommissioned') {
            updateData.decommissionedAt = new Date();
        } else if (status !== 'Decommissioned') {
            updateData.decommissionedAt = null;
        }
        
        await gadget.update(updateData);
        
        res.json({
            message: 'Gadget updated successfully',
            gadget: {
                id: gadget.id,
                name: gadget.name,
                status: gadget.status,
                codename: gadget.codename,
                decommissionedAt: gadget.decommissionedAt,
                createdAt: gadget.createdAt,
                updatedAt: gadget.updatedAt
            }
        });
    } catch (error) {
        console.error('Error updating gadget:', error);
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                error: 'Validation error',
                message: error.errors.map(err => err.message)
            });
        }
        res.status(500).json({ 
            error: 'Failed to update gadget',
            message: error.message 
        });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const gadget = await Gadget.findByPk(id);
        if (!gadget) {
            return res.status(404).json({ 
                error: 'Gadget not found',
                message: `No gadget found with ID: ${id}`
            });
        }
        
        await gadget.destroy();
        
        res.json({
            message: 'Gadget deleted successfully',
            deletedGadget: {
                id: gadget.id,
                name: gadget.name,
                codename: gadget.codename
            }
        });
    } catch (error) {
        console.error('Error deleting gadget:', error);
        res.status(500).json({ 
            error: 'Failed to delete gadget',
            message: error.message 
        });
    }
});

router.patch('/:id/decommission', async (req, res) => {
    try {
        const { id } = req.params;
        
        const gadget = await Gadget.findByPk(id);
        if (!gadget) {
            return res.status(404).json({ 
                error: 'Gadget not found',
                message: `No gadget found with ID: ${id}`
            });
        }
        
        if (gadget.status === 'Decommissioned') {
            return res.status(400).json({
                error: 'Gadget already decommissioned',
                message: 'This gadget has already been decommissioned'
            });
        }
        
        await gadget.update({
            status: 'Decommissioned',
            decommissionedAt: new Date()
        });
        
        res.json({
            message: 'Gadget decommissioned successfully',
            gadget: {
                id: gadget.id,
                name: gadget.name,
                status: gadget.status,
                codename: gadget.codename,
                decommissionedAt: gadget.decommissionedAt,
                createdAt: gadget.createdAt,
                updatedAt: gadget.updatedAt
            }
        });
    } catch (error) {
        console.error('Error decommissioning gadget:', error);
        res.status(500).json({ 
            error: 'Failed to decommission gadget',
            message: error.message 
        });
    }
});

module.exports = router;
