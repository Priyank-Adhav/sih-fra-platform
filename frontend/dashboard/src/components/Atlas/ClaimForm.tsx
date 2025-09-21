import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";

export interface ClaimFormData {
  claimant: string;
  claimantId: string;
  type: "IFR" | "CFR" | "Community Forest Rights";
  area: number;
  village: string;
  block: string;
  district: string;
  state: string;
  submissionDate: string;
  status: "pending" | "under_review" | "approved" | "rejected";
  description: string;
  contactNumber: string;
  email: string;
}

interface ClaimFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ClaimFormData) => void;
  initialData?: Partial<ClaimFormData>;
  mode: "create" | "edit";
}

const CLAIM_TYPES = [
  { value: "IFR", label: "Individual Forest Rights" },
  { value: "CFR", label: "Community Forest Rights" },
  { value: "Community Forest Rights", label: "Community Forest Rights (Traditional)" },
];

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending", color: "badge-warning" },
  { value: "under_review", label: "Under Review", color: "badge-info" },
  { value: "approved", label: "Approved", color: "badge-success" },
  { value: "rejected", label: "Rejected", color: "badge-error" },
];

const STATES = [
  "Madhya Pradesh",
  "Tripura", 
  "Odisha",
  "Telangana"
];

const DISTRICTS: { [key: string]: string[] } = {
  "Madhya Pradesh": ["Bhopal", "Indore", "Jabalpur", "Gwalior", "Ujjain"],
  "Tripura": ["Agartala", "Udaipur", "Dharmanagar", "Kailashahar"],
  "Odisha": ["Bhubaneswar", "Cuttack", "Puri", "Balangir", "Sambalpur"],
  "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam"]
};

export default function ClaimForm({ isOpen, onClose, onSubmit, initialData, mode }: ClaimFormProps) {
  const [formData, setFormData] = useState<ClaimFormData>({
    claimant: "",
    claimantId: "",
    type: "IFR",
    area: 0,
    village: "",
    block: "",
    district: "",
    state: "",
    submissionDate: new Date().toISOString().split('T')[0],
    status: "pending",
    description: "",
    contactNumber: "",
    email: "",
    ...initialData
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      console.log('Modal opened, locking body scroll');
      document.body.style.overflow = 'hidden';
    } else {
      console.log('Modal closed, unlocking body scroll');
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleInputChange = (field: keyof ClaimFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.claimant.trim()) newErrors.claimant = "Claimant name is required";
    if (!formData.claimantId.trim()) newErrors.claimantId = "Claimant ID is required";
    if (!formData.village.trim()) newErrors.village = "Village is required";
    if (!formData.block.trim()) newErrors.block = "Block is required";
    if (!formData.district.trim()) newErrors.district = "District is required";
    if (!formData.state.trim()) newErrors.state = "State is required";
    if (formData.area <= 0) newErrors.area = "Area must be greater than 0";
    if (formData.contactNumber && !/^\d{10}$/.test(formData.contactNumber)) {
      newErrors.contactNumber = "Contact number must be 10 digits";
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
      onClose();
    }
  };

  const handleStateChange = (state: string) => {
    setFormData(prev => ({ 
      ...prev, 
      state, 
      district: "", // Reset district when state changes
      block: "", // Reset block when state changes
      village: "" // Reset village when state changes
    }));
  };

  const availableDistricts = formData.state ? DISTRICTS[formData.state] || [] : [];

  if (!isOpen) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="bg-base-100 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-base-300">
          <h2 className="text-xl font-semibold text-base-content">
            {mode === "create" ? "Create New Claim" : "Edit Claim"}
          </h2>
          <button
            onClick={onClose}
            className="btn btn-sm btn-circle btn-ghost"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Claimant Information */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-medium text-base-content mb-3">Claimant Information</h3>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Claimant Name *</span>
              </label>
              <input
                type="text"
                className={`input input-bordered w-full ${errors.claimant ? 'input-error' : ''}`}
                value={formData.claimant}
                onChange={(e) => handleInputChange('claimant', e.target.value)}
                placeholder="Enter claimant name"
              />
              {errors.claimant && <span className="text-error text-xs mt-1">{errors.claimant}</span>}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Claimant ID *</span>
              </label>
              <input
                type="text"
                className={`input input-bordered w-full ${errors.claimantId ? 'input-error' : ''}`}
                value={formData.claimantId}
                onChange={(e) => handleInputChange('claimantId', e.target.value)}
                placeholder="Enter claimant ID"
              />
              {errors.claimantId && <span className="text-error text-xs mt-1">{errors.claimantId}</span>}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Contact Number</span>
              </label>
              <input
                type="tel"
                className={`input input-bordered w-full ${errors.contactNumber ? 'input-error' : ''}`}
                value={formData.contactNumber}
                onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                placeholder="10-digit mobile number"
              />
              {errors.contactNumber && <span className="text-error text-xs mt-1">{errors.contactNumber}</span>}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Email</span>
              </label>
              <input
                type="email"
                className={`input input-bordered w-full ${errors.email ? 'input-error' : ''}`}
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="email@example.com"
              />
              {errors.email && <span className="text-error text-xs mt-1">{errors.email}</span>}
            </div>

            {/* Claim Details */}
            <div className="md:col-span-2 mt-4">
              <h3 className="text-lg font-medium text-base-content mb-3">Claim Details</h3>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Claim Type *</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value as ClaimFormData['type'])}
              >
                {CLAIM_TYPES.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Area (hectares) *</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                className={`input input-bordered w-full ${errors.area ? 'input-error' : ''}`}
                value={formData.area}
                onChange={(e) => handleInputChange('area', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
              {errors.area && <span className="text-error text-xs mt-1">{errors.area}</span>}
            </div>

            {/* Location Information */}
            <div className="md:col-span-2 mt-4">
              <h3 className="text-lg font-medium text-base-content mb-3">Location Information</h3>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">State *</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={formData.state}
                onChange={(e) => handleStateChange(e.target.value)}
              >
                <option value="">Select State</option>
                {STATES.map(state => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">District *</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={formData.district}
                onChange={(e) => handleInputChange('district', e.target.value)}
                disabled={!formData.state}
              >
                <option value="">Select District</option>
                {availableDistricts.map(district => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Block *</span>
              </label>
              <input
                type="text"
                className={`input input-bordered w-full ${errors.block ? 'input-error' : ''}`}
                value={formData.block}
                onChange={(e) => handleInputChange('block', e.target.value)}
                placeholder="Enter block name"
              />
              {errors.block && <span className="text-error text-xs mt-1">{errors.block}</span>}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Village *</span>
              </label>
              <input
                type="text"
                className={`input input-bordered w-full ${errors.village ? 'input-error' : ''}`}
                value={formData.village}
                onChange={(e) => handleInputChange('village', e.target.value)}
                placeholder="Enter village name"
              />
              {errors.village && <span className="text-error text-xs mt-1">{errors.village}</span>}
            </div>

            {/* Status and Dates */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Status</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value as ClaimFormData['status'])}
              >
                {STATUS_OPTIONS.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Submission Date</span>
              </label>
              <input
                type="date"
                className="input input-bordered w-full"
                value={formData.submissionDate}
                onChange={(e) => handleInputChange('submissionDate', e.target.value)}
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2 form-control">
              <label className="label">
                <span className="label-text font-medium">Description</span>
              </label>
              <textarea
                className="textarea textarea-bordered w-full h-24"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Additional details about the claim..."
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-base-300">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              {mode === "create" ? "Create Claim" : "Update Claim"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
