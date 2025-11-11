import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Sparkles, Coins, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Hero Section */}
      <div className="flex items-center justify-center min-h-[80vh] px-4">
        <div className="text-center space-y-8 max-w-5xl mx-auto">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary font-medium">Enterprise-Grade Security</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-primary-glow to-secondary bg-clip-text text-transparent animate-glow">
              OmniChannel Rewards
            </h1>
            
            <p className="text-2xl md:text-3xl text-foreground/90 font-semibold">
              Your Reward, Your Way
            </p>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Transform your loyalty into rewards with our revolutionary omnichannel platform. 
              Earn coins from multiple sources and redeem amazing rewards with military-grade cryptographic security.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button 
              variant="default" 
              size="lg" 
              onClick={() => navigate('/auth')}
              className="bg-primary hover:bg-primary-dark text-primary-foreground shadow-lg hover:shadow-xl transition-all"
            >
              Get Started <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              onClick={() => navigate('/faq')}
              className="border-primary/30 hover:bg-primary/10"
            >
              Learn More
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="pb-24 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">
            Powered by Advanced Cryptography
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 bg-card/50 backdrop-blur border-primary/20 hover:border-primary/40 transition-all hover:shadow-lg">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">AES-256 Encryption</h3>
                <p className="text-muted-foreground">
                  Military-grade encryption protects your coupon codes and sensitive transaction data using AES-GCM with 256-bit keys.
                </p>
              </div>
            </Card>

            <Card className="p-6 bg-card/50 backdrop-blur border-primary/20 hover:border-primary/40 transition-all hover:shadow-lg">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <Lock className="w-6 h-6 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">SHA-256 Hashing</h3>
                <p className="text-muted-foreground">
                  Transaction integrity verified with cryptographic hashes. Every transaction is protected against tampering and replay attacks.
                </p>
              </div>
            </Card>

            <Card className="p-6 bg-card/50 backdrop-blur border-primary/20 hover:border-primary/40 transition-all hover:shadow-lg">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
                  <Coins className="w-6 h-6 text-success" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Secure Nonces</h3>
                <p className="text-muted-foreground">
                  Cryptographically secure random nonces prevent replay attacks. Each transaction is unique and cannot be duplicated.
                </p>
              </div>
            </Card>
          </div>

          <div className="text-center mt-12">
            <p className="text-sm text-muted-foreground">
              Built with Web Crypto API • Supabase Edge Functions • Row-Level Security
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
