# Costmate

<a alt="Nx logo" href="https://nx.dev" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png" width="45"></a>

Costmate desktop application built with Nx and Electron.

## Getting Started

### Prerequisites

- Node.js (v20+)
- pnpm

### Installation

Install dependencies:

```sh
pnpm install
```

> **Note:** The `.npmrc` file includes `enable-pre-post-scripts=true` which allows postinstall scripts to run (required for Electron).

### Troubleshooting

**Electron failed to install correctly:**

If you see this error, run the electron install script manually:

```sh
node node_modules/electron/install.js
```

**electron-builder: command not found:**

Install it explicitly:

```sh
pnpm add -D electron-builder
```

### Running the Application

Run both the frontend and backend in separate terminals:

```sh
# Terminal 1 - Backend (Electron main process)
pnpm nxe:serve:backend

# Terminal 2 - Frontend (React UI)
pnpm nxe:serve:frontend
```

### Building and Packaging

#### Build for Development

Package the app without creating a distributable:

```sh
pnpm nxe:package:app
```

#### Create Distributable

Build and package the app for your current platform:

```sh
pnpm nxe:make:app
```

#### Build for Specific Platforms

To build for specific platforms, use the `--platform` flag:

```sh
# Build for Windows
pnpm nxe:make:app --platform=windows

# Build for macOS
pnpm nxe:make:app --platform=mac

# Build for Linux
pnpm nxe:make:app --platform=linux
```

Valid platform values: `windows`, `mac`, `linux`

Output will be in `dist/executables/`

#### Code Signing

Code signing is **disabled** by default for easier local development. This means:

**macOS:**
- No keychain popup during builds
- Users will see "This app is from an unidentified developer" warning
- To open: Right-click → "Open" or System Settings → Privacy & Security → "Open Anyway"

**Windows:**
- Users will see Windows Defender SmartScreen warning
- To open: Click "More info" → "Run anyway"

**To enable code signing for distribution:**

1. **macOS**: Get an Apple Developer account ($99/year) and update `apps/desktop/project.json`:
   ```json
   "mac": {
     "identity": "Developer ID Application: Your Name"
   }
   ```

2. **Windows**: Get a code signing certificate and update `apps/desktop/electron-builder.json`:
   ```json
   "win": {
     "target": "nsis",
     "certificateFile": "path/to/cert.pfx",
     "certificatePassword": "password"
   }
   ```

## Finish your CI setup

[Click here to finish setting up your workspace!](https://cloud.nx.app/connect/7eJ9Be6l7v)


## Generate a library

```sh
npx nx g @nx/js:lib packages/pkg1 --publishable --importPath=@my-org/pkg1
```

## Run tasks

To build the library use:

```sh
npx nx build pkg1
```

To run any task with Nx use:

```sh
npx nx <target> <project-name>
```

These targets are either [inferred automatically](https://nx.dev/concepts/inferred-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) or defined in the `project.json` or `package.json` files.

[More about running tasks in the docs &raquo;](https://nx.dev/features/run-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Versioning and releasing

To version and release the library use

```
npx nx release
```

Pass `--dry-run` to see what would happen without actually releasing the library.

[Learn more about Nx release &raquo;](https://nx.dev/features/manage-releases?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Keep TypeScript project references up to date

Nx automatically updates TypeScript [project references](https://www.typescriptlang.org/docs/handbook/project-references.html) in `tsconfig.json` files to ensure they remain accurate based on your project dependencies (`import` or `require` statements). This sync is automatically done when running tasks such as `build` or `typecheck`, which require updated references to function correctly.

To manually trigger the process to sync the project graph dependencies information to the TypeScript project references, run the following command:

```sh
npx nx sync
```

You can enforce that the TypeScript project references are always in the correct state when running in CI by adding a step to your CI job configuration that runs the following command:

```sh
npx nx sync:check
```

[Learn more about nx sync](https://nx.dev/reference/nx-commands#sync)


[Learn more about Nx on CI](https://nx.dev/ci/intro/ci-with-nx#ready-get-started-with-your-provider?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Install Nx Console

Nx Console is an editor extension that enriches your developer experience. It lets you run tasks, generate code, and improves code autocompletion in your IDE. It is available for VSCode and IntelliJ.

[Install Nx Console &raquo;](https://nx.dev/getting-started/editor-setup?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Useful links

Learn more:

- [Learn more about this workspace setup](https://nx.dev/nx-api/js?utm_source=nx_project&amp;utm_medium=readme&amp;utm_campaign=nx_projects)
- [Learn about Nx on CI](https://nx.dev/ci/intro/ci-with-nx?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Releasing Packages with Nx release](https://nx.dev/features/manage-releases?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [What are Nx plugins?](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

And join the Nx community:
- [Discord](https://go.nx.dev/community)
- [Follow us on X](https://twitter.com/nxdevtools) or [LinkedIn](https://www.linkedin.com/company/nrwl)
- [Our Youtube channel](https://www.youtube.com/@nxdevtools)
- [Our blog](https://nx.dev/blog?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
