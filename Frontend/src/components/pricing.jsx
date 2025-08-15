import Navbar from "./navbar";

const Pricing = () => {
  return (
    <div>
      <Navbar />
    <section className="bg-gray-50 dark:bg-gray-800 py-16 h-screen">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">Pricing Plans</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {/* Free Plan */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-md">
            <h3 className="text-xl font-semibold text-indigo-600 dark:text-indigo-400">Free</h3>
            <p className="text-gray-600 dark:text-gray-300 my-4">Great for quick fixes and light users</p>
            <ul className="text-center text-gray-700 dark:text-gray-200 space-y-2">
              <li>✔ Audio call support</li>
              <li>✔ Image sharing</li>
              <li>✖ Video upload</li>
              <li>✖ Screen sharing</li>
            </ul>
          </div>

          {/* Premium Plan */}
          <div className="bg-indigo-100 dark:bg-indigo-900 p-6 rounded-xl shadow-md">
            <h3 className="text-xl font-semibold text-indigo-700 dark:text-white">Premium - 1000₹ Monthly</h3>
            <p className="text-gray-700 dark:text-indigo-200 my-4">Full access for power users & teams</p>
            <ul className="text-center text-gray-800 dark:text-white space-y-2">
              <li>✔ Audio & video calls</li>
              <li>✔ Image & video sharing</li>
              <li>✔ Screen sharing</li>
              <li>✔ Priority support</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
    </div>
  );
};

export default Pricing;
