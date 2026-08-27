import JournalPostClient from "@/components/JournalPostClient";
import { journalPosts } from "@/data/products";
import { getCachedPostsState } from "@/lib/site-data";

export const revalidate = 86400;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const postsState = await getCachedPostsState();
  const post = postsState.data.find((item) => item.slug === slug) || (!postsState.loaded ? journalPosts.find((item) => item.slug === slug) : null);
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
  const postsState = await getCachedPostsState();

  return <JournalPostClient slug={slug} initialPosts={postsState.data} initialPostsLoaded={postsState.loaded} />;
}
