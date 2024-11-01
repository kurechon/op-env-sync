# @kurechon/op-env-sync

CLI tool to sync .env files with 1Password

## Installation

```bash
pnpm add -g @kurechon/op-env-sync
```

## Usage

### Push .env file to 1Password

```bash
op-env-sync push
```

### Pull .env file from 1Password

```bash
op-env-sync pull
```

### Options

```bash
# Specify vault
op-env-sync push --vault MyVault

# Specify item prefix
op-env-sync push --prefix "Project-"
```

## Prerequisites

- 1Password CLI installed
- Signed in to 1Password CLI (`op signin`)

## License

MIT
