import JournalPostClient from "@/components/JournalPostClient";
import { journalPosts } from "@/data/products";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = journalPosts.find((item) => item.slug === slug);
  if (!post) return { title: "Blog | PetBox" };

  return {
    title: `${post.title} | PetBox`,
    description: post.excerpt,
    openGraph: {
      title: `${post.title} | PetBox`,
      description: post.excerpt,
      images: ["/images/about-pets.svg"]
    }
  };
}

export default async function JournalPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  return <JournalPostClient slug={slug} />;
}
