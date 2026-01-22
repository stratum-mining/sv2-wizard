// Full Stack Binaries deployment component
// Deploys: SRI Pool + JDS + JDC (optional) + Translator Proxy

import { useState } from "react";
import { Download, Play, FileDown, Network, ChevronDown, ChevronUp, Cpu } from "lucide-react";
import { Button } from "../../components/ui/button";
import { CodeBlock, InfoCard } from '../ui';
import { 
  buildJdClientConfig,
  buildTranslatorConfig,
  buildPoolServerConfig,
  buildJdsConfig
} from '../../config-templates';
import type { ConfigTemplateData } from '../../config-templates';
import { downloadFile } from '../utils';

import { getPlatform, getDownloadUrl, SV2_APPS_RELEASE } from '../constants';

export const FullStackBinariesDeployment = ({ data }: { data?: any }) => {
  const socketPath = data?.bitcoinSocketPath || "/path/to/node.sock";
  const platform = getPlatform();
  const network = (data?.selectedNetwork || "mainnet") as 'mainnet' | 'testnet4';
  const constructTemplates = data?.constructTemplates !== false; // Default to true for full-stack
  const [showCpuMiner, setShowCpuMiner] = useState(false);
  
  // Prepare config data
  const configData: ConfigTemplateData = {
    network,
    socketPath,
    dataDir: data?.bitcoinDataDir,
    poolSignature: data?.poolSignature,
    poolPayoutAddress: data?.poolPayoutAddress,
    listenAddress: data?.listenAddress,
    feeThreshold: data?.feeThreshold,
    minInterval: data?.minInterval,
    sharesPerMinute: data?.sharesPerMinute,
    shareBatchSize: data?.shareBatchSize,
    userIdentity: data?.userIdentity,
    jdcSignature: data?.jdcSignature,
    coinbaseRewardAddress: data?.coinbaseRewardScript,
    clientSharesPerMinute: data?.clientSharesPerMinute,
    aggregateChannels: data?.aggregateChannels,
    minIndividualMinerHashrate: data?.minIndividualMinerHashrate,
    coreRpcUser: data?.coreRpcUser,
    coreRpcPass: data?.coreRpcPass
  };
  
  // Generate config files using builders
  const poolConfig = buildPoolServerConfig(configData);
  
  // Only generate JDS config if user wants to construct templates (JD case)
  let jdsConfigContent = "";
  if (constructTemplates) {
    jdsConfigContent = buildJdsConfig(configData);
  }
  
  // Only generate JD client config if user wants to construct templates
  let jdcConfigContent = "";
  if (constructTemplates) {
    jdcConfigContent = buildJdClientConfig(configData);
  }
  
  // Translator config: different upstream based on JD vs non-JD
  const translatorConfigContent = buildTranslatorConfig(configData, {
    useJdc: constructTemplates
  });
  
  // Function to download all configs as a zip file with config/ folder structure
  const downloadAllConfigs = async () => {
    try {
      // Dynamically import JSZip
      const JSZipModule = await import('jszip');
      const JSZip = JSZipModule.default;
      const zip = new JSZip();
      const configFolder = zip.folder('config');
      
      if (configFolder) {
        configFolder.file('pool-config.toml', poolConfig);
        if (constructTemplates) {
          configFolder.file('jd-server-config.toml', jdsConfigContent);
          configFolder.file('jd-client-config.toml', jdcConfigContent);
        }
        configFolder.file('translator-config.toml', translatorConfigContent);
      }
      
      // Generate zip file and download
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'config.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      // Fallback: download files individually if JSZip is not available
      console.warn('JSZip not available, downloading files individually');
      downloadFile(poolConfig, 'pool-config.toml');
      setTimeout(() => downloadFile(jdsConfigContent, 'jd-server-config.toml'), 100);
      if (constructTemplates) {
        setTimeout(() => downloadFile(jdcConfigContent, 'jd-client-config.toml'), 200);
      }
      setTimeout(() => downloadFile(translatorConfigContent, 'translator-config.toml'), constructTemplates ? 300 : 200);
    }
  };
  
  // Download URLs
  const poolAppsUrl = getDownloadUrl('poolApps', platform);
  const minerAppsUrl = getDownloadUrl('minerApps', platform);
  const poolAppsTarball = `pool-apps-${platform}.tar.gz`;
  const minerAppsTarball = `miner-apps-${platform}.tar.gz`;

  // Download and setup command (all in one directory)
  const downloadAndSetupCommand = `mkdir -p sv2 && cd sv2
curl -L -O ${poolAppsUrl}
curl -L -O ${minerAppsUrl}
tar -xzf ${poolAppsTarball} --strip-components=1 && rm ${poolAppsTarball}
tar -xzf ${minerAppsTarball} --strip-components=1 && rm ${minerAppsTarball}
unzip -o ../config.zip`;

  // Individual run commands (paths relative to sv2/ after --strip-components=1)
  const poolCommand = `./pool/pool_sv2 -c config/pool-config.toml`;
  const jdServerCommand = `./jd-server/jd_server -c config/jd-server-config.toml`;
  const jdClientCommand = `./jd-client/jd_client_sv2 -c config/jd-client-config.toml`;
  const translatorCommand = `./translator/translator_sv2 -c config/translator-config.toml`;
  
  return (
    <div className="space-y-6">
      <InfoCard number={1} title="Download configs" icon={FileDown}>
        <p className="text-sm text-muted-foreground mb-2">
          Download your generated config files:
        </p>
        <Button 
          variant="secondary" 
          size="sm" 
          className="w-full"
          onClick={downloadAllConfigs}
        >
          <FileDown className="w-4 h-4 mr-2" />
          Download config.zip
        </Button>
      </InfoCard>
      
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
        <p className="text-sm text-amber-200 mb-2">
          <strong>⚠️ Platform Detection Notice:</strong> We detected your platform as <code className="text-xs bg-black/20 px-1.5 py-0.5 rounded">{platform}</code>, but this may not be accurate (especially on Apple Silicon Macs).
        </p>
        <p className="text-xs text-amber-200/80 mb-3">
          <strong>Please verify:</strong> Check your system architecture and download the correct binaries from the release page if needed.
        </p>
        <div className="space-y-3">
          <Button 
            variant="secondary" 
            size="sm" 
            className="w-full sm:w-auto"
            asChild
          >
            <a href={SV2_APPS_RELEASE.releasePage} target="_blank" rel="noopener noreferrer">
              View Release Page & Download Binaries
            </a>
          </Button>
          <CodeBlock 
            label="Check your architecture" 
            code={`# On Linux/macOS
uname -m

# On macOS, also check:
sysctl -n machdep.cpu.brand_string`}
          />
        </div>
      </div>

      <InfoCard number={2} title="Download & Setup" icon={Download}>
        <p className="text-sm text-muted-foreground mb-2">
          Download binaries for <code className="text-xs">{platform}</code> and extract:
        </p>
        <p className="text-xs text-muted-foreground mb-2">
          <strong>Note:</strong> If the detected platform is incorrect, download the correct binaries from the <a href={SV2_APPS_RELEASE.releasePage} target="_blank" rel="noopener noreferrer" className="text-primary underline">release page</a> and adjust the commands below.
        </p>
        <CodeBlock label="Setup" code={downloadAndSetupCommand} />
      </InfoCard>
      
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
        <p className="text-sm font-medium text-amber-200 text-center">
          Run each application in a separate terminal from the <code className="text-xs bg-black/20 px-1.5 py-0.5 rounded">sv2/</code> directory:
        </p>
      </div>
      
      <div className="grid gap-3 md:grid-cols-2">
        <InfoCard number={3} title="Pool" icon={Play}>
          <CodeBlock label="Terminal 1" code={poolCommand} />
        </InfoCard>
        
        {constructTemplates && (
          <InfoCard number={4} title="JD Server" icon={Play}>
            <CodeBlock label="Terminal 2" code={jdServerCommand} />
          </InfoCard>
        )}
        
        {constructTemplates && (
          <InfoCard number={5} title="JD Client" icon={Play}>
            <CodeBlock label="Terminal 3" code={jdClientCommand} />
          </InfoCard>
        )}
        
        <InfoCard number={constructTemplates ? 6 : 4} title="Translator" icon={Play}>
          <CodeBlock label={constructTemplates ? "Terminal 4" : "Terminal 2"} code={translatorCommand} />
        </InfoCard>
      </div>

      <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4">
        <div className="flex items-start gap-3">
          <Network className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-green-100 mb-2">
              Connect Miners
            </h3>
            <p className="text-sm text-green-200/90 mb-2">
              Translator Proxy will be running on port <code className="text-xs font-mono bg-black/20 px-1.5 py-0.5 rounded">34255</code>. Edit your mining device(s) configuration, adding the line:
            </p>
            <code className="text-sm font-mono text-green-100 block bg-black/20 rounded p-2 mb-4">
              stratum+tcp://&lt;host-ip&gt;:34255
            </code>
            <button
              onClick={() => setShowCpuMiner(!showCpuMiner)}
              className="w-full flex items-center justify-center gap-2 text-sm font-medium text-green-100 bg-green-500/20 hover:bg-green-500/30 border border-green-400/30 rounded-lg px-4 py-3 transition-all"
            >
              <Cpu className="w-4 h-4" />
              {showCpuMiner ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  Hide CPU Miner Instructions
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  I don't have an ASIC, but I want to try with a CPU-miner
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {showCpuMiner && (
        <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-4">
          <div className="flex items-start gap-3">
            <Cpu className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1 space-y-3">
              <h3 className="text-sm font-semibold text-blue-100">
                CPU Miner
              </h3>
              <p className="text-sm text-blue-200/90">
                If you don't have a physical miner, you can do tests with CPUMiner.
              </p>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-blue-200/80 mb-1 font-semibold">Setup the correct CPUMiner for your OS:</p>
                  <ul className="text-xs text-blue-200/80 space-y-1 ml-4 list-disc">
                    <li>You can download the binary directly from <a href="https://sourceforge.net/projects/cpuminer/files/" target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:text-blue-200 underline">here</a>;</li>
                    <li>Or compile it from <a href="https://github.com/pooler/cpuminer" target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:text-blue-200 underline">https://github.com/pooler/cpuminer</a></li>
                  </ul>
                </div>
                <div>
                  <p className="text-xs text-blue-200/80 mb-1 font-semibold">On the CPUMiner directory:</p>
                  <CodeBlock
                    label="Run cpuminer"
                    code={`./minerd -a sha256d -o stratum+tcp://localhost:34255 -q -D -P`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

