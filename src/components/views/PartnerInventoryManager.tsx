import React, { useState } from 'react';
import { Plus, Building, Car, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';

export type InventoryType = 'Hotel Room' | 'Cab';

export interface InventoryItem {
  id: string;
  type: InventoryType;
  title: string;
  price: number;
  location: string;
  availability: string;
  status: 'Active' | 'Sold Out';
  photo?: string;
}

export const PartnerInventoryManager: React.FC = () => {
  const [inventoryList, setInventoryList] = useState<InventoryItem[]>([
    {
      id: 'inv-1',
      type: 'Hotel Room',
      title: 'Deluxe AC Room',
      price: 2500,
      location: 'Goa',
      availability: 'Available All Year',
      status: 'Active',
    },
    {
      id: 'inv-2',
      type: 'Cab',
      title: 'Innova Crysta - AC',
      price: 1800,
      location: 'Delhi',
      availability: 'Weekends Only',
      status: 'Sold Out',
    },
  ]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<InventoryItem>>({
    type: 'Hotel Room',
    title: '',
    price: 0,
    location: '',
    availability: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'price' ? Number(value) : value,
    }));
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.price || !formData.location) return;

    const newItem: InventoryItem = {
      id: `inv-${Date.now()}`,
      type: formData.type as InventoryType,
      title: formData.title,
      price: formData.price,
      location: formData.location,
      availability: formData.availability || 'Contact for dates',
      status: 'Active',
    };

    setInventoryList([newItem, ...inventoryList]);
    setIsFormOpen(false);
    setFormData({ type: 'Hotel Room', title: '', price: 0, location: '', availability: '' });
  };

  const toggleStatus = (id: string) => {
    setInventoryList((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: item.status === 'Active' ? 'Sold Out' : 'Active' }
          : item
      )
    );
  };

  const deleteItem = (id: string) => {
    setInventoryList((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300 overflow-y-auto pb-32 max-h-[80vh] [&::-webkit-scrollbar]:hidden">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Building className="w-5 h-5 text-sky-600" />
            Hotel & Cab Inventory ({inventoryList.length})
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Manage your individual rooms and transport vehicles.</p>
        </div>

        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="px-4 py-2.5 bg-gradient-to-r from-sky-500 to-pink-500 text-white rounded-2xl text-xs font-bold hover:opacity-95 transition-opacity cursor-pointer flex items-center gap-2 shadow-md shadow-pink-500/20"
        >
          {isFormOpen ? <XCircle className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{isFormOpen ? 'Cancel' : 'Add New Inventory'}</span>
        </button>
      </div>

      {/* Add New Inventory Form */}
      {isFormOpen && (
        <form onSubmit={handleAddSubmit} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h4 className="text-sm font-extrabold text-slate-900 mb-4 border-b border-slate-100 pb-2">Add New Inventory Item</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
              >
                <option value="Hotel Room">Hotel Room</option>
                <option value="Cab">Cab</option>
              </select>
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Title/Name</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Deluxe AC Room"
                required
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Base Price (Per Night/Day in INR)</label>
              <input
                type="number"
                name="price"
                value={formData.price || ''}
                onChange={handleInputChange}
                placeholder="0"
                required
                min="0"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Location/City</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="e.g., Goa"
                required
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Availability Dates</label>
              <input
                type="text"
                name="availability"
                value={formData.availability}
                onChange={handleInputChange}
                placeholder="e.g., Year-round or specific dates"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Photos</label>
              <div className="w-full p-3 bg-slate-50 border border-slate-200 border-dashed rounded-xl text-sm font-bold text-slate-500 flex items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors">
                <Plus className="w-4 h-4 mr-2" /> Upload Photos
              </div>
            </div>
          </div>
          
          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-sky-500 to-pink-500 text-white rounded-xl text-xs font-bold hover:opacity-95 transition-opacity cursor-pointer shadow-md shadow-pink-500/20"
            >
              Save Inventory
            </button>
          </div>
        </form>
      )}

      {/* Current Inventory List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {inventoryList.length === 0 ? (
          <div className="col-span-full bg-white border border-slate-200 rounded-3xl p-10 text-center text-slate-400">
            <Building className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-bold text-slate-600">No inventory added yet</p>
          </div>
        ) : (
          inventoryList.map((item) => (
            <div key={item.id} className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    {item.type === 'Hotel Room' ? (
                      <Building className="w-4 h-4 text-sky-500" />
                    ) : (
                      <Car className="w-4 h-4 text-sky-500" />
                    )}
                    <h4 className="text-sm font-extrabold text-slate-900">{item.title}</h4>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase shrink-0 ${
                    item.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {item.status}
                  </span>
                </div>

                <p className="text-xs text-slate-500 font-semibold mb-1">{item.location} • {item.type}</p>
                <p className="text-xs text-slate-400">{item.availability}</p>

                <div className="mt-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600">Base Price</span>
                  <span className="text-base font-black text-slate-900">₹{item.price.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                {/* Toggle Status */}
                <button
                  onClick={() => toggleStatus(item.id)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1 ${
                    item.status === 'Active' ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  }`}
                >
                  {item.status === 'Active' ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                  {item.status === 'Active' ? 'Mark Sold Out' : 'Mark Active'}
                </button>
                
                {/* Edit Button */}
                <button className="p-2 bg-slate-100 text-slate-600 hover:text-sky-600 hover:bg-sky-50 rounded-xl transition-colors cursor-pointer" title="Edit">
                  <Edit2 className="w-4 h-4" />
                </button>
                
                {/* Delete Button */}
                <button 
                  onClick={() => deleteItem(item.id)}
                  className="p-2 bg-slate-100 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer" title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
