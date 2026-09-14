/**
 * server/modules/public-apis/routes.ts
 *
 * Extracted from server.ts (Phase 2 modularization). Covers external public
 * API proxying: country-info (restcountries.com), flight-status, overpass-pois
 * (OpenStreetMap Overpass API), opentripplanner.
 *
 * Route bodies moved verbatim.
 */

import type { Express } from "express";
import axios from "axios";

export function registerPublicApiRoutes(app: Express): void {

app.get("/api/public-apis/country-info", async (req, res) => {
  try {
    const country = String(req.query.country || "India").trim();
    const response = await axios.get(`https://restcountries.com/v3.1/name/${encodeURIComponent(country)}?fullText=false`, { timeout: 8000 });
    const data = response.data?.[0];
    if (!data) {
      return res.json({
        success: true,
        country: {
          name: country,
          capital: "Main City",
          currencies: [{ code: "INR", name: "Indian Rupee", symbol: "₹" }],
          languages: ["English", "Hindi"],
          timezones: ["UTC+05:30"],
          carSide: "left",
          flagEmoji: "🇮🇳"
        }
      });
    }
    
    // Parse currencies
    const currencies = data.currencies ? Object.entries(data.currencies).map(([code, val]: [string, any]) => ({
      code,
      name: val.name,
      symbol: val.symbol
    })) : [];

    const languages = data.languages ? Object.values(data.languages) : [];

    res.json({
      success: true,
      country: {
        name: data.name?.common || country,
        officialName: data.name?.official,
        capital: data.capital?.[0] || "N/A",
        region: data.region,
        subregion: data.subregion,
        population: data.population,
        flag: data.flags?.png || data.flags?.svg,
        flagEmoji: data.flag,
        currencies,
        languages,
        timezones: data.timezones || [],
        continents: data.continents || [],
        startOfWeek: data.startOfWeek || "monday",
        carSide: data.car?.side || "right",
        unMember: data.unMember
      }
    });
  } catch (error: any) {
    // Fallback info for common destinations
    res.json({
      success: true,
      country: {
        name: String(req.query.country || "India"),
        capital: "New Delhi",
        currencies: [{ code: "INR", name: "Indian Rupee", symbol: "₹" }],
        languages: ["Hindi", "English"],
        timezones: ["UTC+05:30"],
        carSide: "left",
        flagEmoji: "🇮🇳"
      }
    });
  }
});
app.get("/api/public-apis/flight-status", async (req, res) => {
  try {
    const flightNum = String(req.query.flightNumber || req.query.flight || "AI101").trim().toUpperCase();

    // Native Live Tracking Engine Response format
    res.json({
      success: true,
      source: "Live Tracking Engine",
      flight: {
        number: flightNum,
        status: "On Time",
        departure: { airport: "BOM - Mumbai", terminal: "T2", gate: "B12", scheduled: "14:30", estimated: "14:30" },
        arrival: { airport: "DEL - New Delhi", terminal: "T3", gate: "A4", scheduled: "16:45", estimated: "16:40" },
        aircraft: "Boeing 787-9 Dreamliner",
        altitudeFeet: "35,000 ft",
        speedKmh: "840 km/h"
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "Flight status query failed" });
  }
});
app.get("/api/public-apis/overpass-pois", async (req, res) => {
  try {
    const lat = parseFloat(String(req.query.lat || "19.0760"));
    const lng = parseFloat(String(req.query.lng || "72.8777"));
    const category = String(req.query.category || "tourism").toLowerCase();

    let amenityFilter = 'node["tourism"]';
    if (category === "emergency" || category === "atm") {
      amenityFilter = 'node["amenity"~"hospital|pharmacy|atm|police"]';
    } else if (category === "food") {
      amenityFilter = 'node["amenity"~"restaurant|cafe|fast_food"]';
    }

    const query = `[out:json][timeout:10];${amenityFilter}(around:3000, ${lat}, ${lng});out body 15;`;

    const opRes = await axios.post("https://overpass-api.de/api/interpreter", `data=${encodeURIComponent(query)}`, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      timeout: 8000
    });

    if (opRes.data && Array.isArray(opRes.data.elements)) {
      const pois = opRes.data.elements.map((el: any) => ({
        id: el.id,
        name: el.tags?.name || el.tags?.["name:en"] || "Local Point of Interest",
        type: el.tags?.tourism || el.tags?.amenity || "attraction",
        lat: el.lat,
        lng: el.lon,
        tags: el.tags
      }));
      return res.json({ success: true, source: "Overpass OSM API", pois });
    }

    res.json({ success: true, source: "Fallback", pois: [] });
  } catch (error: any) {
    res.json({
      success: true,
      source: "Default POIs",
      pois: [
        { id: 1, name: "City Center Tourist Hub", type: "tourism", lat: 19.076, lng: 72.877 },
        { id: 2, name: "24/7 Travel ATM & Exchange", type: "atm", lat: 19.078, lng: 72.879 },
        { id: 3, name: "Emergency Medical & Care Center", type: "hospital", lat: 19.080, lng: 72.881 }
      ]
    });
  }
});
app.post("/api/public-apis/opentripplanner", async (req, res) => {
  try {
    const { origin, destination, date } = req.body || {};
    res.json({
      success: true,
      source: "OpenTripPlanner Engine",
      routePlan: {
        origin: origin || "Origin Station",
        destination: destination || "Destination Station",
        date: date || new Date().toISOString().split("T")[0],
        modes: ["BUS", "RAIL", "WALK"],
        durationMinutes: 45,
        transfers: 1,
        legs: [
          { mode: "WALK", duration: "5 mins", distance: "400m" },
          { mode: "BUS", line: "Route 102", duration: "25 mins", stops: 6 },
          { mode: "RAIL", line: "Suburban Line", duration: "15 mins", stops: 3 }
        ]
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: "OpenTripPlanner query failed" });
  }
});

}
