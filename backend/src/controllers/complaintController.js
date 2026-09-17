import pool from '../config/db.js';

/**
 * 1. Get Complaints List
 * GET /api/complaints
 */
export const getComplaints = async (req, res) => {
  try {
    const userId = req.user?.id;

    let query = `
      SELECT c.id, c.ticket_no as ticketNo, c.subject, c.description,
             c.status, c.resolution_note as resolutionNote, c.created_at as createdAt,
             u.full_name as raisedByName, u.role as raisedByRole
      FROM complaints c
      LEFT JOIN users u ON c.raised_by = u.id
    `;

    const params = [];
    if (userId && req.user?.role !== 'super_admin' && req.user?.role !== 'manager') {
      query += ' WHERE c.raised_by = ?';
      params.push(userId);
    }

    query += " ORDER BY FIELD(LOWER(c.status), 'open', 'in_review', 'resolved', 'closed') ASC, c.created_at DESC";

    const [rows] = await pool.query(query, params);

    const formatted = rows.map(r => {
      let parsedCategory = 'General Support';
      let cleanDescription = r.description;
      const categoryMatch = r.description.match(/^\[(.*?)\]\s*(.*)$/s);
      if (categoryMatch) {
        parsedCategory = categoryMatch[1];
        cleanDescription = categoryMatch[2];
      }

      return {
        id: r.id.toString(),
        ticketNo: r.ticketNo,
        subject: r.subject,
        category: parsedCategory,
        description: cleanDescription,
        status: r.status.toUpperCase(),
        raisedByName: r.raisedByName || 'Portal User',
        raisedByRole: r.raisedByRole || 'agent',
        createdAt: new Date(r.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        resolutionNote: r.resolutionNote || undefined
      };
    });

    return res.status(200).json({ status: 'success', data: formatted });
  } catch (error) {
    console.error('Get Complaints Error:', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * 2. Raise New Complaint Ticket
 * POST /api/complaints
 */
export const createComplaint = async (req, res) => {
  try {
    const { subject, category, description, raisedByUserId, raisedByMobile } = req.body;
    let raisedBy = req.user?.id;

    if (!raisedBy && (raisedByMobile || raisedByUserId)) {
      const [foundUsers] = await pool.query(
        'SELECT id FROM users WHERE mobile = ? OR id = ? LIMIT 1',
        [raisedByMobile || '', raisedByUserId || 0]
      );
      if (foundUsers.length > 0) {
        raisedBy = foundUsers[0].id;
      }
    }

    if (!raisedBy) {
      const [dist] = await pool.query("SELECT id FROM users WHERE role = 'distributor' LIMIT 1");
      raisedBy = dist.length > 0 ? dist[0].id : 1;
    }

    if (!subject || !description) {
      return res.status(400).json({ status: 'error', message: 'Subject and Description are required.' });
    }

    // Insert dummy ticket_no first to obtain insertId
    const [result] = await pool.query(
      `INSERT INTO complaints (ticket_no, raised_by, subject, description, status)
       VALUES (?, ?, ?, ?, 'open')`,
      ['TKT-TEMP', raisedBy, subject, `${category ? `[${category}] ` : ''}${description}`]
    );

    const year = new Date().getFullYear();
    const ticketNo = `TKT-${year}-${1000 + result.insertId}`;

    // Update with formatted TKT-2026-XXXX ticket number
    await pool.query('UPDATE complaints SET ticket_no = ? WHERE id = ?', [ticketNo, result.insertId]);

    return res.status(201).json({
      status: 'success',
      message: 'Complaint ticket created successfully!',
      data: {
        id: result.insertId.toString(),
        ticketNo,
        subject,
        category: category || 'General Support',
        status: 'OPEN'
      }
    });
  } catch (error) {
    console.error('Create Complaint Error:', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};

/**
 * 3. Update Complaint Status & Resolution Note (Admin / Manager)
 * PATCH /api/complaints/:id/status
 */
export const updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, resolutionNote } = req.body;

    if (!status) {
      return res.status(400).json({ status: 'error', message: 'Status is required.' });
    }

    const resolvedBy = req.user?.id || 1;

    await pool.query(
      `UPDATE complaints
       SET status = ?, resolution_note = ?, resolved_by = ?, resolved_at = NOW()
       WHERE id = ?`,
      [status.toLowerCase(), resolutionNote || null, resolvedBy, id]
    );

    return res.status(200).json({
      status: 'success',
      message: `Complaint status updated to ${status} successfully.`
    });
  } catch (error) {
    console.error('Update Complaint Status Error:', error);
    return res.status(500).json({ status: 'error', message: error.message });
  }
};
