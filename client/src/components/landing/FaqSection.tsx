import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Section } from "@/components/common/Section";

const FAQS = [
  {
    q: "Is DECIDE just another chatbot?",
    a: "No. You don't chat with it. You give it options and what matters. It returns one recommendation, the reasons, and the trade-off.",
  },
  {
    q: "Does it invent product specs?",
    a: "No. DECIDE works from what you provide. If a page can't be read, you'll be asked to paste the details instead of guessing.",
  },
  {
    q: "What does Free actually include?",
    a: "5 lifetime decision analyses — not 5 per month. After that, Pro or Premium keeps you deciding.",
  },
  {
    q: "Do I need an account to try it?",
    a: "No. Try DECIDE first. Create an account when you want to save a decision or continue past the guest limit.",
  },
  {
    q: "Can the recommendation be wrong?",
    a: "It can be incomplete if you haven't told it enough. That's why it shows confidence, missing information, and what-if changes.",
  },
];

function FaqSection() {
  return (
    <Section eyebrow="FAQ" title="Straight answers.">
      <div className="mx-auto max-w-2xl">
        <Accordion type="single" collapsible>
          {FAQS.map((item) => (
            <AccordionItem key={item.q} value={item.q}>
              <AccordionTrigger>{item.q}</AccordionTrigger>
              <AccordionContent>{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </Section>
  );
}

export { FaqSection };
