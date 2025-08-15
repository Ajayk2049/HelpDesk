import Navbar from '../components/navbar';
import Hero from '../components/hero';
import Pricing from '../components/pricing';

const Home = () => {
  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen">
      <Navbar />
      <Hero />
    </div>
  );
};

export default Home;
