import pool from '../config/db.js';

/**
 * 1. Get All Services (Admin / Manager / Agent / Operator)
 * GET /api/services
 */
export const getServices = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT id, name, code, description, display_order as displayOrder, is_active as isActive, created_at as createdAt
      FROM services
      ORDER BY display_order ASC, id ASC
    `);

    const formatted = rows.map(r => ({
      id: r.id.toString(),
      name: r.name,
      code: r.code,
      fee: 50.00, // Standard service agent fee
      description: r.description || 'Government & Citizen Portal Service',
      category: 'Citizen Portal Services',
      isActive: Boolean(r.isActive),
      createdAt: r.createdAt
    }));

    return res.status(200).json({
      status: 'success',
      data: formatted
    });
  } catch (error) {
    console.error('Get Services Error:', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * 2. Add New Service (Admin / Manager)
 * POST /api/services
 */
export const addService = async (req, res) => {
  try {
    const { name, code, fee, description, category } = req.body;

    if (!name) {
      return res.status(400).json({ status: 'error', message: 'Service name is required.' });
    }

    const serviceCode = code || `SRV-${Date.now()}`;

    // Category ID fallback (1)
    const [result] = await pool.query(
      `INSERT INTO services (category_id, name, code, description, is_active)
       VALUES (1, ?, ?, ?, true)`,
      [name, serviceCode, description || `${name} Portal Service`]
    );

    return res.status(201).json({
      status: 'success',
      message: `Service "${name}" created successfully!`,
      data: {
        id: result.insertId.toString(),
        name,
        code: serviceCode,
        fee: fee || 50.00,
        description: description || `${name} Portal Service`,
        category: category || 'Citizen Services',
        isActive: true
      }
    });
  } catch (error) {
    console.error('Add Service Error:', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * 3. Toggle Service Active Status
 * PATCH /api/services/:id/toggle
 */
export const toggleService = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query('SELECT is_active FROM services WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Service not found.' });
    }

    const newStatus = !rows[0].is_active;
    await pool.query('UPDATE services SET is_active = ? WHERE id = ?', [newStatus, id]);

    return res.status(200).json({
      status: 'success',
      message: `Service status updated to ${newStatus ? 'ACTIVE' : 'INACTIVE'}.`
    });
  } catch (error) {
    console.error('Toggle Service Error:', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};
