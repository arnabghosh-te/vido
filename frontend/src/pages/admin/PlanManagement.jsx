import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import { fetchAdminPlans, createPlan, deactivatePlan, reactivatePlan, updatePlan } from '../../api/planApi';

const PlanManagement = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    tokensIncluded: '',
    durationInDays: ''
  });

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const data = await fetchAdminPlans();
      setPlans(data.plans);
    } catch (error) {
      console.error('Failed to load plans', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmitPlan = async (e) => {
    e.preventDefault();
    try {
      const planData = {
        ...formData,
        price: parseFloat(formData.price),
        tokensIncluded: parseInt(formData.tokensIncluded, 10),
        durationInDays: parseInt(formData.durationInDays, 10)
      };

      if (editingPlanId) {
        await updatePlan(editingPlanId, planData);
      } else {
        await createPlan(planData);
      }
      
      closeModal();
      loadPlans();
    } catch (error) {
      alert(editingPlanId ? 'Failed to update plan' : 'Failed to create plan');
    }
  };

  const handleEditPlan = (plan) => {
    setEditingPlanId(plan.id);
    setFormData({
      name: plan.name,
      description: plan.description,
      price: plan.price,
      tokensIncluded: plan.tokensIncluded,
      durationInDays: plan.durationInDays
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingPlanId(null);
    setFormData({ name: '', description: '', price: '', tokensIncluded: '', durationInDays: '' });
  };

  const handleDeactivate = async (id) => {
    if (window.confirm('Are you sure you want to deactivate this plan?')) {
      try {
        await deactivatePlan(id);
        loadPlans();
      } catch (error) {
        alert('Failed to deactivate plan');
      }
    }
  };

  const handleReactivate = async (id) => {
    if (window.confirm('Are you sure you want to reactivate this plan?')) {
      try {
        await reactivatePlan(id);
        loadPlans();
      } catch (error) {
        alert('Failed to reactivate plan');
      }
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
      <Sidebar />
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Plan Management</h1>
          <button
            onClick={() => {
              setEditingPlanId(null);
              setFormData({ name: '', description: '', price: '', tokensIncluded: '', durationInDays: '' });
              setShowModal(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            Create New Plan
          </button>
        </div>
        
        {loading ? (
          <p className="text-gray-800 dark:text-white">Loading...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map(plan => (
              <div key={plan.id} className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-t-4 transition-colors duration-200 ${plan.isActive ? 'border-green-500' : 'border-red-500'}`}>
                <div className="flex justify-between items-start">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white">{plan.name}</h2>
                  <span className={`px-2 py-1 text-xs rounded-full ${plan.isActive ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'}`}>
                    {plan.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm h-10 overflow-hidden">{plan.description}</p>
                <div className="mt-4">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">${plan.price}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Duration: {plan.durationInDays} days</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Tokens Included: {plan.tokensIncluded}</p>
                </div>
                {plan.isActive ? (
                  <div className="mt-6 flex space-x-2">
                    <button
                      onClick={() => handleEditPlan(plan)}
                      className="flex-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800/50 font-bold py-2 px-4 rounded transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeactivate(plan.id)}
                      className="flex-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800/50 font-bold py-2 px-4 rounded transition-colors"
                    >
                      Deactivate
                    </button>
                  </div>
                ) : (
                  <div className="mt-6 flex space-x-2">
                    <button
                      onClick={() => handleEditPlan(plan)}
                      className="flex-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800/50 font-bold py-2 px-4 rounded transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleReactivate(plan.id)}
                      className="flex-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-800/50 font-bold py-2 px-4 rounded transition-colors"
                    >
                      Activate
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Create / Edit Plan Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md transition-colors duration-200">
              <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">{editingPlanId ? 'Edit Plan' : 'Create New Plan'}</h2>
              <form onSubmit={handleSubmitPlan}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Plan Name</label>
                  <input type="text" name="name" required value={formData.name} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm p-2 transition-colors duration-200" />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                  <textarea name="description" required value={formData.description} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm p-2 transition-colors duration-200" rows="2"></textarea>
                </div>
                <div className="mb-4 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Price ($)</label>
                    <input type="number" step="0.01" name="price" required value={formData.price} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm p-2 transition-colors duration-200" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Duration (Days)</label>
                    <input type="number" name="durationInDays" required value={formData.durationInDays} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm p-2 transition-colors duration-200" />
                  </div>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tokens Included</label>
                  <input type="number" name="tokensIncluded" required value={formData.tokensIncluded} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md shadow-sm p-2 transition-colors duration-200" />
                </div>
                <div className="flex justify-end space-x-3">
                  <button type="button" onClick={closeModal} className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-2 px-4 rounded transition-colors duration-200">Cancel</button>
                  <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors">{editingPlanId ? 'Update Plan' : 'Create Plan'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlanManagement;
