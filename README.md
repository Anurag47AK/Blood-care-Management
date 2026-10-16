# Blood Care Management System — Smart Blood Donation & Donor Matching System

![MERN Stack](https://img.shields.io/badge/Stack-MERN-dc2626?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-v24-green?style=for-the-badge&logo=node.js)
![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)
![MongoDB](https://img.shields.io/badge/MongoDB-Community%20Server-brightgreen?style=for-the-badge&logo=mongodb)
![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-06b6d4?style=for-the-badge&logo=tailwindcss)

A clinical-grade, full-stack **MERN (MongoDB, Express.js, React.js, Node.js)** college capstone project designed for emergency blood donor discovery, voluntary blood donor registration, hospital blood requests tracking, live blood bank inventory with concurrency protection, and an intelligent **ABO/Rh Red Blood Cell (RBC) compatibility matching and scoring algorithm**.

---

## 🌟 Complete Application Pages

### 🌐 Public Pages
1. **Home (`/`)**: Hero emergency callouts, live non-hardcoded DB counters, urgent hospital cases ticker, quick donor search, 4-step donation flow, and compatibility quick tester.
2. **About Us (`/about`)**: Clinical mission, technological vision, guiding healthcare values, MERN stack architectural highlights for college examiners, and development milestones.
3. **Find Blood Donors (`/find-donors`)**: Search donors by blood group, city, and availability with privacy phone masking and direct contact for authenticated users.
4. **How It Works (`/how-it-works`)**: Interactive multi-tab workflows for Donors, Requesters, and Blood Bank Administrators, with scientific ABO/Rh matrix breakdown.
5. **Blood Donation Awareness (`/awareness` & `/donate-info`)**: Interactive Donor Eligibility Self-Assessment Calculator (evaluates age, weight, 90-day interval, health conditions), blood components breakdown (RBC, platelets, plasma, cryoprecipitate), shelf life, myths vs facts, pre/post donation care.
6. **Contact (`/contact`)**: 24/7 Emergency Blood Helpline (`1800-BLOOD-CARE`), contact form with client feedback, directory of certified transfusion centers, headquarters address, and operating hours.
7. **Login (`/login`)**: Role-based access with JWT authentication and **One-Click Demo Evaluator buttons** for Admin, Donor, and Patient.
8. **Register (`/register`)**: Unified registration for Donors (with blood group, weight, last donation date, health disclosures) and Requesters.
9. **Not Found (`*`)**: Professional 404 page with navigation links back to safety.

### 🔒 Authenticated Pages
10. **Donor Dashboard (`/donor/dashboard`)**: Medical interval tracker (90-day cooldown), availability status toggle, donation submission, matched hospital requests ticker.
11. **Requester Dashboard (`/requester/dashboard`)**: Summary of blood requests, quick request creation, candidate donor review with compatibility scores.
12. **Administrator Dashboard (`/admin`)**:
    - **Overview**: Real database statistics, Recharts inventory chart with Critical/Low stock highlights, low-stock alerts banner, recent requests queue.
    - **Blood Requests**: Search, filter, approve, reject with reason, or fulfill with atomic inventory deduction.
    - **Donation Approvals**: Verify voluntary donations, credit inventory units, and award donor badges.
    - **Bank Inventory**: Stock tracking across all 8 ABO/Rh groups, atomic unit additions, issues, adjustments, and transaction ledger.
    - **Registered Donors**: Searchable, filterable donor directory with masked/unmasked phone controls.
    - **User Accounts**: System user directory with active/inactive status toggle.
    - **Smart Donor Matcher**: Real-time compatibility engine with distance, interval, and match reasons.
    - **Audit Logs**: Immutable chronological record of system operations with user, IP, and timestamp.
13. **My Profile (`/profile`)**: Manage personal details, donor clinical information, and change password securely.
14. **My Blood Requests (`/my-requests`)**: Dedicated page for requesters to manage submitted requests, view matched compatible donors, and cancel pending requests.
15. **Donation History (`/donation-history`)**: Dedicated page for donors to view past verified donations, units donated, lives saved counter ($3 \times \text{donations}$), donor tier badges, and log new donations.
16. **System Notifications (`/notifications`)**: Real-time notification inbox with unread counter badge, mark as read, mark all read, and direct action links.

---

## ⚡ Smart ABO/Rh Compatibility Engine

Red Blood Cell compatibility follows strict clinical immunologic rules:
- **Universal RBC Donor**: `O-` (O Negative) — contains no A, B, or Rh(D) surface antigens.
- **Universal RBC Recipient**: `AB+` (AB Positive) — has no anti-A, anti-B, or anti-Rh antibodies.
- **Candidate Scoring Algorithm (100 Pts Scale)**:
  - Exact blood group match: **+40 points**
  - Compatible alternative RBC group: **+30 points**
  - Geographic city proximity: **+30 points** (same state: +10 points)
  - Active availability status: **+20 points**
  - $\ge$ 90 days since previous donation: **+10 points**
  - Medical interval deferral: Donors within 90 days are automatically deferred for whole blood safety.

---

## 🏥 Blood Inventory & Concurrency Safety

- Tracks all 8 standard ABO/Rh blood groups: `A+`, `A-`, `B+`, `B-`, `AB+`, `AB-`, `O+`, `O-`.
- **Atomic Stock Deductions**: Uses MongoDB `findOneAndUpdate` with `{ unitsAvailable: { $gte: unitsRequired } }` ensuring stock can never fall below zero and preventing concurrent duplicate fulfillment.
- **Immutable Transaction Ledger**: Every addition, issue, or adjustment creates an `InventoryTransaction` record documenting units, previous stock, new stock, reason, and administrator ID.

---

## 🔐 Demonstration Credentials

| Role | Email | Password | Pre-seeded Context |
|---|---|---|---|
| **🛡️ Administrator** | `admin@bloodcare.org` | `Admin@123` | Full access to inventory, approvals, users, audit logs |
| **🩸 Voluntary Donor** | `rahul.donor@example.com` | `Donor@123` | O+ donor with 3 past donations and verified records |
| **🩸 Voluntary Donor (Universal)** | `amit.donor@example.com` | `Donor@123` | O- universal donor ready for emergency matching |
| **🏥 Patient / Requester** | `vikram.requester@example.com` | `Patient@123` | Requester tracking urgent B+ Lilavati Hospital request |

> **Examiner Shortcut**: On the `/login` screen, click any **One-Click Demo Login** button (Admin / Donor / Patient) to immediately populate credentials.

---

## 🚀 Setup & Execution Guide

### Prerequisites
- Node.js (v18 or higher; v24 tested)
- MongoDB (Local Community Server on port 27017, Atlas URI, or zero-config in-memory fallback)

### Step 1: Backend Setup
```bash
cd blood-care-system/backend
npm install

# Seed the database with 8 blood groups, demo users, requests, and inventory
npm run seed

# Start Express server
npm start
# Server runs on http://localhost:5000
# Health check: http://localhost:5000/api/health
```

### Step 2: Frontend Setup
```bash
cd blood-care-system/frontend
npm install

# Start Vite development server
npm run dev
# Server runs on http://localhost:5173
```

Open `http://localhost:5173` in any browser.

---

## 🧪 Automated Test Suite

Run the built-in automated test suite covering compatibility, interval rules, scoring, bcrypt hashing, JWT tokens, and inventory bounds:

```bash
cd blood-care-system/backend
npm test
```

### Test Results:
```
✔ 1. RBC ABO & Rh Blood Compatibility Engine
✔ 2. Donor Interval Eligibility Check (90 Days rule)
✔ 3. Smart Donor Matching and Ranking Algorithm
✔ 4. Security & Cryptography: Password Hashing & Verification
✔ 5. JWT Generation & Role Payload Verification
✔ 6. Inventory Threshold Business Rules
✔ Pass: 7/7 tests (0 failures)
```

---

## 🎓 College Examiner Live Demonstration Walkthrough

1. **Homepage Evaluation (`/`)**:
   - Check live database counters (active donors, total inventory, fulfilled transfusions).
   - Click **Compatibility Guide** in the navbar to open the interactive ABO/Rh guide.
   - Use **Quick Donor Search** to filter donors by blood group and city.
2. **Educational Pages (`/about`, `/how-it-works`, `/awareness`, `/contact`)**:
   - Visit `/awareness` and test the **Interactive Donor Eligibility Checker** with age, weight, and health conditions.
   - Visit `/contact` to see the emergency hotline (`1800-BLOOD-CARE`) and transfusion center network.
3. **Donor Workflow (`/donor/dashboard`, `/donation-history`)**:
   - Log in as `rahul.donor@example.com` / `Donor@123`.
   - Inspect the **90-Day Medical Interval** card and toggle **Availability Status**.
   - Navigate to `/donation-history` to view past verified donations and log a new donation visit.
4. **Requester Workflow (`/requester/dashboard`, `/my-requests`, `/request-blood`)**:
   - Log in as `vikram.requester@example.com` / `Patient@123`.
   - Navigate to `/my-requests` and click **View Compatible Donors** on request `REQ-2026-CRIT01` to view scored candidate donors.
   - Submit a new emergency blood request at `/request-blood`.
5. **Administrator Portal Evaluation (`/admin`)**:
   - Log in as `admin@bloodcare.org` / `Admin@123`.
   - In **Overview**: view the **Recharts** bar chart with all 8 blood groups and low-stock alerts.
   - In **Blood Requests**: review requests, approve, or fulfill with atomic inventory deduction.
   - In **Donation Approvals**: approve pending donor visits and observe inventory units credited.
   - In **Bank Inventory**: inspect stock levels and verify the immutable **Transaction Ledger**.
   - In **Smart Donor Matcher**: run candidate ranking by selecting any request.
   - In **System Audit Logs**: view the chronological audit trail.
#   B l o o d - c a r e - M a n a g e m e n t  
 