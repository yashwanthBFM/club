# Football Club Monorepo

This monorepo contains the codebase for the Football Club website, including:

- `apps/user-web`: Next.js application for the public-facing user website.
- `apps/admin-web`: Next.js application for the admin dashboard.
- `apps/api`: Node.js backend application.

## Prerequisites

- Node.js (v20.x or later recommended)
- npm (or yarn/pnpm)

## Getting Started

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd club
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```
## Initialize DB
```bash
  cd apps/api && npx prisma generate
```
## Development

To run the applications in development mode:

-   **User Web App:**
    ```bash
    npx nx serve user-web
    ```
    This will typically start the app on `http://localhost:4200`.

-   **Admin Web App:**
    ```bash
    npx nx serve admin-web
    ```
    This will typically start the app on a different port (e.g., `http://localhost:4201` or as configured by Nx).

-   **API Backend:**
    ```bash
    npx nx serve api
    ```
    This will typically start the API server on `http://localhost:3000`.

## Building for Production

To build the applications for production:

-   **User Web App:**
    ```bash
    npx nx build user-web
    ```

-   **Admin Web App:**
    ```bash
    npx nx build admin-web
    ```

-   **API Backend:**
    ```bash
    npx nx build api
    ```

The build artifacts will be located in the `dist/` directory.

## Linting and Formatting

-   **Lint:**
    ```bash
    npx nx lint user-web
    npx nx lint admin-web
    npx nx lint api
    ```
    Or run for all projects:
    ```bash
    npx nx run-many --target=lint
    ```

-   **Format Check:** (Nx uses Prettier by default)
    ```bash
    npx nx format:check
    ```

-   **Format Write:**
    ```bash
    npx nx format:write
    ```

## Running Tests

-   **Unit Tests & E2E Tests (if configured):**
    ```bash
    npx nx test user-web
    npx nx test admin-web
    npx nx test api 
    # For e2e tests for Next.js apps (e.g., user-web-e2e)
    npx nx e2e user-web-e2e
    npx nx e2e admin-web-e2e
    ```
    Or run for all projects:
    ```bash
    npx nx run-many --target=test
    npx nx run-many --target=e2e # if e2e targets are present
    ```

## Project Structure

-   `apps/`: Contains the individual applications.
    -   `user-web/`: Frontend for users.
    -   `admin-web/`: Frontend for administrators.
    -   `api/`: Backend API.
-   `libs/`: Intended for shared libraries, components, or utilities across applications. (You can create these as needed using `npx nx g @nx/js:lib my-shared-lib`)
-   `tools/`: Contains workspace-specific tooling and scripts.
-   `nx.json`: Nx workspace configuration.
-   `package.json`: Project dependencies and scripts.
-   `tsconfig.base.json`: Base TypeScript configuration for the workspace.

## Features to be Implemented

1.  Member/parent registration.
2.  Taking payments from club player/parents (for uniforms, equipment, tournament fees).
3.  Setting polls/voting for any feedback needed from parents. 
