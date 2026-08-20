#!/bin/bash
awk '
NR==148 {
  print "  if (tab === \"Flights\") return <FlightSearchTab lang={lang} currencySymbol={CURRENCIES?.[useCurrencyStore.getState().currency]?.symbol || \"₹\"} onBookNow={setCheckoutModalItem} onBack={() => setTab(\"Packages\")} />;"
  print "  if (tab === \"Hotels\") return <HotelSearchTab lang={lang} currencySymbol={CURRENCIES?.[useCurrencyStore.getState().currency]?.symbol || \"₹\"} onBookNow={setCheckoutModalItem} onBack={() => setTab(\"Packages\")} />;"
  print "  if (tab === \"Trains\") return <TrainInfoTab lang={lang} currencySymbol={CURRENCIES?.[useCurrencyStore.getState().currency]?.symbol || \"₹\"} onBookNow={setCheckoutModalItem} onBack={() => setTab(\"Packages\")} />;"
  print "  if (tab === \"Bus\") return <BusSearchTab lang={lang} currencySymbol={CURRENCIES?.[useCurrencyStore.getState().currency]?.symbol || \"₹\"} onBookNow={setCheckoutModalItem} onBack={() => setTab(\"Packages\")} />;"
  print "  if (tab === \"Cars\") return <CarSearchTab lang={lang} currencySymbol={CURRENCIES?.[useCurrencyStore.getState().currency]?.symbol || \"₹\"} onBookNow={setCheckoutModalItem} onBack={() => setTab(\"Packages\")} />;"
}
{print}
' src/components/routripo/BookingScreen.tsx > tmp.tsx && mv tmp.tsx src/components/routripo/BookingScreen.tsx
