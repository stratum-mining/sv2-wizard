// Centralized config builder for generating configuration files from templates

import { processConfigTemplate } from './utils';
import {
  JD_CLIENT_CONFIG_TEMPLATE,
  TRANSLATOR_CONFIG_TEMPLATE,
  POOL_SERVER_CONFIG_TEMPLATE,
  JDS_CONFIG_TEMPLATE
} from './templates';
import { ConfigTemplateData, ConfigType } from './types';
import {
  DEFAULT_AUTHORITY_PUBLIC_KEY,
  DEFAULT_AUTHORITY_SECRET_KEY,
  DEFAULT_CONFIG_VALUES,
  getRpcPort,
  getAddressPlaceholder
} from './constants';
import { getPoolConfig } from './pools';

/**
 * Builds a JD Client configuration from template data
 */
export function buildJdClientConfig(data: ConfigTemplateData): string {
  const network = data.network || 'mainnet';
  const selectedPoolConfig = getPoolConfig(data.selectedPool);
  const jdcPoolAddress = selectedPoolConfig?.address || DEFAULT_CONFIG_VALUES.localhost;
  const jdcPoolPort = selectedPoolConfig?.port || DEFAULT_CONFIG_VALUES.poolPort;
  const jdcJdsAddress = selectedPoolConfig?.jdsAddress || DEFAULT_CONFIG_VALUES.localhost;
  const jdcJdsPort = selectedPoolConfig?.jdsPort || DEFAULT_CONFIG_VALUES.jdsPort;
  
  return processConfigTemplate(JD_CLIENT_CONFIG_TEMPLATE, {
    AUTHORITY_PUBLIC_KEY: data.authorityPublicKey || DEFAULT_AUTHORITY_PUBLIC_KEY,
    AUTHORITY_SECRET_KEY: data.authoritySecretKey || DEFAULT_AUTHORITY_SECRET_KEY,
    USER_IDENTITY: data.userIdentity || DEFAULT_CONFIG_VALUES.defaultUserIdentity,
    JDC_SIGNATURE: data.jdcSignature || DEFAULT_CONFIG_VALUES.defaultJdcSignature,
    COINBASE_REWARD_SCRIPT: data.coinbaseRewardAddress || getAddressPlaceholder(network),
    UNIX_SOCKET_PATH: data.socketPath || "/path/to/node.sock",
    FEE_THRESHOLD: data.feeThreshold || DEFAULT_CONFIG_VALUES.feeThreshold,
    MIN_INTERVAL: data.minInterval || DEFAULT_CONFIG_VALUES.minInterval,
    SHARES_PER_MINUTE: data.sharesPerMinute || DEFAULT_CONFIG_VALUES.sharesPerMinute,
    SHARE_BATCH_SIZE: data.shareBatchSize || DEFAULT_CONFIG_VALUES.shareBatchSize,
    JDC_POOL_ADDRESS: jdcPoolAddress,
    JDC_POOL_PORT: jdcPoolPort,
    JDC_UPSTREAM_JDS_ADDRESS: jdcJdsAddress,
    JDC_UPSTREAM_JDS_PORT: jdcJdsPort
  });
}

/**
 * Builds a Translator Proxy configuration from template data
 */
export function buildTranslatorConfig(data: ConfigTemplateData, options?: {
  useJdc?: boolean; // If true, connects to JDC; if false, connects to pool
}): string {
  const useJdc = options?.useJdc ?? !!data.socketPath; // Default: use JDC if socket path exists
  
  let upstreamAddress: string;
  let upstreamPort: number;
  let upstreamAuthorityPubkey: string;
  let aggregateChannels: boolean;
  
  if (useJdc) {
    // Connecting to JDC (custom templates)
    upstreamAddress = data.upstreamAddress || DEFAULT_CONFIG_VALUES.localhost;
    upstreamPort = data.upstreamPort || DEFAULT_CONFIG_VALUES.jdcPort;
    upstreamAuthorityPubkey = data.upstreamAuthorityPubkey || DEFAULT_AUTHORITY_PUBLIC_KEY;
    aggregateChannels = data.aggregateChannels ?? false;
  } else {
    // Connecting to pool (pool templates)
    // In full stack: connects to local pool (127.0.0.1:34254)
    // In pool connection: connects to selected external pool
    const poolConfig = getPoolConfig(data.selectedPool);
    if (poolConfig) {
      // External pool (pool connection wizard)
      upstreamAddress = poolConfig.address;
      upstreamPort = poolConfig.port;
      upstreamAuthorityPubkey = poolConfig.authorityPubkey;
      aggregateChannels = data.aggregateChannels ?? poolConfig.aggregateChannels;
    } else {
      // Local pool (full stack wizard)
      upstreamAddress = data.upstreamAddress || DEFAULT_CONFIG_VALUES.localhost;
      upstreamPort = data.upstreamPort || DEFAULT_CONFIG_VALUES.poolPort;
      upstreamAuthorityPubkey = data.upstreamAuthorityPubkey || DEFAULT_AUTHORITY_PUBLIC_KEY;
      aggregateChannels = data.aggregateChannels ?? true;
    }
  }
  
  // enable_vardiff: true when connecting to pool, false when connecting to JDC
  // If user explicitly sets enableVardiff, use that; otherwise use logic based on connection type
  const enableVardiff = data.enableVardiff !== undefined 
    ? data.enableVardiff 
    : !useJdc; // false when connecting to JDC, true when connecting to pool
  
  const supportedExtensionsBlock = useJdc
    ? `# Protocol extensions configuration
# Extensions that the translator supports (will request if required by server)
# Example: supported_extensions = [0x0002, 0x0003]
supported_extensions = [
    0x0002,  # Worker-Specific Hashrate Tracking
]
`
    : `# Protocol extensions configuration
# Extensions that the translator supports (will request if required by server)
# Example: supported_extensions = [0x0002, 0x0003]
supported_extensions = [
#    0x0002,  # Worker-Specific Hashrate Tracking
]
`;

  const requiredExtensionsBlock = useJdc
    ? `# Extensions that the translator requires (server must support these)
# If the upstream server doesn't support these, the translator will fail over to another upstream
required_extensions = [
    0x0002,  # Worker-Specific Hashrate Tracking
]
`
    : `# Extensions that the translator requires (server must support these)
# If the upstream server doesn't support these, the translator will fail over to another upstream
required_extensions = [
#    0x0002,  # Worker-Specific Hashrate Tracking
]
`;

  return processConfigTemplate(TRANSLATOR_CONFIG_TEMPLATE, {
    USER_IDENTITY: data.userIdentity || DEFAULT_CONFIG_VALUES.defaultUserIdentity,
    ENABLE_VARDIFF: enableVardiff,
    AGGREGATE_CHANNELS: aggregateChannels,
    UPSTREAM_ADDRESS: upstreamAddress,
    UPSTREAM_PORT: upstreamPort,
    AUTHORITY_PUBLIC_KEY: upstreamAuthorityPubkey,
    MIN_INDIVIDUAL_MINER_HASHRATE: data.minIndividualMinerHashrate || DEFAULT_CONFIG_VALUES.minIndividualMinerHashrate,
    SHARES_PER_MINUTE: data.sharesPerMinute || data.clientSharesPerMinute || DEFAULT_CONFIG_VALUES.sharesPerMinute,
    SUPPORTED_EXTENSIONS_BLOCK: supportedExtensionsBlock,
    REQUIRED_EXTENSIONS_BLOCK: requiredExtensionsBlock
  });
}

/**
 * Builds a Pool Server configuration from template data
 */
export function buildPoolServerConfig(data: ConfigTemplateData): string {
  const network = data.network || 'mainnet';
  
  return processConfigTemplate(POOL_SERVER_CONFIG_TEMPLATE, {
    AUTHORITY_PUBLIC_KEY: data.authorityPublicKey || DEFAULT_AUTHORITY_PUBLIC_KEY,
    AUTHORITY_SECRET_KEY: data.authoritySecretKey || DEFAULT_AUTHORITY_SECRET_KEY,
    LISTEN_ADDRESS: data.listenAddress || `${DEFAULT_CONFIG_VALUES.anyAddress}:${DEFAULT_CONFIG_VALUES.poolPort}`,
    COINBASE_REWARD_SCRIPT: `addr(${data.poolPayoutAddress || getAddressPlaceholder(network)})`,
    POOL_SIGNATURE: data.poolSignature || DEFAULT_CONFIG_VALUES.defaultPoolSignature,
    UNIX_SOCKET_PATH: data.socketPath || "/path/to/node.sock",
    FEE_THRESHOLD: data.feeThreshold || DEFAULT_CONFIG_VALUES.feeThreshold,
    MIN_INTERVAL: data.minInterval || DEFAULT_CONFIG_VALUES.minInterval,
    SHARES_PER_MINUTE: data.sharesPerMinute || DEFAULT_CONFIG_VALUES.sharesPerMinute,
    SHARE_BATCH_SIZE: data.shareBatchSize || DEFAULT_CONFIG_VALUES.shareBatchSize
  });
}

/**
 * Builds a JDS (Job Declarator Server) configuration from template data
 */
export function buildJdsConfig(data: ConfigTemplateData): string {
  const network = data.network || 'mainnet';
  const rpcPort = data.coreRpcPort || getRpcPort(network);
  
  return processConfigTemplate(JDS_CONFIG_TEMPLATE, {
    AUTHORITY_PUBLIC_KEY: data.authorityPublicKey || DEFAULT_AUTHORITY_PUBLIC_KEY,
    AUTHORITY_SECRET_KEY: data.authoritySecretKey || DEFAULT_AUTHORITY_SECRET_KEY,
    COINBASE_REWARD_SCRIPT: data.poolPayoutAddress || getAddressPlaceholder(network),
    LISTEN_JD_ADDRESS: `${DEFAULT_CONFIG_VALUES.anyAddress}:${DEFAULT_CONFIG_VALUES.jdsPort}`,
    CORE_RPC_URL: data.coreRpcUrl || DEFAULT_CONFIG_VALUES.localhost,
    CORE_RPC_PORT: rpcPort,
    CORE_RPC_USER: data.coreRpcUser || "username",
    CORE_RPC_PASS: data.coreRpcPass || "password"
  });
}

/**
 * Builds a configuration file based on the specified type
 */
export function buildConfig(type: ConfigType, data: ConfigTemplateData, options?: any): string {
  switch (type) {
    case 'jd-client':
      return buildJdClientConfig(data);
    case 'translator':
      return buildTranslatorConfig(data, options);
    case 'pool-server':
      return buildPoolServerConfig(data);
    case 'jds':
      return buildJdsConfig(data);
    default:
      throw new Error(`Unknown config type: ${type}`);
  }
}

