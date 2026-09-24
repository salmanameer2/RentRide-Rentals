import React, { useState, useEffect } from 'react';
import {
  Car,
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle2,
  AlertTriangle,
  Fuel,
  Users,
  Gauge,
  Zap,
  Eye,
  EyeOff,
} from 'lucide-react';
import * as carService from '../../services/carService';
import AdminBadge from '../../components/admin/AdminBadge';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Loader from '../../components/Loader';
import ErrorMessage from '../../components/ErrorMessage';

export default function AdminCars() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [activeCar, setActiveCar] = useState(null);

  // Image Upload State
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Form State
  const initialForm = {
    name: '',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    category: 'Sedan',
    pricePerDay: 150,
    seats: 5,
    doors: 4,
    horsepower: '',
    transmission: 'Automatic',
    fuel: 'Petrol',
    image: '',
    description: '',
    available: true,
    features: [],
    location: 'Lahore Hub',
  };

  const [formData, setFormData] = useState(initialForm);

  const categories = ['All', 'Sedan', 'SUV', 'Hatchback', 'Luxury', 'Van', 'Sports', 'Electric'];
  const transmissions = ['Automatic', 'Manual', 'Dual-Clutch'];
  const fuelTypes = ['Petrol', 'Diesel', 'Hybrid', 'Electric'];

  useEffect(() => {
    loadCars();
  }, []);

  async function loadCars() {
    try {
      setLoading(true);
      const data = await carService.getAllCars();
      setCars(data);
      setError(null);
    } catch (err) {
      setError('Could not load fleet data. Please refresh.');
    } finally {
      setLoading(false);
    }
  }

  const filteredCars = cars.filter((c) => {
    const matchesCategory =
      categoryFilter === 'All' || c.category === categoryFilter;
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.brand.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleOpenAdd = () => {
    setFormData(initialForm);
    setImageFile(null);
    setImagePreview(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (car) => {
    setActiveCar(car);
    setFormData({
      name: car.name,
      brand: car.brand,
      model: car.model || car.name,
      year: car.year || new Date().getFullYear(),
      category: car.category,
      pricePerDay: car.pricePerDay,
      seats: car.seats,
      doors: car.doors || 4,
      horsepower: car.horsepower || '',
      transmission: car.transmission,
      fuel: car.fuel,
      image: car.image,
      description: car.description || '',
      available: car.available,
      features: car.features || [],
      location: car.location || 'Lahore Hub',
    });
    setImageFile(null);
    setImagePreview(car.image);
    setIsEditModalOpen(true);
  };

  const handleOpenDelete = (car) => {
    setActiveCar(car);
    setIsDeleteModalOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size exceeds 5MB limit.');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      
      let imageUrl = formData.image;
      if (imageFile) {
        imageUrl = await carService.uploadCarImage(imageFile);
      }

      await carService.createCar({ ...formData, image: imageUrl });
      await loadCars();
      setIsAddModalOpen(false);
    } catch (err) {
      alert('Error creating car: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (activeCar) {
      try {
        setActionLoading(true);
        
        let imageUrl = formData.image;
        let oldImageUrl = activeCar.image;

        if (imageFile) {
          imageUrl = await carService.uploadCarImage(imageFile);
        }

        await carService.updateCar(activeCar.id, { ...formData, image: imageUrl });
        
        // Cleanup old image if it was replaced and is a storage URL
        if (imageFile && oldImageUrl && oldImageUrl.includes('car-images')) {
          await carService.deleteCarImage(oldImageUrl);
        }

        await loadCars();
        setIsEditModalOpen(false);
      } catch (err) {
        alert('Error updating car: ' + err.message);
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleDeleteConfirm = async () => {
    if (activeCar) {
      try {
        setActionLoading(true);
        await carService.deleteCar(activeCar.id);
        
        // Cleanup image if it's a storage URL
        if (activeCar.image && activeCar.image.includes('car-images')) {
          await carService.deleteCarImage(activeCar.image);
        }

        await loadCars();
        setIsDeleteModalOpen(false);
      } catch (err) {
        if (err.code === '23503') {
          alert('Cannot delete this vehicle because it has existing bookings. Please unlist it instead to hide it from customers.');
        } else {
          alert('Error deleting car: ' + err.message);
        }
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleToggleStatus = async (car) => {
    try {
      setActionLoading(true);
      await carService.updateCar(car.id, { ...car, available: !car.available });
      await loadCars();
    } catch (err) {
      alert('Error toggling status: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20">
        <Loader message="Synchronizing fleet inventory with database..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-10">
        <ErrorMessage message={error} actionLabel="Retry" onAction={loadCars} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Fleet Asset Inventory
          </h2>
          <p className="text-xs text-slate-400">
            Register, modify specs, manage maintenance status, and audit vehicle availability.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          iconPosition="left"
          onClick={handleOpenAdd}
          className="font-bold text-xs shadow-lg bg-[#bef264] text-black hover:bg-[#aee64b]"
        >
          Add New Vehicle
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#11171d] border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search vehicle model or brand..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#161f26] border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#bef264]"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                categoryFilter === cat
                  ? 'bg-[#bef264] text-black font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-[#161f26]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Fleet Table */}
      <div className="bg-[#11171d] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#161f26] text-slate-400 uppercase tracking-wider text-[10px] font-bold border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Asset ID</th>
                <th className="py-3.5 px-4">Vehicle Details</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Specifications</th>
                <th className="py-3.5 px-4">Daily Rate</th>
                <th className="py-3.5 px-4">Fleet Status</th>
                <th className="py-3.5 px-4 text-right">Management</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredCars.map((car) => {
                const currentStatus = car.status || 'Available';
                return (
                  <tr key={car.id} className={`hover:bg-[#151c22] transition-colors ${!car.available ? 'opacity-60' : ''}`}>
                    <td className="py-4 px-4 font-mono font-bold text-white text-[10px]">
                      {car.id.slice(0, 8)}...
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={car.image}
                          alt={car.name}
                          className="w-14 h-9 object-cover rounded-lg bg-slate-800 border border-slate-700/60"
                        />
                        <div>
                          <div className="font-bold text-white text-sm">{car.name}</div>
                          <div className="text-[11px] text-slate-400">{car.brand} {car.model}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#1a232b] text-[#bef264] border border-[#bef264]/20">
                        {car.category}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                        <span>{car.seats} seats</span>
                        <span>•</span>
                        <span>{car.transmission}</span>
                        <span>•</span>
                        <span>{car.fuel}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="text-sm font-bold text-white">
                        ${car.pricePerDay}
                        <span className="text-[10px] text-slate-500 font-normal"> /day</span>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-bold border ${
                          car.available 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                            : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                        }`}>
                          {car.available ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                          {car.available ? 'Listed' : 'Unlisted'}
                        </div>
                        <button
                          type="button"
                          disabled={actionLoading}
                          onClick={() => handleToggleStatus(car)}
                          className="text-[10px] text-slate-500 hover:text-[#bef264] underline cursor-pointer disabled:opacity-50"
                        >
                          Toggle
                        </button>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(car)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-[#1a232b] hover:bg-[#222e38] border border-slate-700/80 transition-colors cursor-pointer"
                          title="Edit Vehicle Details"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenDelete(car)}
                          className="p-1.5 rounded-lg text-red-400 hover:text-red-300 bg-red-950/20 hover:bg-red-950/40 border border-red-500/20 transition-colors cursor-pointer"
                          title="Remove Vehicle from Fleet"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Car Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register New Fleet Vehicle"
        size="lg"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                Model Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 911 GT3 RS"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value, model: e.target.value })}
                className="w-full bg-[#161f26] border border-slate-700/80 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#bef264]"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                Manufacturer / Brand *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Porsche"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full bg-[#161f26] border border-slate-700/80 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#bef264]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-[#161f26] border border-slate-700/80 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#bef264]"
              >
                {categories.filter(c => c !== 'All').map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                Daily Rate ($ USD) *
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.pricePerDay}
                onChange={(e) =>
                  setFormData({ ...formData, pricePerDay: parseFloat(e.target.value) || 0 })
                }
                className="w-full bg-[#161f26] border border-slate-700/80 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#bef264]"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                Model Year *
              </label>
              <input
                type="number"
                required
                min="1990"
                max={new Date().getFullYear() + 1}
                value={formData.year}
                onChange={(e) =>
                  setFormData({ ...formData, year: parseInt(e.target.value) || new Date().getFullYear() })
                }
                className="w-full bg-[#161f26] border border-slate-700/80 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#bef264]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                Transmission
              </label>
              <select
                value={formData.transmission}
                onChange={(e) => setFormData({ ...formData, transmission: e.target.value })}
                className="w-full bg-[#161f26] border border-slate-700/80 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#bef264]"
              >
                {transmissions.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                Fuel Type
              </label>
              <select
                value={formData.fuel}
                onChange={(e) => setFormData({ ...formData, fuel: e.target.value })}
                className="w-full bg-[#161f26] border border-slate-700/80 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#bef264]"
              >
                {fuelTypes.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                Passenger Seats
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={formData.seats}
                onChange={(e) =>
                  setFormData({ ...formData, seats: parseInt(e.target.value, 10) || 5 })
                }
                className="w-full bg-[#161f26] border border-slate-700/80 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#bef264]"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                Horsepower
              </label>
              <input
                type="text"
                placeholder="e.g. 520 hp"
                value={formData.horsepower}
                onChange={(e) => setFormData({ ...formData, horsepower: e.target.value })}
                className="w-full bg-[#161f26] border border-slate-700/80 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#bef264]"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider text-[10px]">
              Vehicle Image *
            </label>
            <div className="mt-1 flex items-center gap-4">
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-24 h-16 object-cover rounded-xl border border-slate-700"
                />
              )}
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-[#bef264] file:text-black hover:file:bg-[#aee64b] cursor-pointer"
                />
                <p className="mt-1 text-[10px] text-slate-500">PNG, JPG, WebP up to 5MB.</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider text-[10px]">
              Short Description / Spec Highlights
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-[#161f26] border border-slate-700/80 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#bef264] resize-none"
              placeholder="High performance sports coupe with sports exhaust..."
            />
          </div>


          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              className="font-bold bg-[#bef264] text-black hover:bg-[#aee64b]"
            >
              Add to Fleet
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Car Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Vehicle Specifications — #${activeCar?.id}`}
        size="lg"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                Model Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value, model: e.target.value })}
                className="w-full bg-[#161f26] border border-slate-700/80 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#bef264]"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                Manufacturer / Brand
              </label>
              <input
                type="text"
                required
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full bg-[#161f26] border border-slate-700/80 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#bef264]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-[#161f26] border border-slate-700/80 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#bef264]"
              >
                {categories.filter(c => c !== 'All').map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                Daily Rate ($ USD)
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.pricePerDay}
                onChange={(e) =>
                  setFormData({ ...formData, pricePerDay: parseFloat(e.target.value) || 0 })
                }
                className="w-full bg-[#161f26] border border-slate-700/80 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#bef264]"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                Listing Visibility
              </label>
              <select
                value={formData.available ? 'Listed' : 'Unlisted'}
                onChange={(e) => setFormData({ ...formData, available: e.target.value === 'Listed' })}
                className="w-full bg-[#161f26] border border-slate-700/80 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#bef264]"
              >
                <option value="Listed">Listed / Active</option>
                <option value="Unlisted">Unlisted / Hidden</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                Transmission
              </label>
              <select
                value={formData.transmission}
                onChange={(e) => setFormData({ ...formData, transmission: e.target.value })}
                className="w-full bg-[#161f26] border border-slate-700/80 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#bef264]"
              >
                {transmissions.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                Fuel Type
              </label>
              <select
                value={formData.fuel}
                onChange={(e) => setFormData({ ...formData, fuel: e.target.value })}
                className="w-full bg-[#161f26] border border-slate-700/80 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#bef264]"
              >
                {fuelTypes.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                Passenger Seats
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={formData.seats}
                onChange={(e) =>
                  setFormData({ ...formData, seats: parseInt(e.target.value, 10) || 5 })
                }
                className="w-full bg-[#161f26] border border-slate-700/80 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#bef264]"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider text-[10px]">
                Horsepower
              </label>
              <input
                type="text"
                placeholder="e.g. 520 hp"
                value={formData.horsepower}
                onChange={(e) => setFormData({ ...formData, horsepower: e.target.value })}
                className="w-full bg-[#161f26] border border-slate-700/80 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#bef264]"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider text-[10px]">
              Vehicle Image
            </label>
            <div className="mt-1 flex items-center gap-4">
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-24 h-16 object-cover rounded-xl border border-slate-700"
                />
              )}
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-[#bef264] file:text-black hover:file:bg-[#aee64b] cursor-pointer"
                />
                <p className="mt-1 text-[10px] text-slate-500">Upload a new image to replace the current one.</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1 uppercase tracking-wider text-[10px]">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full bg-[#161f26] border border-slate-700/80 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#bef264]"
            />
          </div>


          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              className="font-bold bg-[#bef264] text-black hover:bg-[#aee64b]"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Vehicle Deletion"
        size="sm"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-red-950/30 border border-red-500/30 text-red-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
            <div>
              <span className="font-bold block text-red-300">Irreversible Action</span>
              Are you sure you want to permanently remove <strong className="text-white">{activeCar?.name}</strong> from the operational fleet catalog?
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDeleteConfirm}
              className="font-bold"
            >
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
