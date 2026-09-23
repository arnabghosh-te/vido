import React, { useEffect, useState } from 'react';
import { fetchPublicPlans } from '../api/planApi';
import { subscribeToPlan } from '../api/subscriptionApi';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Pricing = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const data = await fetchPublicPlans();
      setPlans(data.plans);
    } catch (error) {
      console.error('Failed to load active plans', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId) => {
    if (!user) {
      alert("Please login to subscribe");
      return;
    }
    try {
      const res = await subscribeToPlan(planId);
      if (res.data?.checkoutUrl) {
        window.location.href = res.data.checkoutUrl;
      } else {
        alert("Checkout URL not found");
      }
    } catch (error) {
      console.error('Subscription failed', error);
      alert(error.response?.data?.message || "Subscription failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
            Pricing Plans
          </h2>
          <p className="mt-4 text-xl text-gray-600 dark:text-gray-400">
            Choose the perfect plan for your needs
          </p>
          <div className="mt-4">
            <Link to="/" className="text-blue-600 dark:text-blue-400 hover:text-blue-500 font-medium">
              &larr; Back to Home
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center">
            <p className="text-xl text-gray-500 dark:text-gray-400">Loading plans...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div key={plan.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg divide-y divide-gray-200 dark:divide-gray-700 flex flex-col transition-colors duration-200">
                <div className="p-6 flex-1">
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white text-center">{plan.name}</h3>
                  <p className="mt-4 text-gray-500 dark:text-gray-400 text-sm text-center h-12">{plan.description}</p>
                  <p className="mt-8 text-center">
                    <span className="text-4xl font-extrabold text-gray-900 dark:text-white">${plan.price}</span>
                    <span className="text-base font-medium text-gray-500 dark:text-gray-400">/{plan.durationInDays} days</span>
                  </p>
                  <ul className="mt-8 space-y-4">
                    <li className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="ml-3 text-base text-gray-700 dark:text-gray-300">{plan.tokensIncluded} Tokens included</p>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="ml-3 text-base text-gray-700 dark:text-gray-300">Access to all features</p>
                    </li>
                  </ul>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-700/50 rounded-b-lg">
                  <button 
                    onClick={() => handleSubscribe(plan.id)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md transition duration-150 shadow">
                    Subscribe Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Pricing;
