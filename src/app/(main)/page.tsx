import HomeMenu from '@/components/HomeMenu';
import HydrateClient from '@/components/HydrateClient';
import NearestEvents from '@/components/NearestEvents';
import PageContent from '@/components/PageContent';
import TopHeader from '@/components/TopHeader';
import { prefetchNearestEvents } from '@/hooks/useNearestEvents';

const Home = async () => {
  let dehydratedState;

  try {
    // Skip prefetch during build time to prevent hanging
    if (process.env.NEXT_PHASE !== 'phase-production-build') {
      dehydratedState = await prefetchNearestEvents();
    }
  } catch (error) {
    console.warn('Failed to prefetch nearest events:', error);
    dehydratedState = null;
  }

  return (
    <PageContent>
      <TopHeader />
      <HomeMenu />

      {/* events */}
      <HydrateClient state={dehydratedState}>
        <NearestEvents />
      </HydrateClient>
    </PageContent>
  );
};

export default Home;
