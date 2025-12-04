// Constants for wizard components

import type { BitcoinNetwork, NetworkSocketPath } from './types';

export const NETWORK_SOCKET_PATHS: Record<BitcoinNetwork, NetworkSocketPath> = {
  mainnet: {
    label: "Mainnet",
    path: "~/.bitcoin/node.sock",
    macPath: "~/Library/Application Support/Bitcoin/node.sock",
  },
  testnet4: {
    label: "Testnet4",
    path: "~/.bitcoin/testnet4/node.sock",
    macPath: "~/Library/Application Support/Bitcoin/testnet4/node.sock",
  },
  signet: {
    label: "Signet",
    path: "~/.bitcoin/signet/node.sock",
    macPath: "~/Library/Application Support/Bitcoin/signet/node.sock",
  }
};

// SV2 Apps Release Configuration
// Update these values when a new release is available
// Release page: https://github.com/stratum-mining/sv2-apps/releases
export const SV2_APPS_RELEASE = {
  version: "v0.1.0",
  baseUrl: "https://github.com/stratum-mining/sv2-apps/releases/download/v0.1.0",
  releasePage: "https://github.com/stratum-mining/sv2-apps/releases/tag/v0.1.0",
  
  // Available platforms (architecture-os combinations)
  platforms: {
    linuxX64: "x86_64-unknown-linux-musl",
    linuxArm64: "aarch64-unknown-linux-musl",
    macosX64: "x86_64-apple-darwin",
    macosArm64: "aarch64-apple-darwin",
  },
  
  // Tarball names
  tarballs: {
    poolApps: "pool-apps",
    minerApps: "miner-apps",
  }
} as const;

// Detect platform for download URLs
export const getPlatform = (): string => {
  const userAgent = navigator.userAgent.toLowerCase();
  const platformStr = navigator.platform.toLowerCase();
  
  // Check if macOS
  if (platformStr.includes('mac') || userAgent.includes('mac')) {
    // macOS - check architecture
    if (userAgent.includes('arm64') || userAgent.includes('aarch64') || 
        platformStr.includes('arm') || navigator.userAgent.includes('ARM')) {
      return SV2_APPS_RELEASE.platforms.macosArm64;
    }
    return SV2_APPS_RELEASE.platforms.macosX64;
  }
  
  // Linux - check architecture
  if (userAgent.includes('arm64') || userAgent.includes('aarch64') || 
      platformStr.includes('arm') || navigator.userAgent.includes('ARM')) {
    return SV2_APPS_RELEASE.platforms.linuxArm64;
  }
  
  return SV2_APPS_RELEASE.platforms.linuxX64;
};

// Helper to get download URL for a tarball
export const getDownloadUrl = (tarball: 'poolApps' | 'minerApps', platform?: string): string => {
  const p = platform || getPlatform();
  const tarballName = SV2_APPS_RELEASE.tarballs[tarball];
  return `${SV2_APPS_RELEASE.baseUrl}/${tarballName}-${p}.tar.gz`;
};

