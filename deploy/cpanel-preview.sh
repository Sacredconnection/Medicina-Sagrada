#!/bin/bash
# cPanel Git deployment: main -> preview.medicinasagrada.com.br.
set -eo pipefail
APP=/home/medsagra/apps/medicina-sagrada-teste
SOURCE=$(git rev-parse --show-toplevel)
test "$(realpath "$APP")" = "$APP"
mkdir -p "$APP/tmp"
exec > "$APP/tmp/deploy.log" 2>&1
trap 'rc=$?; printf "exit=%s\n" "$rc" > "$APP/tmp/deploy.status"' EXIT
printf 'Deploying commit %s\n' "$(git rev-parse HEAD)"
git -C "$SOURCE" archive HEAD | tar -x --exclude=server.cjs -C "$APP"
cd "$APP"
set -a
source deploy/cpanel-staging.env.example
set +a
export NEXT_TELEMETRY_DISABLED=1
NODE_HOME=/opt/alt/alt-nodejs24/root/usr
VENV=/home/medsagra/nodevenv/apps/medicina-sagrada-teste/24
export PATH="$NODE_HOME/bin:$PATH"
NODE="$NODE_HOME/bin/node"
NPM="$NODE_HOME/lib/node_modules/npm/bin/npm-cli.js"
"$NODE" --version
"$NODE" "$NPM" --version
# Next loads these same public endpoint settings at build and runtime.
"$NODE" -e 'const fs=require("fs"); const names=["NODE_ENV","NEXT_PUBLIC_SITE_URL","WORDPRESS_SITE_URL","WORDPRESS_API_URL","WOOCOMMERCE_STORE_API_URL","WOOCOMMERCE_CHECKOUT_URL","WOOCOMMERCE_ACCOUNT_URL","CONTENT_REVALIDATE_SECONDS"]; fs.writeFileSync(".env.production.local",names.map(k=>k+"="+process.env[k]).join("\n")+"\n",{mode:0o600});'
# The hosting account does not expose the cloudlinux-selector CLI.
# Next.js reads .env.production.local itself, so the settings also survive restarts.
# Install in CloudLinux's virtual environment and preserve its module symlink.
mkdir -p "$VENV/lib/node_modules"
if [ ! -e "$APP/node_modules" ] && [ ! -L "$APP/node_modules" ]; then
  ln -s "$VENV/lib/node_modules" "$APP/node_modules"
fi
test "$(realpath "$APP/node_modules")" = "$VENV/lib/node_modules"
ln -sfn "$APP/package.json" "$VENV/lib/package.json"
ln -sfn "$APP/package-lock.json" "$VENV/lib/package-lock.json"
"$NODE" "$NPM" --prefix "$VENV/lib" install --include=dev --no-audit --no-fund
"$NODE" "$APP/node_modules/next/dist/bin/next" build --webpack
cp "$SOURCE/server.cjs" "$APP/server.cjs"
touch tmp/restart.txt
printf 'Preview deployment completed\n'
