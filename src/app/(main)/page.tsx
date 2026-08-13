import HomeMenu from '@/components/HomeMenu';
import NearestEvents from '@/components/NearestEvents';
import PageContent from '@/components/PageContent';
import UserMembershipDisplay from '@/components/UserMembershipDisplay';

// NearestEvents fetches client-side and renders its own skeleton while loading,
// so the page shell paints immediately instead of blocking on event data.
const Home = () => {
  return (
    <PageContent>
      <UserMembershipDisplay />
      <HomeMenu />
      <NearestEvents />
    </PageContent>
  );
};

export default Home;
