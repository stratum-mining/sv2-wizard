// Bitcoin Core setup content component

import { useState } from "react";
import { ArrowRight, Settings, Play, Download, HardDrive } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import type { BitcoinNetwork, OperatingSystem } from '../types';
import { NETWORK_SOCKET_PATHS } from '../constants';
import { CodeBlock, InfoCard } from '../ui';

const formatAbsoluteExample = (path: string) =>
  path.replace(/^~(?=\/)/, '/Users/your_username_here');

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
  const networkSocket = NETWORK_SOCKET_PATHS[network];
  // Default to linux, but use saved value if exists (fallback to linux if windows was previously selected)
  const [selectedOS, setSelectedOS] = useState<OperatingSystem>(
    (data?.selectedOS && data.selectedOS !== 'windows') ? data.selectedOS : 'linux'
  );
  // Get the default path for the selected OS
  const getDefaultPath = (os: OperatingSystem): string => {
    switch (os) {
      case 'macos':
        return networkSocket.macPath;
      case 'linux':
      default:
        return networkSocket.path;
    }
  };
  // Initialize with saved path or default path for selected OS
  const [socketPath, setSocketPath] = useState(
    data?.bitcoinSocketPath || getDefaultPath(selectedOS)
  );
  // Reset nodeStarted to false when component mounts to ensure confirmation button always shows
  const [nodeStarted, setNodeStarted] = useState(false);
  const startNodeCommand = network === "mainnet" 
    ? "./bitcoin-30.0/bin/bitcoin -m node -ipcbind=unix"
    : network === "testnet4"
    ? "./bitcoin-30.0/bin/bitcoin -m node -ipcbind=unix -testnet4"
    : "./bitcoin-30.0/bin/bitcoin -m node -ipcbind=unix -signet";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (updateData) {
      updateData({ 
        bitcoinSocketPath: socketPath,
        selectedOS: selectedOS
      });
    }
    if (onContinue) {
      onContinue();
    }
  };

  return (
    <div className="space-y-6">
      {network === "signet" && (
        <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm text-yellow-100">
          Signet support is being finalized. Expect limited functionality while integration work completes.
        </div>
      )}

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
          <p className="text-sm text-muted-foreground mb-3">Download and install version 30.0 or later.</p>
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
              <div className="space-y-2">
                <div>
                  <span className="text-xs text-muted-foreground block mb-1">Linux / Unix</span>
                  <code className="block bg-black/30 px-3 py-2 rounded text-sm font-mono text-primary/90">
                    ~/.bitcoin/bitcoin.conf
                  </code>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block mb-1">macOS</span>
                  <code className="block bg-black/30 px-3 py-2 rounded text-sm font-mono text-primary/90">
                    ~/Library/Application Support/Bitcoin/bitcoin.conf
                  </code>
                </div>
              </div>
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
            <HardDrive className="w-4 h-4" /> Locate node.sock
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Now that your node is running, find the socket file for <strong>{networkSocket.label}</strong>:
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="osSelect" className="text-white font-medium">
                Operating System
              </Label>
              <Select value={selectedOS} onValueChange={(value) => {
                const newOS = value as OperatingSystem;
                setSelectedOS(newOS);
                // Update socket path to default for new OS if not already customized
                setSocketPath(getDefaultPath(newOS));
              }}>
                <SelectTrigger id="osSelect" className="bg-black/30 border-2 border-white/30 text-white focus:border-primary focus:ring-2 focus:ring-primary/50 hover:border-white/50 hover:bg-black/40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-white/30">
                  <SelectItem value="linux" className="text-white focus:bg-white/20">Linux / Unix</SelectItem>
                  <SelectItem value="macos" className="text-white focus:bg-white/20">macOS</SelectItem>
                </SelectContent>
              </Select>
              <div className="mt-2">
                <span className="text-xs uppercase tracking-widest text-muted-foreground block mb-1">
                  {selectedOS === 'macos' ? 'macOS' : 'Linux / Unix'} Default Path
                </span>
                <code className="block bg-black/30 px-3 py-2 rounded text-sm font-mono text-primary/90 break-all">
                  {getDefaultPath(selectedOS)}
                </code>
              </div>
              <p className="text-xs text-muted-foreground">
                Select your operating system to see the default socket path for your system. You still need to confirm or adjust the value below—some nodes store the socket somewhere custom.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="socketPath" className="text-white font-medium">
                Bitcoin Socket ABSOLUTE Path <span className="text-primary">*</span>
              </Label>
              <Input 
                id="socketPath" 
                placeholder={formatAbsoluteExample(getDefaultPath(selectedOS))}
                value={socketPath} 
                onChange={(e) => setSocketPath(e.target.value)}
                required
                className="bg-white/5 border-2 border-white/30 font-mono text-sm text-white placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/50 hover:border-white/50 hover:bg-white/10 transition-all cursor-text"
              />
              <p className="text-xs text-muted-foreground">
                <strong className="text-white/80">Enter or modify</strong> the full path to your <code className="text-primary">node.sock</code> file. The field is pre-filled with the default for the selected OS, but keep typing if you already customized your node.
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

