# 📌 V2Online Portal — Master Project Specification Document (project.md)

> **Version:** 1.4.0  
> **Last Updated:** 2026-09-14  
> **Backend Stack:** Node.js, Express.js, MySQL (mysql2 pool), Multer (Local Server Disk Storage), JWT Auth  
> **Frontend Stack:** React.js, TypeScript, Vite, Tailwind CSS, Lucide Icons, Axios  
> **Integrations:** Meta Cloud WhatsApp Business API (OTP + Notifications), Cashfree Auto UPI Gateway  

---

## 🎯 1. Core Concept & Business Logic

### 1.1 Purpose
**V2Online Portal** ek B2B citizen service orchestration platform hai jo **MP Online Kiosk / Cyber Cafe Agents** ko direct **Authorized Department Operators / Officers** se connect karta hai. Iska maqsad citizen services ke processing time ko drastically reduce karna aur accurate execution deliver karna hai.

### 1.2 Core Business Rules & Decisions (Finalized)
1. **Agent Registration & Onboarding**:
   - **Self Registration**: Agent form bharega (`Shop Name`, `Owner Name`, `Mobile Number`, `Aadhaar Number`). Meta WhatsApp API se OTP verify hoga. Submit hote hi account `pending_approval` status me jayega.
   - **Approval**: Admin ya Manager portal se review karke Approve karenge tab Agent login kar sakega.
   - **Direct Creation**: Admin, Manager, ya Distributor direct Agent account create kar sakte hain (ye instantly Active hoga, no waiting).
2. **Wallet Recharge (Cashfree Auto UPI Gateway)**:
   - Instant Dynamic QR code aur UPI intent support.
   - Webhook callback aate hi Agent ka wallet real-time 100% credit ho jayega.
   - Koi strict minimum wallet balance nahi hoga (basic input validation like >= ₹1).
3. **Application Refund Logic**:
   - Agar Operator kisi reason se application **Reject** karta hai (with mandatory reason/remark), toh Agent ke wallet me **Instant 100% Refund** credit ho jayega aur passbook me entry create hogi.
4. **Completed Work Output Delivery (Dynamic per Service)**:
   - Har sub-service ke hisaab se Admin/Manager set karega ki Operator completion par kya dega:
     - **File Output**: Downloadable PDF/JPG certificate ya receipt.
     - **Text / Ack Output**: Govt Ack No., Samagra Member ID, ya details text format me.
     - **Status Only**: Keval "Completed" status confirmation.
5. **Dynamic Services & Sub-Services Engine (Admin & Manager Access)**:
   - Category -> Service -> Sub-Services hierarchy.
   - **Admin aur Manager dono** naye services bana sakte hain, edit kar sakte hain, pricing (Agent Fee), Operator percentage/share, aur Distributor share set/modify kar sakte hain.
   - Dynamic form fields configure kar sakte hain (Input field types, labels, mandatory flags, file upload limits, operator output requirements).
6. **Smart Area Selection & Operator Auto-Assignment**:
   - Jab Agent koi service select karega, toh Area (District / Tehsil / Ward) dropdown me **sirf wahi areas dikhenge jinke liye active/mapped Operator available hai**.
   - Form submit hote hi request seedha us mapped Operator ke **In-Processing Queue** me auto-assign ho jayegi.
   - Operator login karte hi automatically `is_online = true`, logout par `is_online = false`.
7. **Operator Withdrawal 2-Tier Approval Flow**:
   - Operator `[Withdraw]` request lagata hai -> Manager review & verify karta hai -> Admin final payout release (UTR update) karta hai.
8. **Document Storage**:
   - Uploaded customer documents & output certificates server ke local disk storage par **Express + Multer** se securely organize honge (`/uploads/applications/{app_id}/...`).

---

## 👥 2. User Roles & Permissions Matrix

| Feature / Page | 👑 Super Admin | 👨‍💼 Manager | 🤝 Distributor | 👨‍💻 Operator | 🏪 Agent |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Self Register & WhatsApp OTP** | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Approve Self-Registered Agents (Verifying Page)** | ✅ | ✅ | ✅ (Area Verify) | ❌ | ❌ |
| **Direct Create Agent** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Agent Delete / Deactivation Request** | ✅ (Approve) | ✅ (Manage) | ✅ (Request) | ❌ | ❌ |
| **Operator Add & Area Mapping** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Service Create / Edit & Percentage Setup** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Total Application Management** | ✅ (Full Control) | ✅ (Operations) | ❌ | My Queue | My Apps |
| **Amount Transaction (Global Ledger)** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Add Amount (Manual Wallet Adjustment)** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Operator Withdrawal (Verify / Payout)** | ✅ (Release Pay) | ✅ (Verify) | ❌ | Request Only | ❌ |
| **Distributor Commission Withdrawal** | ✅ (Release Pay) | ✅ (Verify) | Request Only | ❌ | ❌ |
| **Complaint Desk (Resolve & Action Take)** | ✅ | ✅ | ❌ | Remark View | Raise Ticket |

---

## 📱 3. PANEL-BY-PANEL DETAILED BREAKDOWN & PAGES

---

## 🏪 PANEL 1: AGENT PANEL (MP Online Kiosk / Shop)

### 3.1.1 Authentication & Registration
- **Login Page**: Mobile Number, Password. Validates active status and approval.
- **Agent Self-Registration Page**: Shop Name, Owner Name, Mobile Number, Aadhaar Number, District/Tehsil -> WhatsApp OTP verification -> Account enters `pending_approval` state.
- **Forgot Password Page**: Mobile Number -> WhatsApp OTP -> Set New Password.

### 3.1.2 Agent Dashboard
- **Top Bar**: Shop Name, Agent ID, Live Wallet Balance (`₹ 1,250.00`) + `[+ Add Money]`, Notification Bell, Profile Dropdown.
- **Announcement Slider**: Live updates, server maintenance news, scheme notices.
- **KPI Metrics**: Today's Applications, In-Processing, Correction Required (Highlighted), Completed Today, Rejected.
- **Category & Service Grid**: Samagra ID, MP e-District, Sambal Card, MP Ration Card, Ayushman Bharat, Other Services.
- **Recent Applications**: Top 5 recent applications with live status pills and download/view buttons.

### 3.1.3 Service Application Flow
- Category -> Sub-Service Selection with Price Tag.
- **Dynamic Area Dropdown**: System queries backend for active operator-mapped areas for this service (e.g. *Bhopal -> Kolar Tehsil -> Ward 12*).
- Dynamic Form: Customer Details, Service Inputs (Aadhaar/Samagra/etc.), Document Uploads (PDF/JPG preview).
- Wallet Check & One-Click Debit -> Auto-assigned to Area Operator -> Meta WhatsApp alert dispatched.

### 3.1.4 Application History & Tracking
- Search by App ID, Mobile, Date, Service, Status.
- Actions: View Details, Download Output Certificate/Slip, Fix & Re-submit (Correction Required), Raise Complaint.

### 3.1.5 Wallet & Passbook
- Instant UPI Top-up via Cashfree Auto UPI (Dynamic QR / Intent).
- Detailed passbook ledger with credit/debit filters and transaction invoices.

### 3.1.6 Helpdesk & Complaint
- Raise ticket linked to Application ID with status tracking.

### 3.1.7 Profile & Shop Settings
- Shop Details, Address, Password Change, Guidelines.

---

## 👨‍💻 PANEL 2: OPERATOR PANEL (Office / Processing Officer)

### 3.2.1 Status & Dashboard
- **Auto Online/Offline**: Login sets `is_online = 1`, Logout sets `is_online = 0`.
- **Dashboard Counters**: Active In-Processing Queue, Urgent SLA cases, Sent for Correction, Completed Today, Today's Earnings.
- **Service Filter Tabs**: Quick filter by assigned service types.

### 3.2.2 Work Queue & Application Processing
- **Queue Table**: App ID, Customer Name & Mobile, District/Ward, Sub-Service, Earning Share.
- **1-Click Fast Copy Utility**: Copy any field to clipboard for instant pasting on Govt portals.
- **Document Viewer**: High-res side-by-side document preview with zoom/download.
- **Processing Actions**:
  - **Mark Completed Modal**: Enter Govt Ref/Ack No. + Upload Certificate/Receipt PDF/Image + Finish.
  - **Request Correction Modal**: Select reason tag + Custom Remarks -> Notifies Agent.
  - **Reject Application Modal**: Enter rejection reason -> Triggers 100% instant refund to Agent.

### 3.2.3 Completed History & Wallet
- Completed applications log with uploaded receipts/data.
- **Wallet & Withdrawal Page**: Gross earnings, Available balance, Request Payout (UPI / Bank Transfer) -> Sent to Manager verification queue.

---

## 🤝 PANEL 3: DISTRIBUTOR PANEL

### 3.3.1 Distributor Dashboard
- Network Metrics: Total Onboarded Agents, Active Agents Today, Network Application Volume, Commission Balance.

### 3.3.2 Pages & Features
1. **Dashboard**: Summary metrics, recent agent activity, commission earnings.
2. **New Agent Create**: Form to create new Agent shop directly (instantly active).
3. **Agent Delete Request**: Submit request to Admin/Manager to deactivate/delete non-performing or violating agent.
4. **Agent Add Request Verify**: Verify self-registered agents within assigned distributor area before forwarding for approval.
5. **Profile Page**: Distributor personal details, assigned district/tehsil, bank details for payouts.
6. **Commission Wallet & Withdrawal**: View per-application override commission ledger and request withdrawal.

---

## 👨‍💼 PANEL 4: MANAGER PANEL

### 3.4.1 Pages & Features
1. **Dashboard**: Operations live feed, Total applications today, Operator status (Online/Offline), Pending queues, SLA breach alerts.
2. **Service Create & Edit (Amount & Operator Percentage)**: Create and Edit Categories, Services, Sub-services, Dynamic form builder, Fee & Percentage split.
3. **Shop List / Agent Management**: Directory of MP Online shops/agents, balances, handling Agent Delete Requests.
4. **Operator Add & Area Mapping**: Create new Operators and map to Service + Area (District, Tehsil, Ward).
5. **Verifying Requests Page**: Queue for self-registered agents (`status = 'pending_approval'`) -> Approve / Reject.
6. **Profile Page**: Manager profile details, contact information, password management.
7. **Complain Resolve / View (Action Take)**: Agent helpdesk tickets tagged with Application IDs, action & resolution.
8. **User Management (Request for Add / Verification)**: Review user addition requests.
9. **Operator Withdrawal Request Page**: Review and verify pending Operator withdrawal requests -> Forward to Admin.

---

## 👑 PANEL 5: SUPER ADMIN PANEL (Master Control / Owner)

### 3.5.1 Pages & Features
> **Super Admin has ALL 9 pages of Manager Panel PLUS master financial & administrative control:**

1. **All 9 Manager Pages** (Dashboard, Service Create/Edit with Percentages, Shop List, Operator Add, Verifying Requests, Profile, Complaints, User Mgmt, Withdrawal Verify).
2. **Amount Transaction (Global Ledger)**: Complete real-time audit ledger of all monetary transactions across the platform (Inflow, Outflow, Net Margin).
3. **Add Amount (Manual Wallet Adjustment)**: Direct wallet credit/debit tool for any user with mandatory audit note.
4. **Total Application Management (Master Control)**: Master control over all applications (reassign, force-complete, force-refund).
5. **Final Payout Release Desk**: Final approval of Manager-verified payouts with Bank UTR number recording.
6. **System & Gateway Configurations**: Meta WhatsApp Business API keys/templates, Cashfree Auto UPI Gateway credentials, system audit logs.

---

## 🗄️ 4. Database Schema (MySQL Relational Design)

```sql
-- Database: v2online_portal

CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    uuid VARCHAR(36) UNIQUE NOT NULL,
    role ENUM('super_admin', 'manager', 'distributor', 'operator', 'agent') NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    mobile VARCHAR(15) UNIQUE NOT NULL,
    email VARCHAR(100) NULL,
    password_hash VARCHAR(255) NOT NULL,
    shop_name VARCHAR(150) NULL,
    aadhaar_number VARCHAR(16) NULL,
    district VARCHAR(100) NULL,
    tehsil VARCHAR(100) NULL,
    ward_no VARCHAR(50) NULL,
    address TEXT NULL,
    distributor_id BIGINT NULL REFERENCES users(id),
    approval_status ENUM('pending', 'approved', 'rejected') DEFAULT 'approved',
    is_active BOOLEAN DEFAULT TRUE,
    is_online BOOLEAN DEFAULT FALSE,
    last_login_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE service_categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(100) NULL,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE services (
    id INT PRIMARY KEY AUTO_INCREMENT,
    category_id INT NOT NULL REFERENCES service_categories(id),
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT NULL,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sub_services (
    id INT PRIMARY KEY AUTO_INCREMENT,
    service_id INT NOT NULL REFERENCES services(id),
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    agent_fee DECIMAL(10,2) NOT NULL,
    operator_share DECIMAL(10,2) NOT NULL,
    distributor_share DECIMAL(10,2) DEFAULT 0.00,
    admin_profit DECIMAL(10,2) NOT NULL,
    form_schema JSON NOT NULL,          -- Dynamic Form inputs for Agent
    required_docs JSON NOT NULL,        -- Required documents to upload by Agent
    output_type ENUM('file', 'text', 'both', 'status_only') DEFAULT 'file', -- What operator submits
    output_schema JSON NULL,            -- Schema for operator output fields
    estimated_tat_hours INT DEFAULT 4,
    is_active BOOLEAN DEFAULT TRUE,
    created_by BIGINT NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Operator to Service & Area Mapping
CREATE TABLE operator_assignments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    operator_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sub_service_id INT NOT NULL REFERENCES sub_services(id) ON DELETE CASCADE,
    district VARCHAR(100) NOT NULL,
    tehsil VARCHAR(100) NULL,
    ward_no VARCHAR(50) NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_operator_area (operator_id, sub_service_id, district, tehsil, ward_no)
);

CREATE TABLE applications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    application_no VARCHAR(30) UNIQUE NOT NULL,
    agent_id BIGINT NOT NULL REFERENCES users(id),
    sub_service_id INT NOT NULL REFERENCES sub_services(id),
    operator_id BIGINT NULL REFERENCES users(id),
    distributor_id BIGINT NULL REFERENCES users(id),
    customer_name VARCHAR(100) NOT NULL,
    customer_mobile VARCHAR(15) NOT NULL,
    district VARCHAR(100) NOT NULL,
    tehsil VARCHAR(100) NULL,
    ward_no VARCHAR(50) NULL,
    form_data JSON NOT NULL,            -- Submitted dynamic fields
    status ENUM('pending', 'assigned', 'processing', 'correction_required', 'completed', 'rejected') DEFAULT 'processing',
    rejection_reason TEXT NULL,
    correction_remarks TEXT NULL,
    govt_ack_no VARCHAR(100) NULL,
    completion_output_data JSON NULL,   -- Output file URLs / text returned by operator
    fee_deducted DECIMAL(10,2) NOT NULL,
    operator_payout DECIMAL(10,2) NOT NULL,
    distributor_payout DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    accepted_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL
);

CREATE TABLE application_documents (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    application_id BIGINT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    doc_label VARCHAR(100) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    mime_type VARCHAR(50) NOT NULL,
    file_size_kb INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE wallets (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT UNIQUE NOT NULL REFERENCES users(id),
    balance DECIMAL(12,2) DEFAULT 0.00,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE transactions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    txn_no VARCHAR(40) UNIQUE NOT NULL,
    wallet_id BIGINT NOT NULL REFERENCES wallets(id),
    user_id BIGINT NOT NULL REFERENCES users(id),
    application_id BIGINT NULL REFERENCES applications(id),
    type ENUM('credit', 'debit') NOT NULL,
    category ENUM('topup', 'service_fee', 'operator_earning', 'distributor_commission', 'refund', 'withdrawal', 'admin_adjustment') NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    opening_balance DECIMAL(12,2) NOT NULL,
    closing_balance DECIMAL(12,2) NOT NULL,
    gateway_txn_id VARCHAR(100) NULL,
    status ENUM('pending', 'success', 'failed') DEFAULT 'success',
    remarks VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE withdrawal_requests (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    req_no VARCHAR(30) UNIQUE NOT NULL,
    user_id BIGINT NOT NULL REFERENCES users(id),
    amount DECIMAL(10,2) NOT NULL,
    payment_mode ENUM('upi', 'bank_transfer') NOT NULL,
    account_holder_name VARCHAR(100) NOT NULL,
    bank_name VARCHAR(100) NULL,
    account_no VARCHAR(50) NULL,
    ifsc_code VARCHAR(20) NULL,
    upi_id VARCHAR(50) NULL,
    status ENUM('pending', 'manager_verified', 'approved', 'rejected', 'processed') DEFAULT 'pending',
    rejection_reason VARCHAR(255) NULL,
    utr_no VARCHAR(100) NULL,
    verified_by BIGINT NULL REFERENCES users(id),
    processed_by BIGINT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMP NULL,
    processed_at TIMESTAMP NULL
);

CREATE TABLE complaints (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    ticket_no VARCHAR(30) UNIQUE NOT NULL,
    application_id BIGINT NULL REFERENCES applications(id),
    raised_by BIGINT NOT NULL REFERENCES users(id),
    subject VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    attachment_path VARCHAR(500) NULL,
    status ENUM('open', 'in_review', 'resolved', 'closed') DEFAULT 'open',
    resolution_note TEXT NULL,
    resolved_by BIGINT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL
);

CREATE TABLE user_requests (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    requested_by BIGINT NOT NULL REFERENCES users(id),
    target_user_id BIGINT NULL REFERENCES users(id),
    request_type ENUM('delete_agent', 'add_agent', 'add_operator', 'other') NOT NULL,
    data_payload JSON NULL,
    reason TEXT NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    reviewed_by BIGINT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP NULL
);
```

---

## 🔔 5. Meta WhatsApp API & Notification Matrix

| Trigger Event | Recipient Role | Channel | Content / Template |
| :--- | :--- | :--- | :--- |
| **Agent Registration OTP** | Agent | WhatsApp | 🔐 *Aapka V2Online registration OTP hai: {otp}. Ye OTP 5 minute ke liye valid hai.* |
| **Account Approved** | Agent | WhatsApp | 🎉 *Badhai ho! Aapka V2Online Agent account approve ho gaya hai. Ab aap login karke services use kar sakte hain.* |
| **New Service Request** | Operator | WhatsApp + In-App | ⚡ *Nayi Request #{app_no} aayi hai ({sub_service_name}, {district} - {ward_no}). Customer: {customer_name}. Kripya Operator panel par check karein.* |
| **Application In-Processing**| Agent | In-App / SMS | 🔄 *Aapki Application #{app_no} Operator dwara process ki ja rahi hai.* |
| **Correction Required** | Agent | WhatsApp + In-App | ⚠️ *Application #{app_no} me sudhar ki jarurat hai: "{remarks}". Kripya portal par document update karein.* |
| **Application Completed** | Agent | WhatsApp + In-App | ✅ *Application #{app_no} safaltapoorvak poori ho gayi hai! Certificate/Output portal se download karein.* |
| **Application Rejected** | Agent | WhatsApp + In-App | ❌ *Application #{app_no} reject ho gayi hai: "{reason}". ₹{amount} aapke wallet me refund kar diya gaya hai.* |
| **Operator Withdrawal Paid**| Operator | WhatsApp | 💸 *Aapka ₹{amount} ka payout transfer kar diya gaya hai. UTR/Ref: {utr_no}.* |

---

## 📁 6. Recommended Project Folder Structure

```
mp-online/
├── project.md                          # Master specification & docs
├── package.json                        # Monorepo root / backend root
├── backend/                            # Node.js + Express + MySQL Server
│   ├── package.json
│   ├── .env.example
│   ├── src/
│   │   ├── config/                     # DB connection (mysql2 pool), env configs
│   │   ├── controllers/                # Auth, Services, Applications, Wallets, Admin, Manager, Operator
│   │   ├── middlewares/                # AuthGuard (JWT), RoleGuard, UploadMiddleware (Multer), ErrorHandler
│   │   ├── models/ / db/               # MySQL schema migrations, SQL queries/helpers
│   │   ├── routes/                     # REST API route endpoints
│   │   ├── services/                   # WhatsApp (Meta API), Cashfree UPI, Notification Engine
│   │   ├── utils/                      # OTP generator, validators, response helper
│   │   └── server.js                   # Express app entry point
│   └── uploads/                        # Local server disk storage for documents & certificates
└── frontend/                           # React + TypeScript + Vite + Tailwind CSS
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.js
    └── src/
        ├── api/                        # Axios instance & API client functions
        ├── components/                 # Reusable UI (Navbar, Sidebar, Modals, DynamicForm, Tables, StatsCard)
        ├── context/                    # AuthContext, WalletContext, NotificationContext
        ├── pages/
        │   ├── auth/                   # Login, Register (OTP), ForgotPassword
        │   ├── agent/                  # Dashboard, Services Grid, ApplyForm, AppHistory, Wallet, Tickets
        │   ├── operator/               # Dashboard, WorkQueue, FastCopyModal, CompleteModal, MyEarnings
        │   ├── distributor/            # Dashboard, OnboardAgent, NetworkList, CommissionWallet
        │   ├── manager/                # OperationsDesk, FormBuilder, AgentApproval, SLAView, OperatorMgmt
        │   └── admin/                  # FinancialLedger, PricingEngine, MasterApps, PayoutRelease, Settings
        └── App.tsx                     # Router with Role-based Protected Routes
```
