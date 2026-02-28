// src/components/ListingForm.tsx
import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Upload, ChevronDown, AlertCircle } from 'lucide-react';
import { SearchableSelect } from './SearchableSelect';

export interface ListingFormValues {
  name: string;
  location: string;
  quantity: string;
  unit: string;
  price: string;
  quality: string;
  description: string;
  image: string;
}

interface ListingFormProps {
  onSubmit: (data: ListingFormValues) => void;
  initialData?: Partial<ListingFormValues>;
  isLoading?: boolean;
  onCancel?: () => void;
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

type FormErrors = Partial<Record<keyof ListingFormValues, string>>;

// ── Validation rules ──────────────────────────────────────────────
function validateForm(data: ListingFormValues): FormErrors {
  const errors: FormErrors = {};

  if (!data.name.trim()) {
    errors.name = 'Crop type is required.';
  }

  if (!data.location.trim()) {
    errors.location = 'Location is required.';
  }

  if (!data.quantity.trim()) {
    errors.quantity = 'Quantity is required.';
  } else if (isNaN(Number(data.quantity)) || Number(data.quantity) <= 0) {
    errors.quantity = 'Quantity must be a positive number.';
  } else if (Number(data.quantity) > 100000) {
    errors.quantity = 'Quantity seems too large. Max 100,000.';
  }

  if (!data.price.trim()) {
    errors.price = 'Price is required.';
  } else if (isNaN(Number(data.price)) || Number(data.price) <= 0) {
    errors.price = 'Price must be a positive number.';
  } else if (Number(data.price) > 1000000) {
    errors.price = 'Price seems too large. Max LKR 1,000,000.';
  }

  if (data.description && data.description.length > 500) {
    errors.description = `Description is too long (${data.description.length}/500 characters).`;
  }

  return errors;
}

// ── Inline error message component ───────────────────────────────
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
export function ListingForm({
  onSubmit,
  initialData,
  isLoading,
  onCancel,
}: ListingFormProps) {
  const [formData, setFormData] = useState<ListingFormValues>({
    name:        initialData?.name        ?? '',
    location:    initialData?.location    ?? '',
    quantity:    initialData?.quantity    ?? '',
    unit:        initialData?.unit        ?? 'kg',
    price:       initialData?.price       ?? '',
    quality:     initialData?.quality     ?? 'A',
    description: initialData?.description ?? '',
    image:       initialData?.image       ?? '',
  });

  const [previewImage, setPreviewImage] = useState<string | null>(
    initialData?.image ?? null
  );

  // Only show errors after the first submit attempt
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  // ── Handlers ────────────────────────────────────────────────────
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const next = { ...formData, [name]: value };
    setFormData(next);
    // Live-clear the error for this field once the user starts fixing it
    if (submitted) {
      setErrors(validateForm(next));
    }
  };

  const handleSearchableChange = (name: string, value: string) => {
    const next = { ...formData, [name]: value };
    setFormData(next);
    if (submitted) {
      setErrors(validateForm(next));
    }
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setPreviewImage(result);
      setFormData((prev) => ({ ...prev, image: result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
    const validationErrors = validateForm(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      // Scroll to first error smoothly
      const firstErrorField = Object.keys(validationErrors)[0];
      const el = document.querySelector(`[name="${firstErrorField}"]`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    onSubmit(formData);
  };

  const hasError = (field: keyof ListingFormValues) => submitted && !!errors[field];

  const inputClass = (field: keyof ListingFormValues) =>
    `w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 transition-all ${
      hasError(field)
        ? 'border-red-400 bg-red-50 focus:ring-red-200 focus:border-red-400'
        : 'border-stone-300 focus:ring-green-200 focus:border-green-500'
    }`;

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>

      {/* Row 1: Crop Type + Location */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Crop Type */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            Crop Type <span className="text-red-500">*</span>
          </label>
          <SearchableSelect
            name="name"
            value={formData.name}
            options={VEGETABLE_OPTIONS}
            placeholder="Select a vegetable"
            onChange={handleSearchableChange}
            hasError={hasError('name')}
          />
          <FieldError message={errors.name} />
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            Location <span className="text-red-500">*</span>
          </label>
          <SearchableSelect
            name="location"
            value={formData.location}
            options={LOCATION_OPTIONS}
            placeholder="Select location"
            onChange={handleSearchableChange}
            hasError={hasError('location')}
          />
          <FieldError message={errors.location} />
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            Quantity <span className="text-red-500">*</span>
          </label>
          <input
            name="quantity"
            type="number"
            min={0}
            placeholder="e.g. 100"
            value={formData.quantity}
            onChange={handleChange}
            className={inputClass('quantity')}
          />
          <FieldError message={errors.quantity} />
        </div>

        {/* Unit */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            Unit
          </label>
          <StyledSelect name="unit" value={formData.unit} onChange={handleChange}>
            <option value="kg">Kilograms (kg)</option>
            <option value="g">Grams (g)</option>
            <option value="items">Items</option>
          </StyledSelect>
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            Price per Unit (LKR) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-stone-400 font-medium pointer-events-none">
              LKR
            </span>
            <input
              name="price"
              type="number"
              min={0}
              placeholder="e.g. 250"
              value={formData.price}
              onChange={handleChange}
              className={`${inputClass('price')} pl-12`}
            />
          </div>
          <FieldError message={errors.price} />
        </div>

        {/* Quality Grade */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            Quality Grade
          </label>
          <StyledSelect name="quality" value={formData.quality} onChange={handleChange}>
            <option value="A">Grade A (Premium)</option>
            <option value="B">Grade B (Standard)</option>
            <option value="C">Grade C (Economy)</option>
          </StyledSelect>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">
          Description
          <span className="ml-2 text-xs font-normal text-stone-400">
            ({formData.description.length}/500)
          </span>
        </label>
        <textarea
          name="description"
          rows={3}
          value={formData.description}
          onChange={handleChange}
          className={`${inputClass('description')} resize-none`}
          placeholder="Describe your produce..."
        />
        <FieldError message={errors.description} />
      </div>

      {/* Photo Upload */}
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-2">
          Photo
        </label>
        <div className="flex items-center justify-center w-full">
          <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-stone-300 border-dashed rounded-lg cursor-pointer bg-stone-50 hover:bg-stone-100 transition-colors overflow-hidden">
            {previewImage ? (
              <img src={previewImage} alt="Preview" className="h-full object-contain" />
            ) : (
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-4 text-stone-500" />
                <p className="mb-2 text-sm text-stone-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-stone-500">SVG, PNG, JPG or GIF (MAX. 800×400px)</p>
              </div>
            )}
            <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
          </label>
        </div>
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
            ? 'Saving…'
            : initialData?.name
              ? 'Update Listing'
              : 'Create Listing'}
        </button>
      </div>
    </form>
  );
}