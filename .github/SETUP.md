# GitHub Actions Setup

This repository uses GitHub Actions to automatically publish to npm when changes are made to the `src/` or `prompts/` folders.

## Required Secrets

To enable automatic publishing, you need to configure the following secrets in your GitHub repository:

### 1. NPM_TOKEN

This is required to publish packages to npm registry.

**Steps to create:**

1. Go to [npmjs.com](https://npmjs.com) and log into your account
2. Click on your avatar → "Access Tokens"
3. Click "Generate New Token" → "Classic Token"
4. Select "Automation" scope (allows publishing)
5. Copy the generated token
6. In GitHub: Go to Settings → Secrets and variables → Actions
7. Click "New repository secret"
8. Name: `NPM_TOKEN`
9. Value: Paste your npm token
10. Click "Add secret"

### 2. GITHUB_TOKEN

This is automatically provided by GitHub Actions, no setup needed.

## How the Workflow Works

### Triggers

The workflow runs when you push to `main` branch with changes to:

- `src/**` (source code)
- `prompts/**` (prompt files)
- `package.json` (dependencies/config)
- `tsconfig.json` (TypeScript config)

### Process

1. **Build & Test**: Installs dependencies, builds project, runs tests
2. **Version Check**: Checks if current version exists on npm
3. **Auto-bump**: If version exists, automatically bumps patch version
4. **Publish**: Publishes new version to npm registry
5. **Tag & Release**: Creates git tag and GitHub release
6. **Notify**: Shows success message with install instructions

### Version Management

- If the current `package.json` version already exists on npm, it automatically bumps the patch version
- Commits the version change back to the repository
- Creates a git tag (e.g., `v1.0.2`)
- Creates a GitHub release with auto-generated changelog

### Safety Features

- Uses `[skip ci]` in auto-bump commits to prevent infinite loops
- Checks npm registry before publishing to avoid conflicts
- Only triggers on specific file changes to avoid unnecessary builds
- Uses official GitHub Actions for maximum security

## Manual Override

If you need to manually publish or skip automation:

```bash
# Bump version manually
npm version patch  # or minor/major
git push origin main --tags

# Publish manually
npm publish

# Skip automation
git commit -m "Update documentation [skip ci]"
```

## Testing the Workflow

1. Make a change to any file in `src/` or `prompts/`
2. Commit and push to main branch
3. Watch the "Actions" tab in GitHub
4. Check that new version appears on [npmjs.com/package/mcp-gui-server](https://npmjs.com/package/mcp-gui-server)
5. Test installation: `npx mcp-gui-server@latest`

## Troubleshooting

### NPM Token Issues

- Make sure token has "Automation" scope
- Verify token is not expired
- Check that package name `mcp-gui-server` is available

### Permission Issues

- Repository needs "Read and write" permissions for Actions
- Go to Settings → Actions → General → Workflow permissions

### Build Failures

- Check Actions logs for specific error messages
- Ensure all dependencies are listed in `package.json`
- Verify TypeScript compilation works locally

## Benefits

✅ **Automatic Publishing**: No manual npm publish needed
✅ **Version Management**: Auto-increments versions
✅ **Git Tagging**: Creates tags for each release
✅ **GitHub Releases**: Auto-generated release notes
✅ **CI/CD Pipeline**: Full build, test, publish workflow
✅ **Safety**: Only publishes when actual code changes occur
