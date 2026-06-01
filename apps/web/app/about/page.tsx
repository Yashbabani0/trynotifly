import { AboutCta } from "@/components/about/about-cta";
import { AboutHero } from "@/components/about/about-hero";
import { AboutMission } from "@/components/about/about-mission";
import { AboutPlatform } from "@/components/about/about-platform";
import { AboutStory } from "@/components/about/about-story";
import { AboutValues } from "@/components/about/about-values";
import { Cta } from "@/components/home/cta";

export default function AboutPage() {
  return (
    <main>
      <AboutHero />
      <AboutStory />
      <AboutMission />
      <AboutValues />
      <AboutPlatform />
      <Cta />
    </main>
  );
}
