import { useState, useEffect } from "react";
import type { Person, PersonWithBirthday } from "@/types";
import AvatarUploadDialog from "./AvatarUploadDialog";

export default function AddBirthdayForm({
  onClose,
  refreshPeople,
  personToEdit,
  onUpdated,
}: {
  onClose: () => void;
  refreshPeople: () => Promise<void>;
  personToEdit?: Person | null;
  onUpdated?: (updatedPerson: PersonWithBirthday) => void;
}) {
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
  const [newlyCreatedId, setNewlyCreatedId] = useState<string | null>(null);
  const [showUploadPrompt, setShowUploadPrompt] = useState(false);

  useEffect(() => {
    async function fetchCategories() {
      const res = await fetch("/api/categories");
      if (res.ok) {
        const data = await res.json();
        setAvailableCategories(data);
      }
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    if (personToEdit) {
      const birthday = new Date(personToEdit.birthday);
      setFormData({
        name: personToEdit.name || "",
        day: birthday.getDate().toString(),
        month: (birthday.getMonth() + 1).toString(),
        year: birthday.getFullYear().toString(),
        phone: personToEdit.phone || "",
        email: personToEdit.email || "",
        address: personToEdit.address || "",
        notes: personToEdit.notes || "",
        avatarUrl: personToEdit.avatarUrl || "",
      });

      setSelectedCategoryIds(personToEdit.categories?.map((cat) => cat._id) || []);
    }
  }, [personToEdit]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const newErrors: typeof errors = {};
    if (Number(formData.day) < 1 || Number(formData.day) > 31)
      newErrors.day = "Invalid day";
    if (formData.email.length > 0 && formData.email !== "") {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = "Invalid email format";
      }
    }
    if (formData.phone.length > 0 && formData.phone !== "") {
      const phoneRegex = /^\d{10}$/;
      if (!phoneRegex.test(formData.phone)) {
        newErrors.phone = "Invalid phone number format";
      }
    }
    const currentYear = new Date().getFullYear();
    if (
      Number(formData.year) > currentYear ||
      Number(formData.year) < currentYear - 150
    ) {
      newErrors.year = "Invalid year";
    }
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const year = formData.year.trim();
    const paddedMonth = formData.month.padStart(2, "0");
    const paddedDay = formData.day.padStart(2, "0");
    const birthday = `${year}-${paddedMonth}-${paddedDay}`;

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

      if (personToEdit) {
        if (onUpdated) onUpdated(data);
      } else {
        await refreshPeople(); // if you weren't already calling this here
      }

      setNewlyCreatedId(data._id);
      setShowUploadPrompt(true);

    } catch (err) {
      console.error("Error submitting form:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold mb-4">
        {personToEdit ? "Edit Birthday" : "Add Birthday"}
      </h2>

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
          {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
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
          {errors.month && <p className="text-red-500 text-sm">{errors.month}</p>}
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
          {errors.day && <p className="text-red-500 text-sm">{errors.day}</p>}
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
          {errors.year && <p className="text-red-500 text-sm">{errors.year}</p>}
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
          {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
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
          {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
        </div>

        <div>
          <input
            type="text"
            name="address"
            placeholder="Address"
            value={formData.address}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
      </div>

      <textarea
        name="notes"
        placeholder="Notes"
        value={formData.notes}
        onChange={handleChange}
        className="w-full p-2 border rounded"
      />

      <div>
        <label className="block font-medium mb-1">Categories</label>
        <div className="flex flex-wrap gap-2">
          {availableCategories.map((cat) => (
            <label key={cat._id} className="flex items-center gap-1 text-sm">
              <input
                type="checkbox"
                checked={selectedCategoryIds.includes(cat._id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedCategoryIds([...selectedCategoryIds, cat._id]);
                  } else {
                    setSelectedCategoryIds(
                      selectedCategoryIds.filter((id) => id !== cat._id)
                    );
                  }
                }}
              />
              <span style={{ color: cat.color }}>{cat.name}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          Save ➜ Upload Avatar
        </button>
      </div>
      {showUploadPrompt && newlyCreatedId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <AvatarUploadDialog
              personId={newlyCreatedId}
              onUploadComplete={async () => {
                await refreshPeople();
                setShowUploadPrompt(false);
                setNewlyCreatedId(null);
                onClose();
              }}
            />
          </div>
        </div>
      )}
    </form>
  );
}
