import JournalClient from "@/components/JournalClient";
import { getCachedPostsState } from "@/lib/site-data";

export const revalidate = 86400;

export default async function BlogPage() {
  const postsState = await getCachedPostsState();

  return (
    <section className="container section">
      <span className="eyebrow">Blog</span>
      <h1>Dicas de cuidados e inspiração PetBox</h1>
      <JournalClient initialPosts={postsState.data} initialPostsLoaded={postsState.loaded} />
    </section>
  );
}
