// Pool Connection Docker deployment component
// Deploys: JDC (optional) + Translator Proxy to connect to existing pools

import { useState } from "react";
import { Download, Terminal, Play, FileDown, Network, CheckCircle2, ChevronDown, ChevronUp, Cpu, Search, HardDrive } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { CodeBlock, InfoCard } from '../ui';
import { generatePoolConnectionEnvFile, downloadFile } from '../utils';
import { getDefaultSocketPath } from '../constants';

export const PoolConnectionDockerDeployment = ({ data }: { data?: any }) => {
  // Socket path is needed if user is constructing templates (using JDC)
  const needsSocketPath = data?.constructTemplates === true;
  const network = (data?.selectedNetwork || "mainnet") as 'mainnet' | 'testnet4';
  const defaultSocketPath = getDefaultSocketPath(network);
  const [socketPath, setSocketPath] = useState(data?.bitcoinSocketPath || "");
  const [jdcConfigConfirmed, setJdcConfigConfirmed] = useState(false);
  const [translatorConfigConfirmed, setTranslatorConfigConfirmed] = useState(false);
  const [completedClicked, setCompletedClicked] = useState(false);
  const [showCpuMiner, setShowCpuMiner] = useState(false);
  
  // Get the find command to locate node.sock
  const getFindSocketCommand = (): string => {
    return `find ~ -name "node.sock" -type s 2>/dev/null`;
  };
  
  const allConfigsConfirmed = needsSocketPath 
    ? jdcConfigConfirmed && translatorConfigConfirmed && !!socketPath
    : translatorConfigConfirmed;
  
  // When using pool templates, only start translator. When using custom templates, start both JDC and translator.
  const commandSequence = needsSocketPath 
    ? `docker compose --profile miner_apps --env-file docker_env up --build`
    : `docker compose --profile tproxy --env-file docker_env up --build`;
  
  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-border bg-card p-6 text-sm text-foreground">
        <strong className="font-semibold">Reminder:</strong> Make sure Docker and Docker Compose are installed and running on your system before proceeding.
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <InfoCard number={1} title="Clone sv2-apps" icon={Download}>
          <p className="text-sm text-muted-foreground mb-2">Get the official Stratum V2 apps repository.</p>
          <code className="text-xs font-mono bg-muted px-2 py-1 rounded block overflow-x-auto">
            git clone https://github.com/stratum-mining/sv2-apps.git
          </code>
        </InfoCard>
        <InfoCard number={2} title="Checkout v0.2.0" icon={Terminal}>
          <p className="text-sm text-muted-foreground mb-2">Switch to the v0.2.0 release branch.</p>
          <code className="text-xs font-mono bg-muted px-2 py-1 rounded block overflow-x-auto">
            git checkout release/v0.2.0
          </code>
        </InfoCard>
        <InfoCard number={3} title="Enter docker workspace" icon={Terminal}>
          <p className="text-sm text-muted-foreground mb-2">Switch to the docker profile folder.</p>
          <code className="text-xs font-mono bg-muted px-2 py-1 rounded block overflow-x-auto">
            cd sv2-apps/docker
          </code>
        </InfoCard>
      </div>

      <CodeBlock
        label="Setup commands"
        code={`git clone https://github.com/stratum-mining/sv2-apps.git
cd sv2-apps
git checkout release/v0.2.0
cd docker`}
      />

      {needsSocketPath && (
        <div className="border-border bg-card rounded-2xl border p-6">
          <h3 className="text-primary font-semibold flex items-center gap-2 mb-4">
            <HardDrive className="w-4 h-4" /> Bitcoin Socket Path (Required for Docker)
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Docker needs the absolute path to your <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">node.sock</code> file to mount it into the container.
          </p>
          
          <div className="mb-4 space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Search className="w-4 h-4 text-primary" />
              <span>Run this command in your terminal to find the socket path:</span>
            </div>
            <CodeBlock 
              label="Find socket command" 
              code={getFindSocketCommand()} 
            />
            <p className="text-xs text-muted-foreground">
              Copy the output path and paste it below. If no result appears, ensure your node is running with <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">-ipcbind=unix</code>.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="socketPath" className="font-medium">
              Bitcoin Socket Absolute Path <span className="text-primary">*</span>
            </Label>
            <Input 
              id="socketPath" 
              placeholder={defaultSocketPath}
              value={socketPath} 
              onChange={(e) => setSocketPath(e.target.value)}
              required
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Enter the absolute path to your <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">node.sock</code> file.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-1">
        <InfoCard number={4} title="Download docker_env file" icon={FileDown}>
          <p className="text-sm text-muted-foreground mb-3">
            Download the generated <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">docker_env</code> file and place it in the <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">sv2-apps/docker</code> directory.
          </p>
          <Button 
            variant="secondary" 
            size="sm" 
            className="w-full"
            onClick={() => {
              if (needsSocketPath && !socketPath) {
                alert("Please enter the Bitcoin socket path first.");
                return;
              }
              const envContent = generatePoolConnectionEnvFile(data, needsSocketPath ? socketPath : undefined);
              downloadFile(envContent, 'docker_env');
            }}
            disabled={needsSocketPath && !socketPath}
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
        <div className="border border-border rounded-2xl p-6 bg-card">
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
              className="w-4 h-4 rounded border-border bg-background text-primary focus:ring-primary focus:ring-offset-0 focus:ring-2"
            />
                <span className="text-sm text-foreground">
                I have downloaded and placed the <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">docker_env</code> file in <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">sv2-apps/docker/</code>
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
              <strong>Important:</strong> Run this command from inside the <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">docker/</code> directory.
            </p>
            <CodeBlock
              label="Launch command"
              code={commandSequence}
            />
          </InfoCard>
        </>
      )}

      {completedClicked && (
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <Network className="w-4 h-4" />
                Connect Miners to Translator Endpoint
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Translator Proxy will be running on port <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">34255</code>. Edit your mining device(s) configuration, adding the line:
              </p>
              <div className="bg-muted rounded p-3 mb-4">
                <code className="text-sm font-mono text-foreground block">
                  stratum+tcp://&lt;host-ip&gt;:34255
                </code>
              </div>
              <button
                onClick={() => setShowCpuMiner(!showCpuMiner)}
                className="w-full flex items-center justify-center gap-2 text-sm font-medium text-foreground bg-muted hover:bg-accent border border-border rounded-xl px-4 py-3 transition-all"
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
      )}

      {showCpuMiner && (
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-start gap-3">
            <Cpu className="w-5 h-5 text-info mt-0.5 flex-shrink-0" />
            <div className="flex-1 space-y-3">
              <h3 className="text-sm font-semibold text-foreground">
                CPU Miner
              </h3>
              <p className="text-sm text-muted-foreground">
                If you don't have a physical miner, you can do tests with CPUMiner.
              </p>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1 font-semibold">Setup the correct CPUMiner for your OS:</p>
                  <ul className="text-xs text-muted-foreground space-y-1 ml-4 list-disc">
                    <li>You can download the binary directly from <a href="https://sourceforge.net/projects/cpuminer/files/" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 underline">here</a>;</li>
                    <li>Or compile it from <a href="https://github.com/pooler/cpuminer" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 underline">https://github.com/pooler/cpuminer</a></li>
                  </ul>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1 font-semibold">On the CPUMiner directory:</p>
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

