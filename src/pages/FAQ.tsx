import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  HelpCircle, 
  MessageCircle, 
  Mail, 
  Phone,
  Coins,
  Gift,
  Shield,
  Clock
} from 'lucide-react';

const FAQ = () => {
  const faqData = [
    {
      category: "Getting Started",
      icon: HelpCircle,
      color: "bg-primary/20 text-primary",
      questions: [
        {
          question: "How do I start earning loyalty coins?",
          answer: "You can earn loyalty coins by using coupon codes from partner websites, completing promotional activities, making purchases through our partner network, and participating in special campaigns. Each activity has different coin values based on the engagement level."
        },
        {
          question: "What is the OmniChannel reward system?",
          answer: "OmniChannel is a unified loyalty platform that connects multiple brands and services. Instead of having separate loyalty programs for each brand, you earn coins that can be redeemed across our entire partner network for various rewards including gift cards, discounts, and exclusive experiences."
        },
        {
          question: "How do I redeem my loyalty coins?",
          answer: "Visit the Rewards section to browse available rewards. Each reward shows the required coins. Simply click 'Redeem Now' if you have enough coins. You'll receive a confirmation email with redemption details and any applicable codes."
        }
      ]
    },
    {
      category: "Coins & Points",
      icon: Coins,
      color: "bg-secondary/20 text-secondary",
      questions: [
        {
          question: "Do my loyalty coins expire?",
          answer: "Loyalty coins are valid for 24 months from the date they were earned. You'll receive email notifications 3 months and 1 month before any coins are set to expire, giving you plenty of time to use them."
        },
        {
          question: "What's the difference between loyalty coins and total points earned?",
          answer: "Loyalty coins are your current balance available for redemption. Total points earned is the lifetime cumulative amount you've gained, including coins already spent. This helps track your overall engagement and tier progression."
        },
        {
          question: "How is my membership tier calculated?",
          answer: "Membership tiers (Bronze, Silver, Gold, Platinum) are based on your total points earned. Bronze: 0-999, Silver: 1,000-4,999, Gold: 5,000-14,999, Platinum: 15,000+. Higher tiers unlock exclusive rewards and better redemption rates."
        }
      ]
    },
    {
      category: "Rewards & Redemption",
      icon: Gift,
      color: "bg-success/20 text-success",
      questions: [
        {
          question: "How long does it take to receive my reward?",
          answer: "Digital rewards (gift cards, vouchers) are typically delivered within 24 hours. Physical rewards may take 3-7 business days depending on your location. You'll receive tracking information for all shipments."
        },
        {
          question: "Can I cancel or modify a redemption?",
          answer: "Redemptions can be cancelled within 24 hours if the reward hasn't been processed yet. Contact our support team immediately if you need to make changes. Processed digital rewards cannot be cancelled."
        },
        {
          question: "What happens if a reward is out of stock?",
          answer: "If a reward becomes unavailable after redemption, we'll either provide a suitable alternative of equal or greater value, or refund your coins. You'll be contacted within 48 hours with available options."
        }
      ]
    },
    {
      category: "Account & Security",
      icon: Shield,
      color: "bg-destructive/20 text-destructive",
      questions: [
        {
          question: "How is my personal information protected?",
          answer: "We use enterprise-grade encryption and security measures to protect your data. Your information is never shared with third parties without explicit consent. All transactions are secured with SSL encryption and fraud detection systems."
        },
        {
          question: "Can I transfer coins to another account?",
          answer: "For security reasons, loyalty coins cannot be transferred between accounts. Each account's coins are tied to the individual's activity and verification. This prevents fraud and ensures fair distribution of rewards."
        },
        {
          question: "What should I do if I notice unauthorized activity?",
          answer: "Immediately contact our support team and change your password. We monitor all accounts for suspicious activity and will investigate any concerns. Enable two-factor authentication for additional security."
        }
      ]
    }
  ];

  const supportOptions = [
    {
      title: "Live Chat",
      description: "Get instant help from our support team",
      icon: MessageCircle,
      action: "Start Chat",
      availability: "24/7 Available"
    },
    {
      title: "Email Support",
      description: "Send us detailed questions anytime",
      icon: Mail,
      action: "Send Email",
      availability: "Response within 24h"
    },
    {
      title: "Phone Support",
      description: "Speak directly with our experts",
      icon: Phone,
      action: "Call Now",
      availability: "Mon-Fri 9AM-6PM"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary-glow to-secondary bg-clip-text text-transparent">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-muted-foreground">
            Find answers to common questions about the OmniChannel reward system
          </p>
        </div>

        {/* FAQ Sections */}
        <div className="space-y-8">
          {faqData.map((category, categoryIndex) => (
            <Card key={categoryIndex} className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${category.color}`}>
                    <category.icon className="w-5 h-5" />
                  </div>
                  {category.category}
                  <Badge variant="outline">{category.questions.length} questions</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="space-y-2">
                  {category.questions.map((faq, faqIndex) => (
                    <AccordionItem 
                      key={faqIndex} 
                      value={`${categoryIndex}-${faqIndex}`}
                      className="border rounded-lg px-4"
                    >
                      <AccordionTrigger className="text-left hover:no-underline">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground leading-relaxed">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact Support */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-center">Still need help?</CardTitle>
            <CardDescription className="text-center">
              Our support team is here to assist you with any questions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              {supportOptions.map((option, index) => (
                <div key={index} className="text-center space-y-4 p-6 rounded-lg bg-muted/30">
                  <div className="mx-auto w-12 h-12 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 flex items-center justify-center">
                    <option.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{option.title}</h3>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </div>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full">
                      {option.action}
                    </Button>
                    <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {option.availability}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Tips */}
        <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-center">Quick Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 rounded-lg bg-background/50">
                <div className="p-2 rounded-full bg-primary/20 text-primary">
                  <Coins className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-medium">Maximize Your Earnings</h4>
                  <p className="text-sm text-muted-foreground">
                    Check for new coupon codes weekly and combine multiple offers for bonus coins
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-lg bg-background/50">
                <div className="p-2 rounded-full bg-secondary/20 text-secondary">
                  <Gift className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-medium">Smart Redemption</h4>
                  <p className="text-sm text-muted-foreground">
                    Higher tier members get exclusive rewards and better redemption rates
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FAQ;