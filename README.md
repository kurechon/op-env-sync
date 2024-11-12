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
# Specify vault (default: "Private")
op-env-sync push --vault MyVault

# Specify item suffix
op-env-sync push --suffix ".local"

# Generate .env.example file with keys only
op-env-sync push --example
op-env-sync pull --example
```

## Prerequisites

- 1Password CLI installed
- Signed in to 1Password CLI
  ```bash
  eval $(op signin)
  ```

### Item Format in 1Password

The .env file will be stored in 1Password with the following format:

- Item Type: Secure Note
- Item Name: `[current-directory-name].local .env`
  - With suffix option: `[current-directory-name] .env<suffix>`
- Field Name: `env`

## License

MIT
