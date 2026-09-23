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
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Plan Management</h1>
          <button
            onClick={() => {
              setEditingPlanId(null);
              setFormData({ name: '', description: '', price: '', tokensIncluded: '', durationInDays: '' });
              setShowModal(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Create New Plan
          </button>
        </div>
        
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map(plan => (
              <div key={plan.id} className={`bg-white rounded-lg shadow p-6 border-t-4 ${plan.isActive ? 'border-green-500' : 'border-red-500'}`}>
                <div className="flex justify-between items-start">
                  <h2 className="text-xl font-bold text-gray-800">{plan.name}</h2>
                  <span className={`px-2 py-1 text-xs rounded-full ${plan.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {plan.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-gray-600 mt-2 text-sm h-10 overflow-hidden">{plan.description}</p>
                <div className="mt-4">
                  <p className="text-2xl font-bold text-gray-900">${plan.price}</p>
                  <p className="text-sm text-gray-500">Duration: {plan.durationInDays} days</p>
                  <p className="text-sm text-gray-500">Tokens Included: {plan.tokensIncluded}</p>
                </div>
                {plan.isActive ? (
                  <div className="mt-6 flex space-x-2">
                    <button
                      onClick={() => handleEditPlan(plan)}
                      className="flex-1 bg-blue-100 text-blue-600 hover:bg-blue-200 font-bold py-2 px-4 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeactivate(plan.id)}
                      className="flex-1 bg-red-100 text-red-600 hover:bg-red-200 font-bold py-2 px-4 rounded"
                    >
                      Deactivate
                    </button>
                  </div>
                ) : (
                  <div className="mt-6 flex space-x-2">
                    <button
                      onClick={() => handleEditPlan(plan)}
                      className="flex-1 bg-blue-100 text-blue-600 hover:bg-blue-200 font-bold py-2 px-4 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleReactivate(plan.id)}
                      className="flex-1 bg-green-100 text-green-600 hover:bg-green-200 font-bold py-2 px-4 rounded"
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
            <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
              <h2 className="text-2xl font-bold mb-6">{editingPlanId ? 'Edit Plan' : 'Create New Plan'}</h2>
              <form onSubmit={handleSubmitPlan}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Plan Name</label>
                  <input type="text" name="name" required value={formData.name} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea name="description" required value={formData.description} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" rows="2"></textarea>
                </div>
                <div className="mb-4 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Price ($)</label>
                    <input type="number" step="0.01" name="price" required value={formData.price} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Duration (Days)</label>
                    <input type="number" name="durationInDays" required value={formData.durationInDays} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                  </div>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700">Tokens Included</label>
                  <input type="number" name="tokensIncluded" required value={formData.tokensIncluded} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                </div>
                <div className="flex justify-end space-x-3">
                  <button type="button" onClick={closeModal} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded">Cancel</button>
                  <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">{editingPlanId ? 'Update Plan' : 'Create Plan'}</button>
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
