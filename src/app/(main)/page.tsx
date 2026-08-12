import HomeMenu from '@/components/HomeMenu';
import NearestEvents from '@/components/NearestEvents';
import PageContent from '@/components/PageContent';
import UserMembershipDisplay from '@/components/UserMembershipDisplay';
import { prefetchNearestEvents } from '@/hooks/useNearestEvents';
import { HydrationBoundary } from '@tanstack/react-query';

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
      <UserMembershipDisplay />
      <HomeMenu />

      {/* events */}
      <HydrationBoundary state={dehydratedState}>
        <NearestEvents />
      </HydrationBoundary>
    </PageContent>
  );
};

export default Home;
