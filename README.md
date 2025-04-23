# DocManagement

A document management panel built with Angular 19, designed for two distinct user roles — **User** and **Reviewer**. It streamlines document uploading, reviewing, and approval workflows. This project was bootstrapped with [Angular CLI](https://github.com/angular/angular-cli) version 19.2.8.

## ✨ Features

### 🔐 Authentication
- JWT-based login system
- Redirects users to the document dashboard after successful login

### 📂 Document Dashboard
- Filter by status, sort by columns, and paginate through documents
- Reviewer-only filter by creator
- Role-specific visibility:
  - **Users** see only their documents
  - **Reviewers** do not see drafts

### 🧑‍💻 User Role
- Upload document with title + file  
  → Actions: `Save as Draft`, `Send to Review`
- Edit document:
  - Rename
  - Delete if status is `Draft` or `Revoked`
  - Revoke if status is `Pending Review`
- View document using PSPDFKit SDK

### 👩‍⚖️ Reviewer Role
- View all documents (excluding drafts)
- Update document status:  
  → `In Review`, `Approved`, `Rejected`
- Full preview via PSPDFKit SDK

## 🧰 Tech Stack

- Angular 19 with **Signals**
- **Angular Material** for UI components
- **PSPDFKit / Nutrient Web SDK** for document viewing
- Unit test coverage (basic)

## 🛠️ Development

### Development server

To start a local development server, run:
```bash
npm i
```
```bash
ng serve
```

Navigate to `http://localhost:4200/`. The app reloads automatically on file changes.

### Code scaffolding

List available schematics:

```bash
ng generate --help
```

### Building

Build the project:

```bash
ng build
```

Compiled files will be in the `dist/` folder.

### Running unit tests

Execute unit tests with [Karma](https://karma-runner.github.io):

```bash
ng test
```

## 📚 Additional Resources

- [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli)
- [PSPDFKit Web SDK Guide](https://www.nutrient.io/guides/web/)
- [Backend API (Swagger)](https://legaltech-testing.coobrick.app/swagger)
