// Pool Connection Docker deployment component
// Deploys: JDC (optional) + Translator Proxy to connect to existing pools

import { useState } from "react";
import { Download, Terminal, Play, FileDown, Network, CheckCircle2 } from "lucide-react";
import { Button } from "../../components/ui/button";
import { CodeBlock, InfoCard } from '../ui';
import { generatePoolConnectionEnvFile, downloadFile } from '../utils';

export const PoolConnectionDockerDeployment = ({ data }: { data?: any }) => {
  const needsSocketPath = !!data?.bitcoinSocketPath;
  const socketPath = data?.bitcoinSocketPath || "/path/to/node.sock";
  const [jdcConfigConfirmed, setJdcConfigConfirmed] = useState(false);
  const [translatorConfigConfirmed, setTranslatorConfigConfirmed] = useState(false);
  const [completedClicked, setCompletedClicked] = useState(false);
  
  const allConfigsConfirmed = needsSocketPath 
    ? jdcConfigConfirmed && translatorConfigConfirmed 
    : translatorConfigConfirmed;
  
  // When using pool templates, only start translator. When using custom templates, start both JDC and translator.
  const commandSequence = needsSocketPath 
    ? `docker compose --profile miner_apps --env-file docker_env up --build`
    : `docker compose --profile tproxy --env-file docker_env up --build`;
  
  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-4 text-sm text-blue-100">
        <strong className="font-semibold">Reminder:</strong> Make sure Docker and Docker Compose are installed and running on your system before proceeding.
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <InfoCard number={1} title="Clone sv2-apps" icon={Download}>
          <p className="text-sm text-muted-foreground mb-2">Get the official Stratum V2 apps repository.</p>
          <code className="bg-muted/50 px-2 py-1 rounded text-xs font-mono text-primary block overflow-x-auto">
            git clone https://github.com/stratum-mining/sv2-apps.git
          </code>
        </InfoCard>
        <InfoCard number={2} title="Checkout v0.1.0" icon={Terminal}>
          <p className="text-sm text-muted-foreground mb-2">Switch to the v0.1.0 release tag.</p>
          <code className="bg-muted/50 px-2 py-1 rounded text-xs font-mono text-primary block overflow-x-auto">
            git checkout v0.1.0
          </code>
        </InfoCard>
        <InfoCard number={3} title="Enter docker workspace" icon={Terminal}>
          <p className="text-sm text-muted-foreground mb-2">Switch to the docker profile folder.</p>
          <code className="bg-muted/50 px-2 py-1 rounded text-xs font-mono text-primary block overflow-x-auto">
            cd sv2-apps/docker
          </code>
        </InfoCard>
      </div>

      <CodeBlock
        label="Setup commands"
        code={`git clone https://github.com/stratum-mining/sv2-apps.git
cd sv2-apps
git checkout v0.1.0
cd docker`}
      />

      <div className="grid gap-4 md:grid-cols-1">
        <InfoCard number={4} title="Download docker_env file" icon={FileDown}>
          <p className="text-sm text-muted-foreground mb-3">
            Download the generated <code className="text-xs">docker_env</code> file and place it in the <code className="text-xs">sv2-apps/docker</code> directory.
          </p>
          <Button 
            variant="secondary" 
            size="sm" 
            className="w-full"
            onClick={() => {
              const envContent = generatePoolConnectionEnvFile(data, needsSocketPath ? socketPath : undefined);
              downloadFile(envContent, 'docker_env');
            }}
          >
            <FileDown className="w-4 h-4 mr-2" />
            Download docker_env file
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            This file contains all environment variables needed for the deployment. The config files will be generated from these values.
          </p>
        </InfoCard>
      </div>

      {/* Confirmation checkbox */}
      <div className="space-y-3">
        <div className="border border-white/10 rounded-lg p-4 bg-white/5">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={allConfigsConfirmed}
              onChange={(e) => {
                const checked = e.target.checked;
                if (checked) {
                  setCompletedClicked(true);
                }
                if (needsSocketPath) {
                  setJdcConfigConfirmed(checked);
                }
                setTranslatorConfigConfirmed(checked);
              }}
              className="w-5 h-5 rounded border-white/20 bg-black/20 text-primary focus:ring-primary focus:ring-offset-0 focus:ring-2"
            />
                <span className="text-sm text-white">
                I have downloaded and placed the <code className="text-primary font-semibold">docker_env</code> file in <code className="text-primary font-semibold">sv2-apps/docker/</code>
              </span>
          </label>
        </div>
      </div>

      {allConfigsConfirmed && (
        <>
          <InfoCard number={5} title={needsSocketPath ? "Launch miner_apps stack" : "Launch translator proxy"} icon={Play}>
            <p className="text-sm text-muted-foreground mb-2">
              {needsSocketPath 
                ? "Bring up the JD Client and the translator proxy."
                : "Bring up the translator proxy (connects to pool's templates)."}
            </p>
            <p className="text-xs text-muted-foreground mb-2">
              <strong>Important:</strong> Run this command from inside the <code className="text-primary">docker/</code> directory.
            </p>
            <CodeBlock
              label="Launch command"
              code={commandSequence}
            />
          </InfoCard>
        </>
      )}

      {completedClicked && (
        <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-green-100 mb-2 flex items-center gap-2">
                <Network className="w-4 h-4" />
                Connect Miners to Translator Endpoint
              </h3>
              <p className="text-sm text-green-200/90 mb-3">
                Point your ASICs at the translator proxy endpoint. The translator listens on port <code className="text-xs font-mono bg-black/20 px-1.5 py-0.5 rounded">34255</code>.
              </p>
              <div className="bg-black/20 rounded p-3">
                <p className="text-xs text-green-200/80 mb-1.5">Connection string:</p>
                <code className="text-sm font-mono text-green-100 block">
                  stratum+tcp://&lt;host-ip&gt;:34255
                </code>
                <p className="text-xs text-green-200/70 mt-2">
                  Replace <code className="text-xs">&lt;host-ip&gt;</code> with your server's IP address or hostname.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

