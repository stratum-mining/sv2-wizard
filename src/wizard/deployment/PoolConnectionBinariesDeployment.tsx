// Pool Connection Binaries deployment component
// Deploys: JDC (optional) + Translator Proxy to connect to existing pools

import { Download, Play, FileDown, Network } from "lucide-react";
import { Button } from "../../components/ui/button";
import { CodeBlock, InfoCard } from '../ui';
import { 
  buildJdClientConfig,
  buildTranslatorConfig
} from '../../config-templates';
import type { ConfigTemplateData } from '../../config-templates';
import { downloadFile } from '../utils';

import { getPlatform, getDownloadUrl } from '../constants';

export const PoolConnectionBinariesDeployment = ({ data }: { data?: any }) => {
  const needsSocketPath = !!data?.bitcoinSocketPath;
  const socketPath = data?.bitcoinSocketPath || "/path/to/node.sock";
  const platform = getPlatform();
  const network = (data?.selectedNetwork || "mainnet") as 'mainnet' | 'testnet4';
  
  // Prepare config data
  const configData: ConfigTemplateData = {
    network,
    socketPath: needsSocketPath ? socketPath : undefined,
    userIdentity: data?.userIdentity,
    jdcSignature: data?.jdcSignature,
    coinbaseRewardAddress: data?.coinbaseRewardScript,
    clientSharesPerMinute: data?.clientSharesPerMinute,
    feeThreshold: data?.clientFeeThreshold,
    minInterval: data?.clientMinInterval,
    shareBatchSize: data?.clientShareBatchSize,
    aggregateChannels: data?.aggregateChannels,
    minIndividualMinerHashrate: data?.minIndividualMinerHashrate,
    selectedPool: data?.selectedPool
  };
  
  // Generate config files using builders
  let jdcConfigContent = "";
  let translatorConfigContent = "";
  
  if (needsSocketPath) {
    // JDC config (custom templates)
    jdcConfigContent = buildJdClientConfig(configData);
    
    // Translator config (connects to JDC)
    translatorConfigContent = buildTranslatorConfig(configData, { useJdc: true });
  } else {
    // Translator config only (pool templates)
    translatorConfigContent = buildTranslatorConfig(configData, { useJdc: false });
  }
  
  // Function to download all configs as a zip file with config/ folder structure
  const downloadAllConfigs = async () => {
    try {
      // Dynamically import JSZip
      const JSZipModule = await import('jszip');
      const JSZip = JSZipModule.default;
      const zip = new JSZip();
      const configFolder = zip.folder('config');
      
      if (configFolder) {
        if (needsSocketPath) {
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
      if (needsSocketPath) {
        downloadFile(jdcConfigContent, 'jd-client-config.toml');
        setTimeout(() => downloadFile(translatorConfigContent, 'translator-config.toml'), 100);
      } else {
        downloadFile(translatorConfigContent, 'translator-config.toml');
      }
    }
  };
  
  // Download URLs
  const minerAppsUrl = getDownloadUrl('minerApps', platform);
  const minerAppsTarball = `miner-apps-${platform}.tar.gz`;

  // Download and setup command (all in one directory)
  const downloadAndSetupCommand = `mkdir -p sv2 && cd sv2
curl -L -O ${minerAppsUrl}
tar -xzf ${minerAppsTarball} --strip-components=1 && rm ${minerAppsTarball}
unzip -o ../config.zip`;

  // Individual run commands (paths relative to sv2/ after --strip-components=1)
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
      
      <InfoCard number={2} title="Download & Setup" icon={Download}>
        <p className="text-sm text-muted-foreground mb-2">
          Download binaries for <code className="text-xs">{platform}</code> and extract:
        </p>
        <CodeBlock label="Setup" code={downloadAndSetupCommand} />
      </InfoCard>
      
      {needsSocketPath ? (
        <>
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
            <p className="text-sm font-medium text-amber-200 text-center">
              Run each application in a separate terminal from the <code className="text-xs bg-black/20 px-1.5 py-0.5 rounded">sv2/</code> directory:
            </p>
          </div>
          
          <div className="grid gap-3 md:grid-cols-2">
            <InfoCard number={3} title="JD Client" icon={Play}>
              <CodeBlock label="Terminal 1" code={jdClientCommand} />
              <p className="mt-2 text-xs text-muted-foreground">
                Creates templates with your Bitcoin Core node.
              </p>
            </InfoCard>
            
            <InfoCard number={4} title="Translator" icon={Play}>
              <CodeBlock label="Terminal 2" code={translatorCommand} />
              <p className="mt-2 text-xs text-muted-foreground">
                Connects miners to jd_client_sv2.
              </p>
            </InfoCard>
          </div>
        </>
      ) : (
        <InfoCard number={3} title="Run Translator" icon={Play}>
          <p className="text-sm text-muted-foreground mb-2">
            From the <code className="text-xs">sv2/</code> directory:
          </p>
          <CodeBlock label="Run" code={translatorCommand} />
          <p className="mt-2 text-xs text-muted-foreground">
            Connects your miners to the pool.
          </p>
        </InfoCard>
      )}

      <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4">
        <div className="flex items-start gap-3">
          <Network className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-green-100 mb-2">
              Connect Miners
            </h3>
            <p className="text-sm text-green-200/90 mb-2">
              Point your miners at the translator on port <code className="text-xs font-mono bg-black/20 px-1.5 py-0.5 rounded">34255</code>:
            </p>
            <code className="text-sm font-mono text-green-100 block bg-black/20 rounded p-2">
              stratum+tcp://&lt;host-ip&gt;:34255
            </code>
          </div>
        </div>
      </div>
    </div>
  );
};

