// src/components/BuyerNeedForm.tsx
import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { ChevronDown, AlertCircle } from 'lucide-react';
import { SearchableSelect } from './SearchableSelect';

export interface BuyerNeedFormValues {
  cropName: string;
  quantity: string;
  unit: string;
  maxPrice: string;
  location: string;
  urgency: string;
  description: string;
}

interface BuyerNeedFormProps {
  onSubmit: (data: BuyerNeedFormValues) => void;
  onCancel?: () => void;
  initialData?: Partial<BuyerNeedFormValues>;
  isLoading?: boolean;
}

const VEGETABLE_OPTIONS = [
  'Carrot', 'Potato', 'Tomato', 'Cabbage', 'Leeks', 'Beans',
  'Snake Gourd', 'Bottle Gourd', 'Bitter Gourd', 'Ridge Gourd',
  'Pumpkin', 'Ash Plantain', 'Raw Banana', 'Drumstick',
  'Brinjal (Eggplant)', 'Ladies Fingers (Okra)', 'Capsicum',
  'Green Chilli', 'Red Chilli', 'Onion', 'Red Onion', 'Garlic',
  'Ginger', 'Beetroot', 'Radish', 'Turnip', 'Knol Khol', 'Cucumber',
  'Winged Beans (Dambala)', 'Long Beans', 'Mukunuwenna', 'Gotukola',
  'Kankun', 'Thampala', 'Nivithi', 'Kathurumurunga Leaves',
  'Murunga Leaves', 'Sweet Potato', 'Manioc (Cassava)',
  'Taro (Colocasia)', 'Lotus Root', 'Breadfruit',
  'Jackfruit (Polos)', 'Tender Jackfruit (Kos)',
];

const LOCATION_OPTIONS = [
  'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo',
  'Galle', 'Gampaha', 'Hambantota', 'Jaffna', 'Kalutara', 'Kandy',
  'Kegalle', 'Kilinochchi', 'Kurunegala', 'Mannar', 'Matale',
  'Matara', 'Monaragala', 'Mullaitivu', 'Nuwara Eliya', 'Polonnaruwa',
  'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya',
];

type FormErrors = Partial<Record<keyof BuyerNeedFormValues, string>>;

// ── Validation rules ──────────────────────────────────────────────
function validateForm(data: BuyerNeedFormValues): FormErrors {
  const errors: FormErrors = {};

  if (!data.cropName.trim()) {
    errors.cropName = 'Please select a vegetable.';
  }

  if (!data.quantity.trim()) {
    errors.quantity = 'Quantity is required.';
  } else if (isNaN(Number(data.quantity)) || Number(data.quantity) <= 0) {
    errors.quantity = 'Quantity must be a positive number.';
  } else if (Number(data.quantity) > 100000) {
    errors.quantity = 'Quantity seems too large. Max 100,000.';
  }

  if (!data.maxPrice.trim()) {
    errors.maxPrice = 'Maximum price is required.';
  } else if (isNaN(Number(data.maxPrice)) || Number(data.maxPrice) <= 0) {
    errors.maxPrice = 'Price must be a positive number.';
  } else if (Number(data.maxPrice) > 1000000) {
    errors.maxPrice = 'Price seems too large. Max LKR 1,000,000.';
  }

  if (!data.location.trim()) {
    errors.location = 'Please select your location.';
  }

  if (data.description && data.description.length > 500) {
    errors.description = `Description is too long (${data.description.length}/500 characters).`;
  }

  return errors;
}

// ── Inline error message ──────────────────────────────────────────
function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600">
      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
      {message}
    </p>
  );
}

// ── Styled select wrapper ─────────────────────────────────────────
function StyledSelect({
  name,
  value,
  onChange,
  children,
}: {
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-lg border border-stone-300 bg-white pl-3 pr-10 py-2 text-sm focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none appearance-none"
      >
        {children}
      </select>
      <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-stone-400">
        <ChevronDown className="h-4 w-4" />
      </span>
    </div>
  );
}

// ── Main form ─────────────────────────────────────────────────────
export function BuyerNeedForm({
  onSubmit,
  onCancel,
  initialData,
  isLoading,
}: BuyerNeedFormProps) {
  const [form, setForm] = useState<BuyerNeedFormValues>({
    cropName:    initialData?.cropName    ?? '',
    quantity:    initialData?.quantity    ?? '',
    unit:        initialData?.unit        ?? 'kg',
    maxPrice:    initialData?.maxPrice    ?? '',
    location:    initialData?.location    ?? '',
    urgency:     initialData?.urgency     ?? 'low',
    description: initialData?.description ?? '',
  });

  const [errors, setErrors]       = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  // ── Handlers ────────────────────────────────────────────────────
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const next = { ...form, [name]: value };
    setForm(next);
    if (submitted) setErrors(validateForm(next));
  };

  const handleSearchableChange = (name: string, value: string) => {
    const next = { ...form, [name]: value };
    setForm(next);
    if (submitted) setErrors(validateForm(next));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
    const validationErrors = validateForm(form);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      const firstErrorField = Object.keys(validationErrors)[0];
      const el = document.querySelector(`[name="${firstErrorField}"]`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    onSubmit(form);
  };

  const hasError = (field: keyof BuyerNeedFormValues) => submitted && !!errors[field];

  const inputClass = (field: keyof BuyerNeedFormValues) =>
    `w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 transition-all ${
      hasError(field)
        ? 'border-red-400 bg-red-50 focus:ring-red-200 focus:border-red-400'
        : 'border-stone-300 focus:ring-green-200 focus:border-green-500'
    }`;

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>

      {/* Crop Type */}
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">
          What vegetable do you need? <span className="text-red-500">*</span>
        </label>
        <SearchableSelect
          name="cropName"
          value={form.cropName}
          options={VEGETABLE_OPTIONS}
          placeholder="Select a vegetable"
          onChange={handleSearchableChange}
          hasError={hasError('cropName')}
        />
        <FieldError message={errors.cropName} />
      </div>

      {/* Quantity + Unit */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            Quantity <span className="text-red-500">*</span>
          </label>
          <input
            name="quantity"
            type="number"
            min={0}
            value={form.quantity}
            onChange={handleChange}
            placeholder="e.g. 100"
            className={inputClass('quantity')}
          />
          <FieldError message={errors.quantity} />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            Unit
          </label>
          <StyledSelect name="unit" value={form.unit} onChange={handleChange}>
            <option value="kg">Kilograms (kg)</option>
            <option value="g">Grams (g)</option>
            <option value="items">Items</option>
          </StyledSelect>
        </div>
      </div>

      {/* Max Price */}
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">
          Maximum Price per Unit (LKR) <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-stone-400 font-medium pointer-events-none">
            LKR
          </span>
          <input
            name="maxPrice"
            type="number"
            min={0}
            value={form.maxPrice}
            onChange={handleChange}
            placeholder="e.g. 250"
            className={`${inputClass('maxPrice')} pl-12`}
          />
        </div>
        <p className="mt-1 text-xs text-stone-500">The highest price you're willing to pay</p>
        <FieldError message={errors.maxPrice} />
      </div>

      {/* Location */}
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">
          Buyer Location <span className="text-red-500">*</span>
        </label>
        <SearchableSelect
          name="location"
          value={form.location}
          options={LOCATION_OPTIONS}
          placeholder="Select location"
          onChange={handleSearchableChange}
          hasError={hasError('location')}
        />
        <FieldError message={errors.location} />
      </div>

      {/* Urgency */}
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">
          Urgency
        </label>
        <StyledSelect name="urgency" value={form.urgency} onChange={handleChange}>
          <option value="low">Low Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="high">Urgent</option>
        </StyledSelect>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">
          Description
          <span className="ml-2 text-xs font-normal text-stone-400">
            ({form.description.length}/500)
          </span>
        </label>
        <textarea
          name="description"
          rows={3}
          value={form.description}
          onChange={handleChange}
          className={`${inputClass('description')} resize-none`}
          placeholder="Describe your requirements, quality expectations..."
        />
        <FieldError message={errors.description} />
      </div>

      {/* Required fields note */}
      <p className="text-xs text-stone-400">
        Fields marked <span className="text-red-500 font-medium">*</span> are required.
      </p>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center px-4 py-2 rounded-lg border border-stone-300 text-sm font-medium text-stone-700 hover:bg-stone-50 active:bg-stone-100 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium shadow-sm hover:bg-green-700 active:bg-green-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading
            ? 'Posting…'
            : initialData?.cropName
              ? 'Update Request'
              : 'Post Request'}
        </button>
      </div>
    </form>
  );
}