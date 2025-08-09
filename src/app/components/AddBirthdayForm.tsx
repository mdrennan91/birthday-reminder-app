"use client";

import { useState, useEffect, useRef } from "react";
import type { Person, PersonWithBirthday } from "@/types";
import AvatarUploadDialog from "./AvatarUploadDialog";
import dayjs from "dayjs";

interface AddBirthdayFormProps {
  onClose: () => void;
  refreshPeople: () => Promise<void>;
  personToEdit?: Person | null;
  onUpdated?: (updatedPerson: PersonWithBirthday) => void;
}

export default function AddBirthdayForm({
  onClose,
  refreshPeople,
  personToEdit,
  onUpdated,
}: AddBirthdayFormProps) {
  const isEditMode = !!personToEdit;

  const [formData, setFormData] = useState({
    name: "",
    day: "",
    month: "",
    year: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
    avatarUrl: "",
  });

  const [availableCategories, setAvailableCategories] = useState<
    { _id: string; name: string; color: string }[]
  >([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [personIdForUpload, setPersonIdForUpload] = useState<string | null>(null);
  const [showUploadPrompt, setShowUploadPrompt] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

// Fetch categories
  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.ok && res.json())
      .then((data) => data && setAvailableCategories(data));
  }, []);

  // Populate form if editing
  useEffect(() => {
    if (!personToEdit) return;

    const birthday = dayjs(personToEdit.birthday);
    if (!birthday.isValid()) return;

    setFormData({
      name: personToEdit.name ?? "",
      day: birthday.date().toString(),
      month: (birthday.month() + 1).toString(), // 0-based in dayjs
      year: birthday.year().toString(),
      phone: personToEdit.phone ?? "",
      email: personToEdit.email ?? "",
      address: personToEdit.address ?? "",
      notes: personToEdit.notes ?? "",
      avatarUrl: personToEdit.avatarUrl ?? "",
    });

    setSelectedCategoryIds(
      personToEdit.categories?.map((c) => c._id) ?? []
    );
  }, [personToEdit]);


  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const validate = () => {
    const err: typeof errors = {};
    const currentYear = new Date().getFullYear();
    if (!formData.name.trim()) err.name = "Name is required";
    if (!formData.month || +formData.month < 1 || +formData.month > 12) err.month = "Invalid month";
    if (!formData.day || +formData.day < 1 || +formData.day > 31) err.day = "Invalid day";
    if (!formData.year || +formData.year < currentYear - 150 || +formData.year > currentYear)
      err.year = "Invalid year";
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(formData.email)) err.email = "Invalid email format";
    if (formData.phone && !/^\d{10}$/.test(formData.phone)) err.phone = "Invalid phone number format";
    return err;
  };

  const handleSubmit = async (mode: "exit" | "upload") => {
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    const birthday = `${formData.year.trim()}-${formData.month.padStart(
      2, 
      "0"
    )}-${formData.day.padStart(2, "0")}`;

    const payload = {
      ...formData,
      birthday,
      categories: selectedCategoryIds,
    };

    try {

      const res = await fetch(
        personToEdit ? `/api/birthdays/${personToEdit._id}` : "/api/birthdays",
        {
          method: personToEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Failed to save birthday");

      const data = await res.json();
      await refreshPeople();
      onUpdated?.(data);

      if (mode === "upload") {
        setPersonIdForUpload(data._id);
        setShowUploadPrompt(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const inputCls =
    "w-full h-11 rounded-lg border border-gray-300 px-3 placeholder:text-gray-400 text-gray-900 " +
    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition";
  const errorCls = "text-xs text-red-600 mt-1";

  return (
    <form ref={formRef} className="space-y-6">
      {/* Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="sr-only">Name</label>
          <input id="name" name="name" type="text" placeholder="Name *" value={formData.name} onChange={handleChange}
                 className={inputCls} autoComplete="name" required aria-invalid={!!errors.name} />
          {errors.name && <p className={errorCls}>{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="month" className="sr-only">Month</label>
          <select id="month" name="month" value={formData.month} onChange={handleChange}
                  className={inputCls} required aria-invalid={!!errors.month}>
            <option value="">Month *</option>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i} value={i + 1}>
                {new Date(0, i).toLocaleString("default", { month: "long" })}
              </option>
            ))}
          </select>
          {errors.month && <p className={errorCls}>{errors.month}</p>}
        </div>

        <div>
          <label htmlFor="day" className="sr-only">Day</label>
          <input id="day" name="day" type="number" placeholder="Day *" value={formData.day} onChange={handleChange}
                 className={inputCls} inputMode="numeric" min={1} max={31} required aria-invalid={!!errors.day} />
          {errors.day && <p className={errorCls}>{errors.day}</p>}
        </div>

        <div>
          <label htmlFor="year" className="sr-only">Year</label>
          <input id="year" name="year" type="number" placeholder="Year *" value={formData.year} onChange={handleChange}
                 className={inputCls} inputMode="numeric" min={1875} max={new Date().getFullYear()} required aria-invalid={!!errors.year} />
          {errors.year && <p className={errorCls}>{errors.year}</p>}
        </div>

        <div>
          <label htmlFor="phone" className="sr-only">Phone</label>
          <input id="phone" name="phone" type="text" placeholder="Phone" value={formData.phone} onChange={handleChange}
                 className={inputCls} inputMode="numeric" autoComplete="tel" aria-invalid={!!errors.phone} />
          {errors.phone && <p className={errorCls}>{errors.phone}</p>}
        </div>

        <div>
          <label htmlFor="email" className="sr-only">Email</label>
          <input id="email" name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange}
                 className={inputCls} autoComplete="email" inputMode="email" autoCapitalize="none" aria-invalid={!!errors.email} />
          {errors.email && <p className={errorCls}>{errors.email}</p>}
        </div>

        <div className="md:col-span-2">
          <label htmlFor="address" className="sr-only">Address</label>
          <input id="address" name="address" type="text" placeholder="Address" value={formData.address} onChange={handleChange}
                 className={inputCls} autoComplete="street-address" />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="notes" className="sr-only">Notes</label>
          <textarea id="notes" name="notes" placeholder="Notes" value={formData.notes} onChange={handleChange}
                    className={`${inputCls} h-24 py-2`} />
        </div>
      </div>

      {/* Categories */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Categories</label>
        <div className="flex flex-wrap gap-2">
          {availableCategories.map((cat) => {
            const checked = selectedCategoryIds.includes(cat._id);
            return (
              <label
                key={cat._id}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm cursor-pointer select-none transition
                            ${checked ? "bg-white border-blue-400 ring-1 ring-blue-200" : "bg-white border-gray-300 hover:bg-gray-50"}`}
              >
                <input
                  type="checkbox"
                  className="accent-blue-600"
                  checked={checked}
                  onChange={(e) => {
                    setSelectedCategoryIds((prev) =>
                      e.target.checked ? [...prev, cat._id] : prev.filter((id) => id !== cat._id)
                    );
                  }}
                />
                <span className="inline-flex items-center gap-2">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full ring-2 ring-white"
                    style={{ backgroundColor: cat.color }}
                    aria-hidden
                  />
                  <span className="text-gray-800">{cat.name}</span>
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 border-t border-gray-200 pt-4">
        <div className="flex flex-col-reverse sm:flex-row justify-center gap-2">
          <button
            type="button"
            onClick={() => handleSubmit("exit")}
            className="h-11 px-4 rounded-lg border border-blue-300 text-blue-700 bg-white hover:bg-blue-50 active:scale-[.99] transition whitespace-nowrap inline-flex items-center justify-center"
          >
            {isEditMode ? "Update and Exit" : "Save and Exit"}
          </button>

          <button
            type="button"
            onClick={() => handleSubmit("upload")}
            className="h-11 px-4 rounded-lg bg-blue-600 text-white shadow hover:bg-blue-700 active:scale-[.99] transition whitespace-nowrap inline-flex items-center justify-center"
          >
            {isEditMode ? "Update → Upload Avatar" : "Save → Upload Avatar"}
          </button>
        </div>
      </div>


      {/* Avatar Upload Dialog (if managed here) */}
      {showUploadPrompt && personIdForUpload && (
        <AvatarUploadDialog
          personId={personIdForUpload}
          onUploadComplete={async () => {
            setShowUploadPrompt(false);
            await refreshPeople();
            setPersonIdForUpload(null);
            onClose();
          }}
        />
      )}
    </form>
  );
}
