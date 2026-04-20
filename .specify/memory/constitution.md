<!--
Sync Impact Report:
- Version change: 0.0.0 → 1.0.0 (Initial creation)
- Modified principles: N/A (new document)
- Added sections: All sections (Core Principles, Security Requirements, Development Workflow, Governance)
- Removed sections: N/A
- Templates requiring updates:
  - ✅ plan-template.md - Align with development phases from CDC
  - ✅ spec-template.md - Align with functional blocks from CDC
  - ✅ tasks-template.md - Include internship management specific tasks
- Follow-up TODOs: None
-->

# Système de Gestion des Stagiaires Constitution

## Core Principles

### I. Three-Block Architecture
The application is organized into three distinct functional blocks that must remain modular and independently deployable:
- **Bloc 1**: Organigramme GIAS Industries - Interactive organizational chart with hierarchy visualization
- **Bloc 2**: Organigramme CSM GIAS - Interactive organizational chart with tutor management
- **Bloc 3**: Module de Gestion des Stagiaires - Core internship lifecycle management

Each block must have clear APIs and can be developed/tested independently. Shared components (authentication, notifications, document generation) must be implemented as reusable services.

### II. Role-Based Access Control (RBAC)
The system implements five distinct user roles with strictly enforced permissions:
- **Super Admin**: Full system access, user management, system configuration
- **Admin RH**: Candidate management, conventions, evaluations, all interns access
- **Chef de Département**: Department-level management, tutor assignment
- **Tuteur**: Own assigned interns only (attendance, evaluations, journal)
- **Stagiaire**: Read-only access to own file, document upload

Every endpoint and UI component must verify role permissions before granting access. Authorization checks must be implemented at both API and UI levels.

### III. Document-First Workflow (NON-NEGOTIABLE)
All internship processes require official document generation and tracking:
- Convention de stage: Auto-generated PDF with signature workflow
- Feuilles de présence: Monthly PDF generation
- Évaluations: PDF reports for mid-term and final evaluations
- Attestation: Auto-generated upon stage completion

Documents must be versioned, stored with 10-year retention, and follow company branding standards. No stage transition is complete without proper documentation.

### IV. Multi-Entity Support
The system must clearly distinguish between and support both entities:
- **GIAS Industries**: Margarine, spread, cocoa powder, juice powder manufacturing
- **CSM GIAS**: Bakery and pastry ingredients manufacturing

Shared departments (GRH, DF, Usine, Export, Achat, CDG/SI/Logistique) must be visually distinguished and accessible to both entities. Interns are assigned to exactly one entity per stage.

### V. Attendance Tracking & Alerts
Attendance management requires multiple entry modes and proactive alerting:
- Entry modes: Manual (Tutor/RH), Self-check-in (validated), Excel import
- Status types: P, AJ, ANJ, C, R, DA, TT, JF
- Automatic calculations: Attendance rate %, total hours, balance hours
- Alerts: 2 consecutive unexcused absences, <80% attendance rate, 3 delays per month

## Security Requirements

### Data Protection
- Password hashing: bcrypt with cost factor ≥12
- Transport: HTTPS mandatory with TLS/SSL certificates
- CSRF protection: Token-based on all forms
- XSS prevention: HTML output escaping
- SQL injection prevention: Parameterized queries/ORM only
- File uploads: MIME type + extension + content verification, max 10MB
- Rate limiting: Max 10 login attempts per minute per IP
- JWT tokens: 24-hour expiration
- Data isolation: Users can only access their authorized data

### Audit & Compliance
- All sensitive actions must be logged with timestamp, user, IP, and action details
- Session expiration after 30 minutes of inactivity
- 10-year document retention for legal archiving
- WCAG 2.1 Level AA accessibility compliance

## Performance Standards

| Indicator | Target |
|-----------|--------|
| Page load time | < 2 seconds (internal network) |
| PDF generation | < 5 seconds |
| API response | < 500 ms (excluding file generation) |
| Concurrent users | 50 without degradation |
| System availability | 99.5% (excluding planned maintenance) |

## Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | React.js 18+ + Tailwind CSS |
| Backend | Node.js 18 LTS + Express.js |
| Database | MySQL 8+ |
| ORM | Sequelize 6+ |
| Authentication | JWT + bcrypt |
| PDF Generation | PDFKit or Puppeteer |
| Email | Nodemailer |
| File Storage | Local filesystem + Multer |
| Org Charts | D3.js or OrgChart.js |

## Development Workflow

### Phase-Based Development (CDC Compliant)
1. **Phase 0-1**: Analysis & Design (2 weeks) - CDC validation, UML diagrams, wireframes
2. **Phase 2-3**: Setup & Auth (1 week) - Database schema, authentication system
3. **Phase 4**: Bloc 1 & 2 (1 week) - Organizational charts for both entities
4. **Phase 5**: Bloc 3 - Candidatures (1 week) - Application workflow
5. **Phase 6**: Bloc 3 - Tracking & Evaluations (1 week) - Attendance and grading
6. **Phase 7**: Bloc 3 - Documents & Dashboard (1 week) - PDF generation, reports
7. **Phase 8-9**: Testing & Deployment (2 weeks) - Testing, documentation, delivery

### Quality Gates
- All database schemas must be reviewed before implementation
- API endpoints require authentication/authorization tests
- PDF templates must match company branding exactly
- UI must be responsive (1920×1080 to 375px)
- French language interface (multilingual capability optional)

## Governance

This constitution supersedes all other development practices for the Système de Gestion des Stagiaires project. All design decisions, code reviews, and implementations must align with these principles.

### Amendment Process
1. Proposed changes must be documented with rationale
2. Changes affecting core principles require validation against CDC requirements
3. Version must be updated following semantic versioning:
   - MAJOR: Breaking changes to architecture or role permissions
   - MINOR: New principles or expanded guidance
   - PATCH: Clarifications, wording improvements

### Compliance Verification
- Check against constitution before each phase completion
- Verify role permissions matrix is correctly implemented
- Confirm all document generation requirements are met
- Validate both entity structures are properly supported

**Version**: 1.0.0 | **Ratified**: 2026-03-04 | **Last Amended**: 2026-03-04
