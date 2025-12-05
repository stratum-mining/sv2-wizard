/**
 * Pool Connection Wizard
 * 
 * Guides miners to connect to existing Stratum V2 pools using SRI proxy components.
 * 
 * Components deployed:
 * - Translator Proxy (always) - Connects miners to the selected pool
 * - Job Declarator Client (JDC) (optional) - Only if user wants to construct custom block templates
 * 
 * Bitcoin Core node is required:
 * - Only if JDC is used (to construct custom block templates)
 * - Not required if using pool's templates
 * 
 * Available pools:
 * - SRI Community Pool: mainnet & testnet4
 * - Braiins Pool: mainnet (non-JD only)
 * - DMND Pool: mainnet (JD or non-JD)
 */

import { Wizard, WizardConfig } from "./components/ui/wizard-framework";
import { 
  Box, Terminal, Layers, Cloud, Zap, Globe, Activity
} from "lucide-react";
import {
  BitcoinSetupContent,
  TranslatorProxyConfigForm,
  ClientConfigForm,
  DeploymentResultContent
} from "./wizard";
import { getPoolConfig } from "./config-templates/pools";

export interface PoolConnectionWizardProps {
  className?: string;
  onComplete?: (finalStepId: string) => void;
}

const POOL_CONNECTION_WIZARD_CONFIG: WizardConfig = {
  initialStepId: 'block_template_construction',
  title: "Pool Connection Wizard",
  subtitle: "Connect your miners to Stratum V2 pools through SRI proxies. Choose whether to use pool templates or construct your own.",
  steps: {
    block_template_construction: {
      id: 'block_template_construction',
      type: 'question',
      title: "Block Template Construction",
      description: "Would you like to construct your own block templates? (Requires a Bitcoin Core node)",
      options: [
        { id: 'opt_own', label: "Yes, construct my own", subLabel: "I have a Bitcoin Core node", value: "yes", nextStepId: "bitcoin_network_selection", icon: Layers },
        { id: 'opt_pool_tpl', label: "No, use pool's templates", subLabel: "Standard mining setup", value: "no", nextStepId: "pool_network_selection", icon: Cloud }
      ]
    },
    pool_network_selection: {
      id: 'pool_network_selection',
      type: 'question',
      title: "Select Bitcoin Network",
      description: "Which network is the pool operating on?",
      options: [
        { id: 'opt_main', label: "Mainnet", subLabel: "Production Network", value: "mainnet", nextStepId: "select_pool_all_mainnet", icon: Globe },
        { id: 'opt_test', label: "Testnet4", subLabel: "Testing Network", value: "testnet4", nextStepId: "select_pool_all_testnet4", icon: Activity }
      ]
    },
    bitcoin_network_selection: {
      id: 'bitcoin_network_selection',
      type: 'question',
      title: "Select Bitcoin Network",
      description: "Which network will your Bitcoin Node operate on?",
      options: [
        { id: 'opt_main', label: "Mainnet", subLabel: "Production Network", value: "mainnet", nextStepId: "bitcoin_guide_mainnet", icon: Globe },
        { id: 'opt_test', label: "Testnet4", subLabel: "Testing Network", value: "testnet4", nextStepId: "bitcoin_guide_testnet", icon: Activity }
      ]
    },
    bitcoin_guide_mainnet: { 
      id: 'bitcoin_guide_mainnet', 
      type: 'instruction', 
      title: "Bitcoin Core Setup (Mainnet)", 
      nextStepId: 'select_pool_construct_mainnet',
      component: <BitcoinSetupContent network="mainnet" showBitcoinConf={false} />
    },
    bitcoin_guide_testnet: { 
      id: 'bitcoin_guide_testnet', 
      type: 'instruction', 
      title: "Bitcoin Core Setup (Testnet4)", 
      nextStepId: 'select_pool_construct_testnet4',
      component: <BitcoinSetupContent network="testnet4" showBitcoinConf={false} />
    },
    select_pool_construct_mainnet: {
      id: 'select_pool_construct_mainnet',
      type: 'question',
      title: "Select Mining Pool",
      description: "Choose a pool that supports custom block templates.",
      options: [
        { 
          id: 'pool_sri', 
          label: "Community SRI Pool", 
          subLabel: "Community Hosted Stratum V2 Reference Implementation", 
          value: "community_sri", 
          nextStepId: "jd_client_configuration", 
          icon: Globe,
          iconUrl: getPoolConfig("community_sri")?.iconUrl,
          badge: "Testing",
          badgeColor: "blue",
          warning: "Not for production use – any blocks found will be donated to the SRI project"
        },
        { 
          id: 'pool_demand', 
          label: "DMND",  
          value: "demand", 
          nextStepId: "jd_client_configuration", 
          icon: Zap,
          iconUrl: getPoolConfig("demand")?.iconUrl,
          warning: "Pool for registered businesses only at the moment",
          disabled: true,
          url: "https://dmnd.work/"
        }
      ]
    },
    select_pool_construct_testnet4: {
      id: 'select_pool_construct_testnet4',
      type: 'question',
      title: "Select Mining Pool",
      description: "Choose a pool that supports custom block templates.",
      options: [
        { 
          id: 'pool_sri', 
          label: "Community SRI Pool", 
          subLabel: "Community Hosted Stratum V2 Reference Implementation", 
          value: "community_sri", 
          nextStepId: "jd_client_configuration", 
          icon: Globe,
          iconUrl: getPoolConfig("community_sri")?.iconUrl,
          badge: "Testing",
          badgeColor: "blue",
          warning: "Not for production use – any blocks found will be donated to the SRI project"
        }
      ]
    },
    select_pool_all_mainnet: {
      id: 'select_pool_all_mainnet',
      type: 'question',
      title: "Select Mining Pool",
      description: "Choose the Stratum V2 pool you want to connect to.",
      options: [
        { 
          id: 'pool_sri', 
          label: "Community SRI Pool", 
          subLabel: "Community Hosted Stratum V2 Reference Implementation", 
          value: "community_sri", 
          nextStepId: "translator_proxy_configuration", 
          icon: Globe,
          iconUrl: getPoolConfig("community_sri")?.iconUrl,
          badge: "Testing",
          badgeColor: "blue",
          warning: "Not for production use – any blocks found will be donated to the SRI project."
        },
        { 
          id: 'pool_braiins', 
          label: "Braiins Pool", 
          subLabel: "Leading Mining Pool", 
          value: "braiins", 
          nextStepId: "translator_proxy_configuration", 
          icon: Cloud,
          iconUrl: getPoolConfig("braiins")?.iconUrl
        },
        { 
          id: 'pool_demand', 
          label: "DMND",
          value: "demand", 
          nextStepId: "translator_proxy_configuration", 
          icon: Zap,
          iconUrl: getPoolConfig("demand")?.iconUrl,
          warning: "Pool for registered businesses only at the moment",
          disabled: true,
          url: "https://dmnd.work/"
        }
      ]
    },
    select_pool_all_testnet4: {
      id: 'select_pool_all_testnet4',
      type: 'question',
      title: "Select Mining Pool",
      description: "Choose the Stratum V2 pool you want to connect to.",
      options: [
        { 
          id: 'pool_sri', 
          label: "Community SRI Pool", 
          subLabel: "Community Hosted Stratum V2 Reference Implementation", 
          value: "community_sri", 
          nextStepId: "translator_proxy_configuration", 
          icon: Globe,
          iconUrl: getPoolConfig("community_sri")?.iconUrl,
          badge: "Testing",
          badgeColor: "blue",
          warning: "Not for production use – any blocks found will be donated to the SRI project"
        }
      ]
    },
    jd_client_configuration: {
      id: 'jd_client_configuration',
      type: 'custom',
      title: "JD Client Configuration",
      description: "Configure your Job Declarator Client settings.",
      component: <ClientConfigForm />,
      nextStepId: 'translator_proxy_configuration'
    },
    translator_proxy_configuration: {
      id: 'translator_proxy_configuration',
      type: 'custom',
      title: "Translator Proxy Configuration",
      description: "Configure the translator proxy settings.",
      component: <TranslatorProxyConfigForm />,
      nextStepId: 'deployment_pool'
    },
    deployment_pool: {
      id: 'deployment_pool',
      type: 'question',
      title: "Choose Deployment Method",
      description: "How would you like to deploy the Proxy components?",
      options: [
        { id: 'deploy_docker', label: "Docker", subLabel: "Recommended for ease of use", value: "docker", nextStepId: "result_pool_docker", icon: Box },
        { id: 'deploy_bin', label: "Binaries", subLabel: "Manual setup for advanced users", value: "binaries", nextStepId: "result_pool_binaries", icon: Terminal }
      ]
    },
    result_pool_docker: { id: 'result_pool_docker', type: 'result', title: "Proxy via Docker", component: <DeploymentResultContent type="pool-connection" method="docker" /> },
    result_pool_binaries: { id: 'result_pool_binaries', type: 'result', title: "Proxy via Binaries", component: <DeploymentResultContent type="pool-connection" method="binaries" /> },
  }
};

export function PoolConnectionWizard({ className, onComplete }: PoolConnectionWizardProps) {
  return (
    <Wizard config={POOL_CONNECTION_WIZARD_CONFIG} onComplete={onComplete} className={className} />
  );
}

export default PoolConnectionWizard;

