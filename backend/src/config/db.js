import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'v2online_portal',
  waitForConnections: true,
  connectionLimit: 15,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  charset: 'utf8mb4',
  dateStrings: true
};

export const pool = mysql.createPool(dbConfig);

/**
 * Auto-initialize database, schema & default seed on XAMPP MySQL
 */
export const initDb = async () => {
  try {
    // 1. Check/Create Database on XAMPP server
    const rawConn = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password,
      multipleStatements: true
    });

    await rawConn.query(
      `CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );

    // 2. Execute schema.sql if tables don't exist
    const schemaPath = path.join(__dirname, '../db/schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      await rawConn.query(`USE \`${dbConfig.database}\`;\n` + schemaSql);
    }

    await rawConn.end();

    // 3. Check and Seed Super Admin
    const [adminRows] = await pool.query("SELECT id FROM users WHERE role = 'super_admin' LIMIT 1");
    if (adminRows.length === 0) {
      const adminMobile = '9999999999';
      const passwordHash = await bcrypt.hash('Admin@12345', 10);
      const adminUuid = crypto.randomUUID();

      const [insertRes] = await pool.query(
        `INSERT INTO users (
          uuid, role, full_name, mobile, email, password_hash, approval_status, is_active
        ) VALUES (?, 'super_admin', 'Super Admin Master', ?, 'admin@v2online.in', ?, 'approved', true)`,
        [adminUuid, adminMobile, passwordHash]
      );

      await pool.query('INSERT INTO wallets (user_id, balance) VALUES (?, 0.00)', [insertRes.insertId]);

      console.log('👑 [Auto-Seed] Super Admin initialized on XAMPP MySQL:');
      console.log(`   📱 Mobile: ${adminMobile} | 🔑 Password: Admin@12345`);
    }

    console.log(`✅ [XAMPP MySQL] Connected to database '${dbConfig.database}' successfully!`);
    return true;
  } catch (error) {
    console.error('❌ [XAMPP MySQL] Connection / Initialization error:', error.message);
    console.log('💡 Tip: Make sure XAMPP Control Panel me MySQL service "Start" hai.');
    return false;
  }
};

export default pool;
