// Translator proxy configuration form component

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Network, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { DEFAULT_AUTHORITY_PUBLIC_KEY, getPoolConfig } from "../../config-templates";

export const TranslatorProxyConfigForm = ({ data, updateData, onContinue }: any) => {
  const [userIdentity, setUserIdentity] = useState(data.userIdentity || "");
  
  // Convert H/s to Th/s for display (1 Th/s = 1e12 H/s)
  const convertHashesToTerahashes = (hashesPerSecond: number): number => {
    return hashesPerSecond / 1e12;
  };
  
  // Convert Th/s to H/s for storage (1 Th/s = 1e12 H/s)
  const convertTerahashesToHashes = (terahashesPerSecond: number): number => {
    return terahashesPerSecond * 1e12;
  };
  
  // Initialize with Th/s value (convert from H/s if exists, otherwise default to 100 Th/s)
  const initialHashrateH = data.minIndividualMinerHashrate || 10000000000000.0; // Default: 100 Th/s in H/s
  const initialHashrateTh = convertHashesToTerahashes(initialHashrateH);
  const [minIndividualMinerHashrateTh, setMinIndividualMinerHashrateTh] = useState(initialHashrateTh);
  
  // Default aggregate_channels: true for non-JD (pool templates), false for JD (constructing templates)
  // If constructTemplates is true (JD), default to false. Otherwise default to true (non-JD).
  const constructTemplates = data?.constructTemplates;
  const defaultAggregateChannels = constructTemplates === true ? false : true; // false for JD, true for non-JD
  const [aggregateChannels, setAggregateChannels] = useState(data.aggregateChannels ?? defaultAggregateChannels);
  const [sharesPerMinute, setSharesPerMinute] = useState(data.clientSharesPerMinute || 6.0);
  
  // Get pool's authority pubkey if pool is selected, otherwise use default
  const selectedPoolConfig = useMemo(() => getPoolConfig(data?.selectedPool), [data?.selectedPool]);
  const defaultAuthorityPubkey = selectedPoolConfig?.authorityPubkey || DEFAULT_AUTHORITY_PUBLIC_KEY;
  const [upstreamAuthorityPubkey, setUpstreamAuthorityPubkey] = useState(
    data?.tproxyUpstreamAuthorityPubkey || defaultAuthorityPubkey
  );
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Convert Th/s to H/s before storing
    const minIndividualMinerHashrateH = convertTerahashesToHashes(minIndividualMinerHashrateTh);
    updateData({ 
      userIdentity,
      minIndividualMinerHashrate: minIndividualMinerHashrateH,
      aggregateChannels,
      clientSharesPerMinute: sharesPerMinute,
      tproxyUpstreamAuthorityPubkey: upstreamAuthorityPubkey
    });
    onContinue();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
         <h3 className="text-primary font-semibold flex items-center gap-2 mb-2">
           <Network className="w-4 h-4" /> Translator Proxy Configuration
         </h3>
         <p className="text-sm text-muted-foreground">
           Configure the translator proxy that connects miners to the pool.
         </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="userIdentity">User Identity <span className="text-primary">*</span></Label>
        <Input 
          id="userIdentity" 
          placeholder="your_username_here" 
          value={userIdentity} 
          onChange={(e) => setUserIdentity(e.target.value)}
          required
          className="bg-black/20 border-white/10"
        />
        <p className="text-xs text-muted-foreground">
          {constructTemplates === true 
            ? "Username of your account with the pool, used to open channels with the Job Declarator Client (JDC)."
            : "Username of your account with the pool, used to open channels with the Pool."}
        </p>
      </div>

      <div className="w-full space-y-2 border border-white/10 rounded-lg bg-white/5 p-4">
        <button 
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex justify-between items-center text-sm font-semibold hover:text-primary transition-colors"
        >
          <span>Advanced Configuration</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="space-y-4 pt-4"
          >
            <div className="space-y-2">
              <Label htmlFor="minIndividualMinerHashrate">Min Individual Miner Hashrate (Th/s)</Label>
              <Input 
                id="minIndividualMinerHashrate" 
                type="number"
                step="0.1"
                placeholder="100" 
                value={minIndividualMinerHashrateTh} 
                onChange={(e) => setMinIndividualMinerHashrateTh(parseFloat(e.target.value) || 0)}
                className="bg-black/20 border-white/10"
              />
              <p className="text-xs text-muted-foreground">
                Minimum hashrate threshold for individual miners, expressed in Th/s.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="aggregateChannels">Aggregate Channels</Label>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="aggregateChannels"
                  checked={aggregateChannels}
                  onChange={(e) => setAggregateChannels(e.target.checked)}
                  className="w-4 h-4 rounded border-white/20 bg-black/20 text-primary focus:ring-primary focus:ring-offset-0 focus:ring-2"
                />
                <label htmlFor="aggregateChannels" className="text-sm text-muted-foreground">
                  Enable channel aggregation
                </label>
              </div>
              <p className="text-xs text-muted-foreground">Whether to aggregate multiple channels from the same miner.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sharesPerMinute">Shares Per Minute</Label>
              <Input 
                id="sharesPerMinute" 
                type="number"
                step="0.1"
                value={sharesPerMinute} 
                onChange={(e) => setSharesPerMinute(parseFloat(e.target.value) || 0)}
                className="bg-black/20 border-white/10"
              />
              <p className="text-xs text-muted-foreground">Target number of shares per minute.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="upstreamAuthorityPubkey">Upstream Authority Public Key</Label>
              <Input 
                id="upstreamAuthorityPubkey" 
                placeholder={defaultAuthorityPubkey}
                value={upstreamAuthorityPubkey} 
                onChange={(e) => setUpstreamAuthorityPubkey(e.target.value)}
                className="bg-black/20 border-white/10 font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Authority public key of the upstream (JDC or Pool) that the translator connects to.
                {selectedPoolConfig && ` Default from ${selectedPoolConfig.name}.`}
              </p>
            </div>
          </motion.div>
        )}
      </div>

      <div className="pt-4 flex justify-end">
        <Button type="submit" className="w-full md:w-auto">
          Continue <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </div>
    </form>
  );
};

