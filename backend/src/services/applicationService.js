import pool from '../config/db.js';
import applicationRepository from '../repositories/applicationRepository.js';

/**
 * Application Service Layer
 * Business logic for Service Request Lifecycle & Operator Routing
 */
class ApplicationService {
  /**
   * Apply for a service (Agent)
   */
  async applyService({ agent, subServiceId, serviceId, formData = {}, files = [], areaLabel, wardNo }) {
    // 1. Resolve sub-service details
    let targetSubServiceId = subServiceId;

    if (!targetSubServiceId && serviceId) {
      const [subRows] = await pool.query(
        'SELECT id FROM sub_services WHERE service_id = ? LIMIT 1',
        [serviceId]
      );
      if (subRows.length > 0) {
        targetSubServiceId = subRows[0].id;
      }
    }

    if (!targetSubServiceId) {
      throw new Error('Valid Service or Sub-Service ID is required.');
    }

    // Fetch sub-service and parent service pricing
    const [subRows] = await pool.query(
      `SELECT ss.id, ss.service_id, ss.name as subServiceName, ss.fee, ss.agent_fee,
              ss.admin_commission_percentage, ss.operator_assignment_mode as subMode,
              s.name as serviceName, s.operator_assignment_mode as serviceMode
       FROM sub_services ss
       JOIN services s ON ss.service_id = s.id
       WHERE ss.id = ?`,
      [targetSubServiceId]
    );

    if (subRows.length === 0) {
      throw new Error('Service configuration not found.');
    }

    const sInfo = subRows[0];
    const fee = parseFloat(sInfo.fee || sInfo.agent_fee || 0);
    const commPercent = parseFloat(sInfo.admin_commission_percentage || 0);
    const adminProfit = (fee * commPercent) / 100;
    const operatorPayout = fee - adminProfit;
    const distributorPayout = 0.00;

    const serviceTitle = sInfo.subServiceName && sInfo.subServiceName !== sInfo.serviceName
      ? `${sInfo.serviceName} (${sInfo.subServiceName})`
      : sInfo.serviceName;

    // 2. Resolve Operator Assignment based on routing mode
    const routingMode = (sInfo.subMode && sInfo.subMode !== 'single') ? sInfo.subMode : (sInfo.serviceMode || 'single');
    let matchedOperatorId = null;

    let opQuery = '';
    const opParams = [];

    if (routingMode === 'ward_wise' && wardNo) {
      opQuery = `
        SELECT oa.operator_id
        FROM operator_assignments oa
        JOIN users u ON oa.operator_id = u.id
        WHERE oa.sub_service_id = ? AND oa.ward_no = ? AND oa.is_active = true AND u.is_active = true
        LIMIT 1
      `;
      opParams.push(targetSubServiceId, String(wardNo));
    } else if (routingMode === 'area_wise' && areaLabel) {
      opQuery = `
        SELECT oa.operator_id
        FROM operator_assignments oa
        JOIN users u ON oa.operator_id = u.id
        WHERE oa.sub_service_id = ? AND oa.area_label = ? AND oa.is_active = true AND u.is_active = true
        LIMIT 1
      `;
      opParams.push(targetSubServiceId, String(areaLabel));
    } else {
      opQuery = `
        SELECT oa.operator_id
        FROM operator_assignments oa
        JOIN users u ON oa.operator_id = u.id
        WHERE oa.sub_service_id = ? AND oa.is_active = true AND u.is_active = true
        LIMIT 1
      `;
      opParams.push(targetSubServiceId);
    }

    const [opRows] = await pool.query(opQuery, opParams);
    if (opRows.length > 0) {
      matchedOperatorId = opRows[0].operator_id;
    } else {
      // Fallback: Check parent service assignments if any
      const [parentOpRows] = await pool.query(
        `SELECT oa.operator_id
         FROM operator_assignments oa
         JOIN users u ON oa.operator_id = u.id
         JOIN sub_services ss ON oa.sub_service_id = ss.id
         WHERE ss.service_id = ? AND oa.is_active = true AND u.is_active = true
         LIMIT 1`,
        [sInfo.service_id]
      );
      if (parentOpRows.length > 0) {
        matchedOperatorId = parentOpRows[0].operator_id;
      }
    }

    // 3. Prepare Customer and Location Info from formData or Agent profile
    const customerName = formData['Applicant Full Name'] || formData['Applicant Name'] || formData['Beneficiary Name'] || formData['Applicant Head Name'] || agent.full_name || 'Citizen Applicant';
    const customerMobile = formData['Contact Mobile'] || formData['Mobile Number'] || agent.mobile || '9876543210';
    const district = formData['District'] || formData['District / Tehsil'] || agent.district || 'Gwalior';
    const tehsil = formData['Tehsil'] || agent.tehsil || null;
    const ward = wardNo || formData['Ward'] || agent.ward_no || null;

    // 4. Call Repository to Atomically deduct wallet & create records
    return await applicationRepository.createApplicationWithDeduction({
      agentId: agent.id,
      subServiceId: targetSubServiceId,
      operatorId: matchedOperatorId,
      distributorId: agent.distributor_id || null,
      customerName,
      customerMobile,
      district,
      tehsil,
      wardNo: ward,
      formData,
      feeDeducted: fee,
      operatorPayout,
      distributorPayout,
      serviceTitle,
      documents: files
    });
  }

  /**
   * Get applications for Agent tracking
   */
  async getAgentApplications(agentId, { status } = {}) {
    return await applicationRepository.getApplications({ agentId, status });
  }

  /**
   * Get applications for Operator work queue
   */
  async getOperatorQueue(operatorId, { status } = {}) {
    return await applicationRepository.getApplications({ operatorId, status });
  }

  /**
   * Get applications for Admin / Manager task verification queue
   */
  async getVerificationQueue() {
    return await applicationRepository.getApplications({
      status: ['completed', 'processing', 'assigned']
    });
  }

  /**
   * Get single application details
   */
  async getApplicationDetails(id) {
    const app = await applicationRepository.getApplicationById(id);
    if (!app) throw new Error('Application not found.');
    return app;
  }

  /**
   * Operator completes application with certificate/deliverable uploads
   */
  async completeApplication({ appId, operatorId, govtAckNo, outputNote, outputFiles }) {
    return await applicationRepository.completeApplication({
      appId,
      operatorId,
      govtAckNo,
      outputNote,
      outputFiles
    });
  }

  /**
   * Admin / Manager verifies application -> Triggers operator wallet payout
   */
  async verifyApplication({ appId, verifierId }) {
    return await applicationRepository.verifyAndCreditOperatorWallet({
      appId,
      verifierId
    });
  }

  /**
   * Reject application -> Auto refund agent wallet
   */
  async rejectApplication({ appId, reason, rejectedBy }) {
    return await applicationRepository.rejectAndRefundAgentWallet({
      appId,
      reason,
      rejectedBy
    });
  }
}

export const applicationService = new ApplicationService();
export default applicationService;
