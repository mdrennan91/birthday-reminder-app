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
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data && setAvailableCategories(data));
  }, []);

  // Populate form if editing
  useEffect(() => {
    if (!personToEdit) return;

    const birthday = dayjs(personToEdit.birthday);
    if (!birthday.isValid()) {
      console.error("Invalid birthday:", personToEdit.birthday);
      return;
    }

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

    setSelectedCategoryIds(personToEdit.categories?.map((cat) => cat._id) ?? []);
  }, [personToEdit]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const validate = () => {
    const newErrors: typeof errors = {};
    const currentYear = new Date().getFullYear();

    if (!formData.name.trim()) newErrors.name = "Name is required";

    const month = +formData.month;
    const day = +formData.day;
    const year = +formData.year;

    if (!month || month < 1 || month > 12) newErrors.month = "Invalid month";
    if (!day || day < 1 || day > 31) newErrors.day = "Invalid day";
    if (!year || year < currentYear - 150 || year > currentYear)
      newErrors.year = "Invalid year";

    if (formData.email && !/^[\w.%+-]+@[\w.-]+\.\w{2,}$/.test(formData.email))
      newErrors.email = "Invalid email format";

    if (formData.phone && !/^\d{7,15}$/.test(formData.phone.replace(/[^\d]/g, "")))
      newErrors.phone = "Invalid phone number";

    return newErrors;
  };

  const handleSubmit = async (mode: "exit" | "upload") => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    const birthday = `${formData.year.trim()}-${formData.month.padStart(2, "0")}-${formData.day.padStart(2, "0")}`;

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

        const data = await res.json();             // <-- contains _id
        await refreshPeople();
        onUpdated?.(data);

        if (mode === "upload") {
          setPersonIdForUpload(data._id);          // <-- critical
          setShowUploadPrompt(true);               // open avatar dialog
        } else {
          setShowUploadPrompt(false);              // no upload
          setPersonIdForUpload(null);
          onClose();                               // just exit
        }
      } catch (err) {
        console.error("Error submitting form:", err);
      }
    };

  return (
    <form ref={formRef} className="space-y-4">
      {/* Inputs */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Name */}
        <div>
          <input
            type="text"
            name="name"
            placeholder="Name *"
            value={formData.name}
            onChange={handleChange}
            autoComplete="name"
            className="h-11 w-full rounded border px-3"
            required
          />
          {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
        </div>

        {/* Month */}
        <div>
          <select
            name="month"
            value={formData.month}
            onChange={handleChange}
            required
            className="h-11 w-full rounded border px-3"
          >
            <option value="">Month *</option>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i} value={i + 1}>
                {new Date(0, i).toLocaleString("default", { month: "long" })}
              </option>
            ))}
          </select>
          {errors.month && <p className="mt-1 text-sm text-red-500">{errors.month}</p>}
        </div>

        {/* Day */}
        <div>
          <input
            type="number"
            name="day"
            placeholder="Day *"
            value={formData.day}
            onChange={handleChange}
            inputMode="numeric"
            min={1}
            max={31}
            className="h-11 w-full rounded border px-3"
            required
          />
          {errors.day && <p className="mt-1 text-sm text-red-500">{errors.day}</p>}
        </div>

        {/* Year */}
        <div>
          <input
            type="number"
            name="year"
            placeholder="Year *"
            value={formData.year}
            onChange={handleChange}
            inputMode="numeric"
            className="h-11 w-full rounded border px-3"
            required
          />
          {errors.year && <p className="mt-1 text-sm text-red-500">{errors.year}</p>}
        </div>

        {/* Phone */}
        <div>
          <input
            type="tel"
            name="phone"
            placeholder="Phone"
            value={formData.phone}
            onChange={handleChange}
            autoComplete="tel"
            inputMode="tel"
            className="h-11 w-full rounded border px-3"
          />
          {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
        </div>

        {/* Email */}
        <div>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
            className="h-11 w-full rounded border px-3"
          />
          {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
        </div>

        {/* Address */}
        <div className="md:col-span-2">
          <input
            type="text"
            name="address"
            placeholder="Address"
            value={formData.address}
            onChange={handleChange}
            autoComplete="street-address"
            className="h-11 w-full rounded border px-3"
          />
        </div>

        {/* Notes */}
        <div className="md:col-span-2">
          <textarea
            name="notes"
            placeholder="Notes"
            value={formData.notes}
            onChange={handleChange}
            className="min-h-[96px] w-full rounded border p-3"
          />
        </div>

        {/* Categories */}
        <div className="md:col-span-2">
          <label className="mb-2 block font-medium">Categories</label>
          <div className="flex flex-wrap gap-2">
            {availableCategories.map((cat) => (
              <label
                key={cat._id}
                className="inline-flex cursor-pointer items-center gap-2 rounded-lg border px-2 py-1"
                title={cat.name}
              >
                <input
                  type="checkbox"
                  checked={selectedCategoryIds.includes(cat._id)}
                  onChange={(e) => {
                    setSelectedCategoryIds((prev) =>
                      e.target.checked ? [...prev, cat._id] : prev.filter((id) => id !== cat._id)
                    );
                  }}
                />
                <span className="text-sm font-medium" style={{ color: cat.color }}>
                  {cat.name}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="flex flex-col-reverse gap-2 pt-2 md:flex-row md:justify-end">
        <button
          type="button"
          onClick={onClose}
          className="h-11 rounded bg-gray-600 px-4 text-sm text-white hover:bg-gray-700"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={() => handleSubmit("exit")}
          className="h-11 rounded bg-blue-600 px-4 text-sm text-white hover:bg-blue-700"
        >
          {isEditMode ? "Update and Exit" : "Save and Exit"}
        </button>

        <button
          type="button"
          onClick={() => handleSubmit("upload")}
          className="h-11 rounded bg-blue-600 px-4 text-sm text-white hover:bg-blue-700"
        >
          {isEditMode ? "Update ➜ Upload Avatar" : "Save ➜ Upload Avatar"}
        </button>
      </div>

      {/* Avatar Upload Dialog */}
      {showUploadPrompt && personIdForUpload && (
        <AvatarUploadDialog
          personId={personIdForUpload}
          onUploadComplete={async () => {
            setShowUploadPrompt(false);
            await refreshPeople();
            setPersonIdForUpload(null);
            onClose(); // close after successful upload
          }}
        />
      )}
    </form>
  );
}
