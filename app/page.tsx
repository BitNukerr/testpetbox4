import HomeShowcaseClient from "@/components/HomeShowcaseClient";
import { getCachedHomepageData } from "@/lib/site-data";

export const revalidate = 300;

export default async function HomePage() {
  const homepageData = await getCachedHomepageData();
  return <HomeShowcaseClient {...homepageData} />;
}
