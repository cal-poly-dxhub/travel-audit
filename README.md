# Travel Audit Dashboard

Travel Audit Dashboard (also branded as Expensight in the application) is a Next.js application for reviewing travel expense data, organizing records by department, and identifying potential audit violations.

## Features

- Upload CSV and Excel expense files.
- Parse employee, department, expense-category, amount, violation, and date fields.
- Map expense types into hotel, airfare, car rental, meals, exceptions, and past-due categories.
- Display summary statistics and category charts.
- Review department-specific results and audit outcomes.
- Ask the built-in assistant about spending, violations, and department data.
- Switch between light and dark themes.

## Project Structure

- `app/page.tsx` — Main dashboard, upload flow, client-side parsing, and assistant behavior.
- `app/api/upload/route.ts` — Upload endpoint that receives a file and returns filename/size metadata.
- `app/layout.tsx` — Application metadata and root layout.
- `app/globals.css` — Global styles and theme variables.
- `components/ui/` — Reusable UI components.
- `components/theme-provider.tsx` — Theme support.
- `hooks/` — Reusable React hooks.
- `lib/utils.ts` — Shared utilities.
- `public/` — Static assets and placeholder media.
- `package.json` — Scripts and dependencies.

## Requirements

- Node.js and npm

Install dependencies:

```bash
npm install
```

## Running Locally

Start the development server:

```bash
npm run dev
```

Open `http://localhost:3000` in a browser.

Create a production build:

```bash
npm run build
npm run start
```

Other available commands:

```bash
npm run lint
```

## Input Data

The upload interface accepts CSV, XLSX, and XLS files. CSV data should include these required columns:

- Employee Name
- Employee ID
- Employee Department
- Parent Expense Type
- Expense Type

Optional columns include amount, violation flag, and expense date. For reliable parsing, save spreadsheet data as CSV when possible.

## Data Handling and Privacy

Uploaded files may contain confidential employee and financial information, including names, employee IDs, departments, expense categories, amounts, dates, descriptions, and violation indicators. Do not commit real expense files or personal data to source control.

The current upload API logs the original filename and file size and returns that metadata to the client. It does not currently provide authentication, authorization, file-content storage, retention controls, or server-side validation of file type and size. Review and harden this endpoint before deploying the application with real data.

Keep local environment files and generated artifacts out of source control. Restrict access to development logs and use approved storage, access controls, encryption, and retention policies for any production data.

## Development Notes

Before sharing or deploying changes:

1. Run the relevant build, lint, and type checks.
2. Scan source and generated files for credentials, infrastructure identifiers, and personal data.
3. Test upload validation with non-sensitive sample data.
4. Confirm that logs, uploaded files, and temporary artifacts are excluded from source control.
5. Add authentication and server-side validation before exposing the upload endpoint.

# Collaboration

Thanks for your interest in our solution. Having specific examples of replication and usage allows us to continue to grow and scale our work. If you clone or use this repository, kindly shoot us a quick email to let us know you are interested in this work!

<wwps-cic@amazon.com>

# Disclaimers

**Customers are responsible for making their own independent assessment of the information in this document.**

**This document:**

(a) is for informational purposes only,

(b) references AWS product offerings and practices, which are subject to change without notice,

(c) does not create any commitments or assurances from AWS and its affiliates, suppliers or licensors. AWS products or services are provided "as is" without warranties, representations, or conditions of any kind, whether express or implied. The responsibilities and liabilities of AWS to its customers are controlled by AWS agreements, and this document is not part of, nor does it modify, any agreement between AWS and its customers, and

(d) is not to be considered a recommendation or viewpoint of AWS.

**Additionally, you are solely responsible for testing, security and optimizing all code and assets on GitHub repo, and all such code and assets should be considered:**

(a) as-is and without warranties or representations of any kind,

(b) not suitable for production environments, or on production or other critical data, and

(c) to include shortcuts in order to support rapid prototyping such as, but not limited to, relaxed authentication and authorization and a lack of strict adherence to security best practices.

**All work produced is open source. More information can be found in the GitHub repo.**
