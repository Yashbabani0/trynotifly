import { ChangelogCta } from "@/components/changelog/changelog-cta";
import { ChangelogHero } from "@/components/changelog/changelog-hero";
import { ChangelogList } from "@/components/changelog/changelog-list";

export default function ChangelogPage() {
  return (
    <main>
      <ChangelogHero />
      <ChangelogList />
      <ChangelogCta />
    </main>
  );
}
