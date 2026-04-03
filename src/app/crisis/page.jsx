"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Phone, PhoneCall, Globe, Wind, HeartPulse } from "lucide-react";
import Link from "next/link";

export default function CrisisSupport() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out pb-10">
      <Card className="bg-destructive/10 border-0 shadow-sm">
        <CardContent className="p-8 text-center flex flex-col items-center">
          <div className="bg-destructive/20 p-4 rounded-full mb-4">
            <HeartPulse className="h-10 w-10 text-destructive" />
          </div>
          <h2 className="text-2xl md:text-3xl font-heading font-bold text-destructive mb-2">
            You are not alone. Help is available right now. 💜
          </h2>
          <p className="text-muted-foreground/80 font-medium max-w-md mt-2">
            It's okay to ask for help. There are people who want to support you
            through this exact moment.
          </p>

          <div className="mt-8 flex flex-col w-full sm:w-auto gap-4">
            <a 
              href="tel:0376272929"
              className={buttonVariants({ 
                size: "lg", 
                className: "rounded-full bg-destructive hover:bg-destructive/90 text-white font-bold h-14 text-lg px-8 shadow-sm" 
              })}
            >
              <PhoneCall className="mr-2 h-5 w-5" /> Talk to Someone Now
            </a>
            <a 
              href="tel:999"
              className={buttonVariants({ 
                size: "lg", 
                variant: "outline", 
                className: "rounded-full border-destructive/30 text-destructive hover:bg-destructive/5 font-semibold h-12 flex items-center justify-center" 
              })}
            >
              Emergency Services
            </a>
          </div>
        </CardContent>
      </Card>

      <div className="mt-8">
        <h3 className="font-heading text-xl font-bold mb-4">
          Helplines near you
        </h3>
        <Card className="border-0 shadow-sm ring-1 ring-border/50">
          <CardContent className="p-0 divide-y divide-border/50">
            <div className="flex items-center justify-between p-4 hover:bg-secondary/20 transition-colors">
              <div className="flex items-center gap-4">
                <div className="bg-secondary p-2.5 rounded-full text-foreground">
                  🇲🇾
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    Befrienders KL
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Free, confidential 24/7 support
                  </p>
                </div>
              </div>
              <a 
                href="tel:0376272929"
                className={buttonVariants({ 
                  variant: "ghost", 
                  size: "sm", 
                  className: "text-primary hover:bg-primary/10 hover:text-primary rounded-full px-4 flex items-center" 
                })}
              >
                <Phone className="h-4 w-4 mr-2" /> 03-7627 2929
              </a>
            </div>

            <div className="flex items-center justify-between p-4 hover:bg-secondary/20 transition-colors">
              <div className="flex items-center gap-4">
                <div className="bg-secondary p-2.5 rounded-full text-foreground">
                  🇲🇾
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    Mental Health Psychosocial Support
                  </p>
                  <p className="text-sm text-muted-foreground">
                    MOH & Mercy Malaysia
                  </p>
                </div>
              </div>
              <a 
                href="tel:1800820066"
                className={buttonVariants({ 
                  variant: "ghost", 
                  size: "sm", 
                  className: "text-primary hover:bg-primary/10 hover:text-primary rounded-full px-4 flex items-center" 
                })}
              >
                <Phone className="h-4 w-4 mr-2" /> 1-800-82-0066
              </a>
            </div>

            <div className="flex items-center justify-between p-4 hover:bg-secondary/20 transition-colors">
              <div className="flex items-center gap-4">
                <div className="bg-secondary p-2.5 rounded-full text-foreground">
                  🌍
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    International Association for Suicide Prevention
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Find a crisis center anywhere in the world
                  </p>
                </div>
              </div>
              <a 
                href="https://www.iasp.info/resources/Crisis_Centres/" 
                target="_blank" 
                rel="noopener noreferrer"
                className={buttonVariants({ 
                  variant: "ghost", 
                  size: "sm", 
                  className: "text-primary hover:bg-primary/10 hover:text-primary rounded-full px-4 flex items-center" 
                })}
              >
                <Globe className="h-4 w-4 mr-2" /> Search Directory
              </a>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Link href="/tools?tab=grounding">
          <Card className="border-0 shadow-sm ring-1 ring-border/50 bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer group">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-background text-primary p-3 rounded-full border border-border">
                  <Wind className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    Need to calm down right now?
                  </h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Try the 5-4-3-2-1 Grounding Technique
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <p className="text-center text-xs text-muted-foreground mt-8">
        This page is always accessible from the top navigation bar.
      </p>
    </div>
  );
}
