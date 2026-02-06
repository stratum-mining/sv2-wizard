// Pool configuration form component

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Slider } from "../../components/ui/slider";

export const PoolConfigForm = ({ data, updateData, onContinue }: any) => {
  const [poolSignature, setPoolSignature] = useState(data.poolSignature || "Stratum V2 SRI Pool");
  const [payoutAddress, setPayoutAddress] = useState(data.poolPayoutAddress || "");
  const [sharesPerMinute, setSharesPerMinute] = useState(data.sharesPerMinute || 6.0);
  const [feeThreshold, setFeeThreshold] = useState(data.feeThreshold || 100);
  const [minInterval, setMinInterval] = useState(data.minInterval || 5);
  const [shareBatchSize, setShareBatchSize] = useState(data.shareBatchSize || 10);
  const [isOpen, setIsOpen] = useState(false);
  
  // Determine network from data or default to mainnet
  const network = data?.selectedNetwork || "mainnet";
  const payoutPlaceholder = network === "testnet4" ? "tb1q..." : "bc1q...";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateData({ 
      poolSignature, 
      poolPayoutAddress: payoutAddress, 
      sharesPerMinute,
      feeThreshold,
      minInterval,
      shareBatchSize
    });
    onContinue();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-md mx-auto">
      <div className="space-y-2">
        <Label htmlFor="poolSignature">Pool Signature <span className="text-primary">*</span></Label>
        <Input 
          id="poolSignature" 
          placeholder="Stratum V2 SRI Pool" 
          value={poolSignature} 
          onChange={(e) => setPoolSignature(e.target.value)}
          required

        />
        <p className="text-xs text-muted-foreground">String included in the coinbase transaction.</p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="payoutAddress">Pool Payout Address (Revenue) <span className="text-primary">*</span></Label>
        <Input 
          id="payoutAddress" 
          placeholder={payoutPlaceholder}
          value={payoutAddress} 
          onChange={(e) => setPayoutAddress(e.target.value)}
          required

        />
        <p className="text-xs text-muted-foreground">
          Bitcoin address that will collect the block reward in the coinbase transaction.
        </p>
      </div>

      <div className="w-full space-y-2 border border-border rounded-lg bg-muted p-4">
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
             <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                  <Label htmlFor="feeThreshold">Fee Threshold</Label>
                  <Input 
                    id="feeThreshold" 
                    type="number"
                    value={feeThreshold} 
                    onChange={(e) => setFeeThreshold(parseInt(e.target.value) || 0)}
          
                  />
                  <p className="text-xs text-muted-foreground">Minimum fee threshold to trigger new templates from the node.</p>
               </div>
               <div className="space-y-2">
                  <Label htmlFor="minInterval">Min Interval</Label>
                  <Input 
                    id="minInterval" 
                    type="number"
                    value={minInterval} 
                    onChange={(e) => setMinInterval(parseInt(e.target.value) || 0)}
          
                  />
                  <p className="text-xs text-muted-foreground">Minimum interval (seconds) for generating templates to avoid overloading clients.</p>
               </div>
             </div>

             <div className="space-y-2">
                  <Label htmlFor="shareBatchSize">Share Batch Size</Label>
                  <Input 
                    id="shareBatchSize" 
                    type="number"
                    value={shareBatchSize} 
                    onChange={(e) => setShareBatchSize(parseInt(e.target.value))}
          
                  />
                  <p className="text-xs text-muted-foreground">How many shares do we want to acknowledge in a batch.</p>
             </div>

             <div className="space-y-2 pt-2">
              <div className="flex justify-between">
                <Label>Shares Per Minute (VarDiff)</Label>
                <span className="text-sm text-primary font-mono">{sharesPerMinute}</span>
              </div>
              <Slider 
                value={[sharesPerMinute]} 
                onValueChange={(val) => setSharesPerMinute(val[0])} 
                max={20} 
                step={0.5} 
                className="py-2"
              />
              <p className="text-xs text-muted-foreground">Target number of shares per minute per connection.</p>
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

