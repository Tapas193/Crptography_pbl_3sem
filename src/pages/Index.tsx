import { Button } from "@/components/ui/button";
import { ArrowRight, Gift, Sparkles, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center">
      <div className="text-center space-y-8 p-8">
        <div className="space-y-4">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-primary via-primary-glow to-secondary bg-clip-text text-transparent animate-glow">
            OmniChannel
          </h1>
          <p className="text-3xl text-muted-foreground font-medium">Your Reward, Your Way</p>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Transform your loyalty into rewards with our revolutionary omnichannel platform. 
            Earn coins from multiple sources and redeem amazing rewards.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="hero" size="xl" onClick={() => navigate('/auth')}>
            Get Started <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <Button variant="outline" size="xl" onClick={() => navigate('/faq')}>
            Learn More
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
