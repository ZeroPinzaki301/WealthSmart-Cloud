import pool from "../config/db.js";

class AuditModel {
  // Log a security event
  static async log(userId, eventType, ipAddress, userAgent, details = {}) {
    const query = `
      INSERT INTO security_audit_log (user_id, event_type, ip_address, user_agent, details)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, created_at
    `;
    const values = [userId, eventType, ipAddress, userAgent, JSON.stringify(details)];
    const result = await pool.query(query, values);
    return result.rows[0];
  }
  
  // Get audit logs for a user
  static async getUserLogs(userId, limit = 50) {
    const query = `
      SELECT event_type, ip_address, user_agent, details, created_at
      FROM security_audit_log
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2
    `;
    const result = await pool.query(query, [userId, limit]);
    return result.rows;
  }
  
  // Get audit logs by event type
  static async getEventsByType(eventType, limit = 100) {
    const query = `
      SELECT l.*, u.email, u.username
      FROM security_audit_log l
      LEFT JOIN users u ON l.user_id = u.id
      WHERE l.event_type = $1
      ORDER BY l.created_at DESC
      LIMIT $2
    `;
    const result = await pool.query(query, [eventType, limit]);
    return result.rows;
  }
  
  // Get suspicious activities (multiple failed logins, etc.)
  static async getSuspiciousActivities(since = '24 hours') {
    const query = `
      SELECT user_id, event_type, COUNT(*) as occurrences, 
             array_agg(DISTINCT ip_address) as ips,
             MIN(created_at) as first_occurrence,
             MAX(created_at) as last_occurrence
      FROM security_audit_log
      WHERE created_at > CURRENT_TIMESTAMP - INTERVAL $1
        AND event_type IN ('LOGIN_FAILED', 'PASSWORD_CHANGE_FAILED', 'SUSPICIOUS_ACTIVITY')
      GROUP BY user_id, event_type
      HAVING COUNT(*) > 3
      ORDER BY occurrences DESC
    `;
    const result = await pool.query(query, [since]);
    return result.rows;
  }
}

export default AuditModel;