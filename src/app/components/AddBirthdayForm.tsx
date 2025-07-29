import { useState, useEffect } from "react";
import type { Person } from "@/types";

export default function AddBirthdayForm({
  onClose,
  refreshPeople,
  personToEdit,
}: {
  onClose: () => void;
  refreshPeople: () => Promise<void>;
  personToEdit?: Person | null;
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
    }
  }, [personToEdit]);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    //set regex validation for phone and email if needed
  };

  const validate = () => {
    const newErrors: typeof errors = {};
    // if avatarUrl, ensure it is a valid url that ties to an image file(jpg, png, etc.)
    if (formData.avatarUrl) {
      const urlPattern = /\.(jpg|jpeg|png)$/;
      if (!urlPattern.test(formData.avatarUrl)) {
        newErrors.avatarUrl = "Invalid image URL";
      }
    }
    if (Number(formData.day) < 1 || Number(formData.day) > 31)
      newErrors.day = "Invalid day";
    if (formData.email.length > 0 && formData.email !== "") {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(formData.email) && formData.email.length > 0) {
        newErrors.email = "Invalid email format";
      }
    }
    if (formData.phone.length > 0 && formData.phone !== "") {
      const phoneRegex = /^\d{10}$/; // Example: 10-digit phone number
      if (!phoneRegex.test(formData.phone) && formData.phone.length > 0) {
        newErrors.phone = "Invalid phone number format";
      }
    }
    // Validate year that can't be greater than the current year or less than 150 years ago
    const currentYear = new Date().getFullYear();
    if (Number(formData.year) > currentYear || Number(formData.year) < currentYear - 150) {
      newErrors.year = "Invalid year";
    }
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    console.log("hit")
    e.preventDefault();
    const validationErrors = validate();
    console.log("Validation errors:", validationErrors);
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

      await refreshPeople();
      onClose();
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
          {errors.month && (
            <p className="text-red-500 text-sm">{errors.month}</p>
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
          {errors.year && (
            <p className="text-red-500 text-sm">{errors.year}</p>
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
            <p className="text-red-500 text-sm">{errors.phone}</p>
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
            <p className="text-red-500 text-sm">{errors.email}</p>
          )}
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

        <div>
          <input
            type="text"
            name="avatarUrl"
            placeholder="Avatar URL"
            value={formData.avatarUrl}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
          {errors.avatarUrl && (
            <p className="text-red-500 text-sm">{errors.avatarUrl}</p>
          )}
        </div>
      </div>

      <textarea
        name="notes"
        placeholder="Notes"
        value={formData.notes}
        onChange={handleChange}
        className="w-full p-2 border rounded"
      />

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
          Save
        </button>
      </div>
    </form>
  );
}
