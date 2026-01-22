// Pool Server configuration template

export const POOL_SERVER_CONFIG_TEMPLATE = `# SRI Pool config
authority_public_key = "{{AUTHORITY_PUBLIC_KEY}}"
authority_secret_key = "{{AUTHORITY_SECRET_KEY}}"
cert_validity_sec = 3600
listen_address = "{{LISTEN_ADDRESS}}"

# Coinbase outputs are specified as descriptors. A full list of descriptors is available at
#     https://github.com/bitcoin/bips/blob/master/bip-0380.mediawiki#appendix-b-index-of-script-expressions
# Although the \`musig\` descriptor is not yet supported and the legacy \`combo\` descriptor never
# will be. If you have an address, embed it in a descriptor like \`addr(<address here>)\`.
coinbase_reward_script = "{{COINBASE_REWARD_SCRIPT}}"

# Server Id (number to guarantee unique search space allocation across different Pool servers)
server_id = 1

# Pool signature (string to be included in coinbase tx)
pool_signature = "{{POOL_SIGNATURE}}"

# Enable this option to set a predefined log file path.
# When enabled, logs will always be written to this file.
# The CLI option --log-file (or -f) will override this setting if provided.
# log_file = "./pool.log"

# How many shares we expect to receive in a minute (determines difficulty targets)
shares_per_minute = {{SHARES_PER_MINUTE}}
# How many shares do we want to acknowledge in a batch
share_batch_size = {{SHARE_BATCH_SIZE}}

# Protocol Extensions Configuration
# Extensions that the pool supports (will accept if requested by clients)
# Comment/uncomment to enable/disable specific extensions:
supported_extensions = [
    # 0x0002,  # Worker-Specific Hashrate Tracking
]

# Extensions that the pool requires (clients must support these to connect)
# Use with caution - requiring extensions may prevent some clients from connecting
required_extensions = [
    # Example: require Worker-Specific Hashrate Tracking
    # 0x0002,
]

# Monitoring HTTP server address for exposing channel data (optional)
monitoring_address = "127.0.0.1:9090"

# Bitcoin Core IPC config
# Supported networks: mainnet, testnet4, signet, regtest
# Default data_dir: ~/.bitcoin (Linux) or ~/Library/Application Support/Bitcoin (macOS)
[template_provider_type.BitcoinCoreIpc]
network = "{{NETWORK}}"
{{DATA_DIR_LINE}}
fee_threshold = {{FEE_THRESHOLD}}
min_interval = {{MIN_INTERVAL}}`;

