import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type FaqItem = {
  question: string;
  answer: string;
};

type FaqGroup = {
  category: string;
  items: FaqItem[];
};

interface FaqListProps {
  faqGroups: FaqGroup[];
}

export function FaqList({ faqGroups }: FaqListProps) {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="space-y-10">
          {faqGroups.map((group) => (
            <div key={group.category}>
              <h2 className="text-2xl font-semibold tracking-tight">
                {group.category}
              </h2>

              <div className="mt-5 rounded-3xl border bg-card p-2 shadow-sm">
                <Accordion type="single" collapsible className="w-full py-2">
                  {group.items.map((item, index) => (
                    <AccordionItem
                      key={item.question}
                      value={`${group.category}-${index}`}
                    >
                      <AccordionTrigger className="text-left font-semibold mx-4">
                        {item.question}
                      </AccordionTrigger>

                      <AccordionContent className="text-sm leading-6 text-muted-foreground mx-4">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
