import { useState, useEffect } from "react";
import type { Person } from "../../../types"; 


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
  };

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.month) newErrors.month = "Month is required";
    if (!formData.day) newErrors.day = "Day is required";
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const year = formData.year.trim() || "0000";
    const paddedMonth = formData.month.padStart(2, "0");
    const paddedDay = formData.day.padStart(2, "0");
    const birthday = `${year}-${paddedMonth}-${paddedDay}`;

    const payload = {
      ...formData,
      birthday,
    };

    try {
      const res = await fetch(
        personToEdit
          ? `/api/birthdays/${personToEdit._id}`
          : "/api/birthdays",
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
          />
          {errors.name && (
            <p className="text-red-500 text-sm">{errors.name}</p>
          )}
        </div>

        <div>
          <select
            name="month"
            value={formData.month}
            onChange={handleChange}
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
          />
          {errors.day && (
            <p className="text-red-500 text-sm">{errors.day}</p>
          )}
        </div>

        <input
          type="number"
          name="year"
          placeholder="Year (optional)"
          value={formData.year}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />

        <input
          type="text"
          name="phone"
          placeholder="Phone"
          value={formData.phone}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />

        <input
          type="text"
          name="address"
          placeholder="Address"
          value={formData.address}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />

        <input
          type="text"
          name="avatarUrl"
          placeholder="Avatar URL"
          value={formData.avatarUrl}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
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
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Save
        </button>
      </div>
    </form>
  );
}
