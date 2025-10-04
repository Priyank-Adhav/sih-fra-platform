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
  { value: "IFR", label: "Individual Forest Rights", icon: "👤", description: "Individual land claims" },
  { value: "CFR", label: "Community Forest Rights", icon: "👥", description: "Community-based forest rights" },
  { value: "Community Forest Rights", label: "Community Forest Rights (Traditional)", icon: "🌳", description: "Traditional community rights" },
];

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending", color: "bg-amber-500", icon: "⏳" },
  { value: "under_review", label: "Under Review", color: "bg-blue-500", icon: "🔍" },
  { value: "approved", label: "Approved", color: "bg-emerald-500", icon: "✅" },
  { value: "rejected", label: "Rejected", color: "bg-red-500", icon: "❌" },
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
  const [activeStep, setActiveStep] = useState<"basic" | "location" | "details">("basic");

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleInputChange = (field: keyof ClaimFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
      district: "",
      block: "",
      village: ""
    }));
  };

  const availableDistricts = formData.state ? DISTRICTS[formData.state] || [] : [];

  if (!isOpen) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-[1001] animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden relative animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-forest-600 to-forest-700 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {mode === "create" ? "Create New FRA Claim" : "Edit FRA Claim"}
                </h2>
                <p className="text-forest-100">Ministry of Tribal Affairs</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors backdrop-blur-sm"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex justify-center mt-6">
            <div className="flex items-center gap-4">
              {(["basic", "location", "details"] as const).map((step, index) => (
                <React.Fragment key={step}>
                  <button
                    onClick={() => setActiveStep(step)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 ${
                      activeStep === step
                        ? 'bg-white text-forest-700 shadow-lg'
                        : 'text-forest-200 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                      activeStep === step
                        ? 'bg-forest-600 text-white'
                        : 'bg-white/20 text-forest-200'
                    }`}>
                      {index + 1}
                    </div>
                    <span className="font-medium capitalize">{step}</span>
                  </button>
                  {index < 2 && (
                    <div className="w-8 h-0.5 bg-white/30"></div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(95vh-220px)]">
          <div className="space-y-6">
            {activeStep === "basic" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Claimant Information */}
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
                      Claimant Information
                    </h3>
                  </div>

                  <div className="form-control">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Claimant Name *
                    </label>
                    <input
                      type="text"
                      className={`w-full rounded-xl border ${errors.claimant ? 'border-red-500' : 'border-gray-300'} bg-white py-3 px-4 focus:border-forest-500 focus:ring-forest-500 shadow-sm`}
                      value={formData.claimant}
                      onChange={(e) => handleInputChange('claimant', e.target.value)}
                      placeholder="Enter claimant name"
                    />
                    {errors.claimant && <span className="text-red-600 text-sm mt-1">{errors.claimant}</span>}
                  </div>

                  <div className="form-control">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Claimant ID *
                    </label>
                    <input
                      type="text"
                      className={`w-full rounded-xl border ${errors.claimantId ? 'border-red-500' : 'border-gray-300'} bg-white py-3 px-4 focus:border-forest-500 focus:ring-forest-500 shadow-sm`}
                      value={formData.claimantId}
                      onChange={(e) => handleInputChange('claimantId', e.target.value)}
                      placeholder="Enter claimant ID"
                    />
                    {errors.claimantId && <span className="text-red-600 text-sm mt-1">{errors.claimantId}</span>}
                  </div>

                  <div className="form-control">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Number
                    </label>
                    <input
                      type="tel"
                      className={`w-full rounded-xl border ${errors.contactNumber ? 'border-red-500' : 'border-gray-300'} bg-white py-3 px-4 focus:border-forest-500 focus:ring-forest-500 shadow-sm`}
                      value={formData.contactNumber}
                      onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                      placeholder="10-digit mobile number"
                    />
                    {errors.contactNumber && <span className="text-red-600 text-sm mt-1">{errors.contactNumber}</span>}
                  </div>

                  <div className="form-control">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      className={`w-full rounded-xl border ${errors.email ? 'border-red-500' : 'border-gray-300'} bg-white py-3 px-4 focus:border-forest-500 focus:ring-forest-500 shadow-sm`}
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="email@example.com"
                    />
                    {errors.email && <span className="text-red-600 text-sm mt-1">{errors.email}</span>}
                  </div>
                </div>

                <div className="flex justify-between pt-4 border-t border-gray-200">
                  <div></div>
                  <button
                    type="button"
                    onClick={() => setActiveStep("location")}
                    className="px-6 py-3 bg-gradient-to-r from-forest-600 to-forest-700 text-white rounded-xl font-medium hover:from-forest-700 hover:to-forest-800 transition-all duration-200 flex items-center gap-2"
                  >
                    Next: Location
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {activeStep === "location" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      Location Information
                    </h3>
                  </div>

                  <div className="form-control">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State *
                    </label>
                    <select
                      className="w-full rounded-xl border border-gray-300 bg-white py-3 px-4 focus:border-forest-500 focus:ring-forest-500 shadow-sm"
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
                    {errors.state && <span className="text-red-600 text-sm mt-1">{errors.state}</span>}
                  </div>

                  <div className="form-control">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      District *
                    </label>
                    <select
                      className="w-full rounded-xl border border-gray-300 bg-white py-3 px-4 focus:border-forest-500 focus:ring-forest-500 shadow-sm disabled:bg-gray-100"
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
                    {errors.district && <span className="text-red-600 text-sm mt-1">{errors.district}</span>}
                  </div>

                  <div className="form-control">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Block *
                    </label>
                    <input
                      type="text"
                      className={`w-full rounded-xl border ${errors.block ? 'border-red-500' : 'border-gray-300'} bg-white py-3 px-4 focus:border-forest-500 focus:ring-forest-500 shadow-sm`}
                      value={formData.block}
                      onChange={(e) => handleInputChange('block', e.target.value)}
                      placeholder="Enter block name"
                    />
                    {errors.block && <span className="text-red-600 text-sm mt-1">{errors.block}</span>}
                  </div>

                  <div className="form-control">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Village *
                    </label>
                    <input
                      type="text"
                      className={`w-full rounded-xl border ${errors.village ? 'border-red-500' : 'border-gray-300'} bg-white py-3 px-4 focus:border-forest-500 focus:ring-forest-500 shadow-sm`}
                      value={formData.village}
                      onChange={(e) => handleInputChange('village', e.target.value)}
                      placeholder="Enter village name"
                    />
                    {errors.village && <span className="text-red-600 text-sm mt-1">{errors.village}</span>}
                  </div>
                </div>

                <div className="flex justify-between pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setActiveStep("basic")}
                    className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveStep("details")}
                    className="px-6 py-3 bg-gradient-to-r from-forest-600 to-forest-700 text-white rounded-xl font-medium hover:from-forest-700 hover:to-forest-800 transition-all duration-200 flex items-center gap-2"
                  >
                    Next: Details
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {activeStep === "details" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                        </svg>
                      </div>
                      Claim Details
                    </h3>
                  </div>

                  <div className="md:col-span-2 form-control">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Claim Type *
                    </label>
                    <div className="space-y-3">
                      {CLAIM_TYPES.map(type => (
                        <label key={type.value} className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                          formData.type === type.value
                            ? 'border-forest-500 bg-forest-50'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}>
                          <input
                            type="radio"
                            name="claimType"
                            value={type.value}
                            checked={formData.type === type.value}
                            onChange={(e) => handleInputChange('type', e.target.value as ClaimFormData['type'])}
                            className="w-5 h-5 text-forest-600 border-gray-300 focus:ring-forest-500"
                          />
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{type.label}</div>
                            <div className="text-sm text-gray-600">{type.description}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="form-control">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Area (hectares) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className={`w-full rounded-xl border ${errors.area ? 'border-red-500' : 'border-gray-300'} bg-white py-3 px-4 focus:border-forest-500 focus:ring-forest-500 shadow-sm`}
                      value={formData.area}
                      onChange={(e) => handleInputChange('area', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                    />
                    {errors.area && <span className="text-red-600 text-sm mt-1">{errors.area}</span>}
                  </div>

                  <div className="form-control">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      className="w-full rounded-xl border border-gray-300 bg-white py-3 px-4 focus:border-forest-500 focus:ring-forest-500 shadow-sm"
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Submission Date
                    </label>
                    <input
                      type="date"
                      className="w-full rounded-xl border border-gray-300 bg-white py-3 px-4 focus:border-forest-500 focus:ring-forest-500 shadow-sm"
                      value={formData.submissionDate}
                      onChange={(e) => handleInputChange('submissionDate', e.target.value)}
                    />
                  </div>

                  <div className="md:col-span-2 form-control">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      className="w-full rounded-xl border border-gray-300 bg-white py-3 px-4 focus:border-forest-500 focus:ring-forest-500 shadow-sm h-32 resize-none"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Additional details about the claim..."
                    />
                  </div>
                </div>

                <div className="flex justify-between pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setActiveStep("location")}
                    className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                  </button>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 bg-gradient-to-r from-forest-600 to-forest-700 text-white rounded-xl font-medium hover:from-forest-700 hover:to-forest-800 transition-all duration-200"
                    >
                      {mode === "create" ? "Create Claim" : "Update Claim"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}