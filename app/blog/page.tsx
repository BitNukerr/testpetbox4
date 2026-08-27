import JournalClient from "@/components/JournalClient";
import { getCachedPosts } from "@/lib/site-data";

export const revalidate = 86400;

export default async function BlogPage() {
  const initialPosts = await getCachedPosts();

  return (
    <section className="container section">
      <span className="eyebrow">Blog</span>
      <h1>Dicas de cuidados e inspiracao PetBox</h1>
      <JournalClient initialPosts={initialPosts} />
    </section>
  );
}
