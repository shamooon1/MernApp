import React, { useState } from "react";

const Plans = () => {
  const [plans, setPlans] = useState([
    { id: 1, name: "Free", price: 0, limit: "Basic usage" },
    { id: 2, name: "Premium", price: 79, limit: "Unlimited usage" },
  ]);

  const [newPlan, setNewPlan] = useState({ name: "", price: "", limit: "" });

  const handleAddPlan = (e) => {
    e.preventDefault();
    if (!newPlan.name || !newPlan.price || !newPlan.limit) return;
    setPlans([
      ...plans,
      { id: Date.now(), name: newPlan.name, price: Number(newPlan.price), limit: newPlan.limit },
    ]);
    setNewPlan({ name: "", price: "", limit: "" });
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Plan Management</h1>

      {/* Plan Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Plan</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Price ($)</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Usage Limit</th>
            </tr>
          </thead>
          <tbody>
            {plans.map((plan) => (
              <tr key={plan.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4 text-sm text-gray-800">{plan.name}</td>
                <td className="py-3 px-4 text-sm text-gray-800">{plan.price}</td>
                <td className="py-3 px-4 text-sm text-gray-600">{plan.limit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form onSubmit={handleAddPlan} className="bg-white p-4 rounded-lg shadow border space-y-4">
        <h2 className="text-lg font-semibold">Add New Plan</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Plan Name"
            value={newPlan.name}
            onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
            className="border rounded-md px-3 py-2 text-sm w-full focus:ring focus:ring-blue-300"
          />
          <input
            type="number"
            placeholder="Price"
            value={newPlan.price}
            onChange={(e) => setNewPlan({ ...newPlan, price: e.target.value })}
            className="border rounded-md px-3 py-2 text-sm w-full focus:ring focus:ring-blue-300"
          />
          <input
            type="text"
            placeholder="Usage Limit"
            value={newPlan.limit}
            onChange={(e) => setNewPlan({ ...newPlan, limit: e.target.value })}
            className="border rounded-md px-3 py-2 text-sm w-full focus:ring focus:ring-blue-300"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
        >
          Add Plan
        </button>
      </form>
    </div>
  );
}
export default Plans;