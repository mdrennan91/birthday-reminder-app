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

    setSelectedCategoryIds(
      personToEdit.categories?.map((cat) => cat._id) ?? []
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
    const newErrors: typeof errors = {};
    const currentYear = new Date().getFullYear();

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (+formData.month < 1 || +formData.month > 12)
    newErrors.month = "Invalid month";

    if (+formData.day < 1 || +formData.day > 31) newErrors.day = "Invalid day";
    if (+formData.year < currentYear - 150 || +formData.year > currentYear)
      newErrors.year = "Invalid year";

    if (formData.email && !/^[\w.%+-]+@[\w.-]+\.\w{2,}$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = "Invalid phone number format";
    }

    return newErrors;
  };

    const handleSubmit = async (mode: "exit" | "upload") => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
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
      } else {
        setShowUploadPrompt(false); // ensure it's never triggered again
        setPersonIdForUpload(null);
        onClose();
      }
    } catch (err) {
      console.error("Error submitting form:", err);
    }
  };


  return (
    <form ref={formRef} className="space-y-4">

      {/* Input Fields (unchanged) */}
      <div className="grid grid-cols-2 gap-4">
        <div>
        <input
          type="text"
          name="name"
          placeholder="Name *"
          value={formData.name}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        {errors.name && (
          <p className="text-sm text-red-500 mt-1">{errors.name}</p>
        )}
        </div>
        <div>
        <select
          name="month"
          value={formData.month}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        >
          <option value="">Month *</option>
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i} value={i + 1}>
              {new Date(0, i).toLocaleString("default", { month: "long" })}
            </option>
          ))}
        </select>
        {errors.month && (
          <p className="col-span-2 text-sm text-red-500">{errors.month}</p>
        )}
        </div>

        <div>
        <input
          type="number"
          name="day"
          placeholder="Day *"
          value={formData.day}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        {errors.day && (
          <p className="col-span-2 text-sm text-red-500">{errors.day}</p>
        )}
        </div>
        <div>
        <input
          type="number"
          name="year"
          placeholder="Year *"
          value={formData.year}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />
        {errors.year && (
          <p className="col-span-2 text-sm text-red-500">{errors.year}</p>
        )}
        </div>
        <div>
        <input
          type="text"
          name="phone"
          placeholder="Phone"
          value={formData.phone}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        {errors.phone && (
          <p className="col-span-2 text-sm text-red-500">{errors.phone}</p>
        )}
        </div>
        <div>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        {errors.email && (
          <p className="col-span-2 text-sm text-red-500">{errors.email}</p>
        )}
        </div>
        <div>
        <input
          type="text"
          name="address"
          placeholder="Address"
          value={formData.address}
          onChange={handleChange}
          className="w-full col-span-2 p-2 border rounded"
        />
      </div>
      <div>
      <textarea
        name="notes"
        placeholder="Notes"
        value={formData.notes}
        onChange={handleChange}
        className="w-full p-2 border rounded"
      />
      </div>
      <div>
        <label className="block font-medium mb-1">Categories</label>
        <div className="flex flex-wrap gap-2">
          {availableCategories.map((cat) => (
            <label key={cat._id} className="flex items-center gap-1 text-sm">
              <input
                type="checkbox"
                checked={selectedCategoryIds.includes(cat._id)}
                onChange={(e) => {
                  setSelectedCategoryIds((prev) =>
                    e.target.checked
                      ? [...prev, cat._id]
                      : prev.filter((id) => id !== cat._id)
                  );
                }}
              />
              <span style={{ color: cat.color }}>{cat.name}</span>
            </label>
          ))}
        </div>
      </div>
      </div>
      {/* Footer Buttons */}
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => handleSubmit("exit")}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {isEditMode ? "Update and Exit" : "Save and Exit"}
        </button>

        <button
          type="button"
          onClick={() => handleSubmit("upload")}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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
            onClose();
          }}
        />
      )}
    </form>
  );
}
