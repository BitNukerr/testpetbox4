import JournalPostClient from "@/components/JournalPostClient";

export default function JournalPostPage({ params }: { params: { slug: string } }) {
  return <JournalPostClient slug={params.slug} />;
}
