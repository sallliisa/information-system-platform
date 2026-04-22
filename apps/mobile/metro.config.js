const { getDefaultConfig } = require('expo/metro-config')
const { withNativeWind } = require('nativewind/metro')
const path = require('path')

const projectRoot = __dirname
const workspaceRoot = path.resolve(projectRoot, '../..')
const config = getDefaultConfig(projectRoot)

config.watchFolders = [...new Set([...(config.watchFolders ?? []), workspaceRoot])]
config.resolver.nodeModulesPaths = [path.resolve(projectRoot, 'node_modules'), path.resolve(workspaceRoot, 'node_modules')]
const finalConfig = withNativeWind(config, { input: './global.css' })
finalConfig.transformer = {
  ...(finalConfig.transformer || {}),
  unstable_allowRequireContext: true,
}

module.exports = finalConfig
