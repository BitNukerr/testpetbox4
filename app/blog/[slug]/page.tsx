import JournalPostClient from "@/components/JournalPostClient";
import { journalPosts } from "@/data/products";
import { getCachedPosts } from "@/lib/site-data";

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const publishedPosts = await getCachedPosts();
  const post = publishedPosts.find((item) => item.slug === slug) || journalPosts.find((item) => item.slug === slug);
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

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const initialPosts = await getCachedPosts();

  return <JournalPostClient slug={slug} initialPosts={initialPosts} />;
}
