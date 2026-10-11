const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const config = getDefaultConfig(projectRoot);

// Nested apps/backends must not pollute customer Metro resolution
config.resolver.blockList = /[/\\](greengo_courier|greengo-backend|greengo-admin-dashboard)[/\\].*/;

config.watchFolders = [projectRoot];
config.resolver.nodeModulesPaths = [path.resolve(projectRoot, "node_modules")];

module.exports = config;
