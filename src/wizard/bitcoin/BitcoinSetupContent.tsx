// Bitcoin Core setup content component

import { useState } from "react";
import { ArrowRight, Settings, Play, Download, HardDrive } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import type { BitcoinNetwork } from '../types';
import { isMacOS } from '../constants';
import { CodeBlock, InfoCard } from '../ui';

export const BitcoinSetupContent = ({
  network, 
  data, 
  updateData, 
  onContinue, 
  description, 
  showBitcoinConf = true 
}: { 
  network: BitcoinNetwork, 
  data?: any, 
  updateData?: (newData: any) => void, 
  onContinue?: () => void, 
  description?: string, 
  showBitcoinConf?: boolean 
}) => {
  const [dataDir, setDataDir] = useState(data?.bitcoinDataDir || "");
  // Reset nodeStarted to false when component mounts to ensure confirmation button always shows
  const [nodeStarted, setNodeStarted] = useState(false);
  const startNodeCommand = network === "mainnet" 
    ? "./bitcoin-30.2/bin/bitcoin -m node -ipcbind=unix"
    : "./bitcoin-30.2/bin/bitcoin -m node -ipcbind=unix -testnet4";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (updateData) {
      updateData({ 
        bitcoinDataDir: dataDir || undefined // Only include if provided
      });
    }
    if (onContinue) {
      onContinue();
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
        <h3 className="text-primary font-semibold flex items-center gap-2 mb-2">
          <HardDrive className="w-4 h-4" /> Bitcoin Core Setup Required
        </h3>
        <p className="text-sm text-muted-foreground">
          {description || "You need a running Bitcoin Core node to construct your own block templates."}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <InfoCard number={1} title="Install Bitcoin Core" icon={Download}>
          <p className="text-sm text-muted-foreground mb-3">Download and install version 30.2 or later.</p>
          <Button variant="secondary" size="sm" className="w-full text-xs" asChild>
            <a href="https://bitcoincore.org/en/download/" target="_blank" rel="noopener noreferrer">
              Visit BitcoinCore.org
            </a>
          </Button>
        </InfoCard>
        {showBitcoinConf && (
          <InfoCard number={2} title="Configure bitcoin.conf" icon={Settings}>
            <p className="text-sm text-muted-foreground mb-3">
              Configure your Bitcoin Core node before starting it.
            </p>
            <p className="text-xs text-muted-foreground">
              See the configuration section below for required settings.
            </p>
          </InfoCard>
        )}
        {!showBitcoinConf && (
          <InfoCard number={2} title="Start Bitcoin Core" icon={Play}>
            <p className="text-sm text-muted-foreground mb-3">
              Start your Bitcoin Core node with IPC binding using the command shown below.
            </p>
            <p className="text-xs text-muted-foreground">
              Keep it running and wait for Initial Block Download (IBD) to finish.
            </p>
          </InfoCard>
        )}
        <InfoCard number={3} title={showBitcoinConf ? "Start Bitcoin Core" : "Locate Socket"} icon={showBitcoinConf ? Play : HardDrive}>
          <p className="text-sm text-muted-foreground mb-3">
            {showBitcoinConf 
              ? "After configuring bitcoin.conf, start the node with IPC binding using the command shown below."
              : "After starting the node, locate the socket file path to continue."}
          </p>
          <p className="text-xs text-muted-foreground">
            Keep it running and wait for Initial Block Download (IBD) to finish. Leave it running while you continue the wizard.
          </p>
        </InfoCard>
      </div>

      {showBitcoinConf && (
        <div className="border border-primary/20 rounded-lg p-6 bg-primary/5">
          <h3 className="text-primary font-semibold flex items-center gap-2 mb-4">
            <Settings className="w-4 h-4" /> Bitcoin Configuration File
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            <strong>Important:</strong> Add these settings to your <code className="text-primary">bitcoin.conf</code> file <strong>before</strong> launching the node. These RPC settings are required for JDS when miners want to use JD protocol and create their own block templates.
          </p>
          <div className="space-y-3">
            <div>
              <span className="text-xs uppercase tracking-widest text-muted-foreground block mb-2">bitcoin.conf location</span>
              <code className="block bg-black/30 px-3 py-2 rounded text-sm font-mono text-primary/90">
                {isMacOS() 
                  ? "~/Library/Application Support/Bitcoin/bitcoin.conf"
                  : "~/.bitcoin/bitcoin.conf"}
              </code>
            </div>
            <div>
              <span className="text-xs uppercase tracking-widest text-muted-foreground block mb-2">Required Configuration</span>
              <CodeBlock 
                label="Add to bitcoin.conf" 
                code={`server=1
rpcuser=username
rpcpassword=password
rpcbind=0.0.0.0
rpcallowip=0.0.0.0/0`}
              />
            </div>
          </div>
        </div>
      )}

      <div className="border border-primary/20 rounded-lg p-6 bg-primary/5">
        <h3 className="text-primary font-semibold flex items-center gap-2 mb-4">
          <Play className="w-4 h-4" /> Start Bitcoin Core Node
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          {showBitcoinConf 
            ? "After configuring bitcoin.conf, start your Bitcoin Core node with the following command:"
            : "Start your Bitcoin Core node with the following command:"}
        </p>
        <div className="mb-4">
          <CodeBlock label="Start command" code={startNodeCommand} />
          <p className="mt-3 text-xs text-muted-foreground">
            Keep the node running and wait for Initial Block Download (IBD) to finish. Leave it running while you continue the wizard.
          </p>
        </div>
      </div>

      {!nodeStarted ? (
        <div className="border border-white/10 rounded-lg p-6 bg-white/5">
          <div className="text-center space-y-4">
            <div>
              <h4 className="text-lg font-semibold text-white mb-2">Confirm Node Startup</h4>
              <p className="text-sm text-muted-foreground">
                Once you've started your Bitcoin Core node with the command above, click below to continue.
              </p>
            </div>
            <Button 
              onClick={() => {
                setNodeStarted(true);
                if (updateData) {
                  updateData({ nodeStarted: true });
                }
              }}
              className="group"
            >
              I have started my node with IPC binding
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="border border-primary/20 rounded-lg p-6 bg-primary/5">
          <h3 className="text-primary font-semibold flex items-center gap-2 mb-4">
            <HardDrive className="w-4 h-4" /> Bitcoin Core Configuration
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Configure your Bitcoin Core node settings:
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dataDir" className="text-white font-medium">
                Custom Bitcoin Data Directory <span className="text-muted-foreground">(Optional)</span>
              </Label>
              <Input 
                id="dataDir" 
                placeholder="/custom/bitcoin/data"
                value={dataDir} 
                onChange={(e) => setDataDir(e.target.value)}
                className="bg-white/5 border-2 border-white/30 font-mono text-sm text-white placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/50 hover:border-white/50 hover:bg-white/10 transition-all cursor-text"
              />
              <p className="text-xs text-muted-foreground">
                Only specify if your Bitcoin Core data directory is in a non-default location. Leave empty if using the default path.
              </p>
            </div>
            <div className="flex justify-end">
              <Button type="submit" className="group">
                Continue
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

