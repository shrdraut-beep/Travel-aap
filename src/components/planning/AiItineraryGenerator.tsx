import React, { useState } from "react";
import { usePlanningStore } from "@/store/usePlanningStore";
import { db, auth } from "@/firebase";
import { doc, setDoc } from "firebase/firestore";

interface AiItineraryGeneratorProps {
  onCancel?: () => void;
}

interface FormData {
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  travelers: number;
  tripType: "solo" | "family" | "friends" | "couple" | "business";
  theme: string;
  interests: string;
}

export const AiItineraryGenerator: React.FC<AiItineraryGeneratorProps> = ({
  onCancel
}) => {
  const { addTrip, setLoading, setError, error } = usePlanningStore();

  const [formData, setFormData] = useState<FormData>({
    destination: "",
    startDate: "",
    endDate: "",
    budget: 0,
    travelers: 1,
    tripType: "solo",
    theme: "",
    interests: ""
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedItinerary, setGeneratedItinerary] = useState<any>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      // Handle numeric fields
      if (name === "budget" || name === "travelers") {
        return {
          ...prev,
          [name]: value === "" ? 0 : Number(value)
        };
      }
      // Handle all other fields
      return {
        ...prev,
        [name]: value
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.destination || !formData.startDate || !formData.endDate || !formData.budget) {
      setError("Please fill in all required fields");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Call the existing AI itinerary generation endpoint
      const response = await fetch("/api/generate-itinerary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          destination: formData.destination,
          startDate: formData.startDate,
          endDate: formData.endDate,
          budget: formData.budget,
          travelers: formData.travelers,
          tripType: formData.tripType,
          theme: formData.theme,
          interests: formData.interests.split(",").map((i: string) => i.trim())
        })
      });

      if (!response.ok) {
        throw new Error("Failed to generate itinerary");
      }

      const result = await response.json();

      if (result.success && result.text) {
        // Parse the AI-generated itinerary (it comes as JSON string in the text field)
        let itineraryData;
        try {
          itineraryData = JSON.parse(result.text);
        } catch (parseError) {
          console.error("Failed to parse AI response:", parseError);
          // Fallback to creating a basic trip structure from form data
          itineraryData = {
            trip_title: `${formData.destination} Trip`,
            totalEstimatedCost: formData.budget,
            activities: [],
            accommodations: [],
            transportation: [],
            dayPlans: []
          };
        }

        // Create trip object from AI response
        const newTrip: any = {
          id: Date.now().toString(), // Temporary ID, will be replaced by Firestore
          userId: "", // Will be set when saving
          destination: formData.destination,
          startDate: formData.startDate,
          endDate: formData.endDate,
          budget: formData.budget,
          currency: "INR", // Default, could be made configurable
          travelers: formData.travelers,
          tripType: formData.tripType,
          theme: formData.theme,
          activities: itineraryData.activities || [],
          accommodations: itineraryData.accommodations || [],
          transportation: itineraryData.transportation || [],
          dayPlans: itineraryData.dayPlans || [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isArchived: false
        };

        // Save to Firestore
        // Get user ID from auth or use mock for preview
        const user = auth.currentUser;
        let userId = "";
        if (user) {
          userId = user.uid;
        } else if (window.location.pathname.includes('/premium.html')) {
          // Mock user ID for preview mode
          userId = 'preview-user';
        }

        if (userId) {
          newTrip.userId = userId;
          const tripRef = doc(db, "trips", newTrip.id);
          await setDoc(tripRef, newTrip);

          // Add to local state
          addTrip(newTrip);
          // Note: Navigation to trip detail would be handled by parent component
          // In a full implementation, we might want to add an onNavigateToTripDetail prop
        } else {
          // If no auth, just add to local state for demo
          addTrip(newTrip);
          // Same as above - navigation would be handled by parent
        }
      } else {
        throw new Error("Invalid response from AI service");
      }
    } catch (err: any) {
      console.error("Error generating itinerary:", err);
      setError(err.message || "Failed to generate itinerary. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <div className="bg-white rounded-[16px] shadow-[0_8px_20px_-8px_rgba(40,32,79,0.25)] p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">AI Itinerary Generator</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Destination</label>
            <input
              type="text"
              name="destination"
              value={formData.destination}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="Enter destination (e.g., Goa, Manali, Kerala)"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Budget (₹)</label>
              <input
                type="number"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                min="1000"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Travelers</label>
              <input
                type="number"
                name="travelers"
                value={formData.travelers}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                min="1"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Trip Type</label>
            <select
              name="tripType"
              value={formData.tripType}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="solo">Solo</option>
              <option value="family">Family</option>
              <option value="friends">Friends</option>
              <option value="couple">Couple</option>
              <option value="business">Business</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Theme/Interest</label>
            <input
              type="text"
              name="theme"
              value={formData.theme}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="e.g., adventure, relaxation, culture, food"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Additional Interests (comma-separated)</label>
            <textarea
              name="interests"
              value={formData.interests}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              rows={3}
              placeholder="e.g., beaches, temples, trekking, wildlife"
            />
          </div>

          {isGenerating ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full border-4 border-t-2 border-[var(--premium-violet)] w-8 h-8"></div>
              <span className="ml-3 text-gray-600">Generating your itinerary...</span>
            </div>
          ) : (
            <button
              type="submit"
              disabled={isGenerating}
              className="w-full bg-[var(--premium-violet)] hover:bg-premium-violet-soft text-white font-medium py-3 px-4 rounded-md transition-colors"
            >
              Generate Itinerary with AI
            </button>
          )}
        </form>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
            {error}
          </div>
        )}
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={() => {
            onCancel?.();
          }}
          className="text-gray-500 hover:text-gray-700"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};