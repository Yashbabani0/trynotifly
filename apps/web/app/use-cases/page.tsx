import { UseCasesCategories } from "@/components/use-cases/use-cases-categories";
import { UseCasesCta } from "@/components/use-cases/use-cases-cta";
import { UseCasesHero } from "@/components/use-cases/use-cases-hero";
import { UseCasesIndustries } from "@/components/use-cases/use-cases-industries";
import { UseCasesWorkflow } from "@/components/use-cases/use-cases-workflow";

export default function UseCasesPage() {
  return (
    <main>
      <UseCasesHero />
      <UseCasesCategories />
      <UseCasesIndustries />
      <UseCasesWorkflow />
      <UseCasesCta />
    </main>
  );
}
