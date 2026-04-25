import JournalPostClient from "@/components/JournalPostClient";

export default async function JournalPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  return <JournalPostClient slug={slug} />;
}
