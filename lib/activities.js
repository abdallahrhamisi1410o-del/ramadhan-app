export const timeSlots = [
  {
    id: "pre-dawn",
    name: "Pre-Dawn",
    time: "Before Fajr",
    icon: "MoonIcon",
    color: "indigo",
    activities: [
      { id: 12, name: "Tahajjud (Qiyam)", points: 15, required: false, type: "prayer" }
    ]
  },
  {
    id: "fajr",
    name: "Fajr Time",
    time: "Dawn Prayer",
    icon: "SunIcon",
    color: "orange",
    activities: [
      { id: 7, name: "Fajr Qabliyah", points: 5, required: false, type: "sunnah" },
      { id: 1, name: "Fajr Prayer", points: 10, required: true, type: "fardh" },
      { id: 18, name: "Morning Adhkar", points: 5, required: false, type: "dhikr" }
    ]
  },
  {
    id: "morning",
    name: "Morning",
    time: "After Sunrise",
    icon: "SunIcon",
    color: "yellow",
    activities: [
      { id: 15, name: "Quran Reading (1 Juz')", points: 20, required: false, type: "quran" },
      { id: 17, name: "Dhikr & Tasbih", points: 5, required: false, type: "dhikr" }
    ]
  },
  {
    id: "dhuhr",
    name: "Dhuhr Time",
    time: "Midday Prayer",
    icon: "SunIcon",
    color: "blue",
    activities: [
      { id: 8, name: "Dhuhr Qabliyah", points: 5, required: false, type: "sunnah" },
      { id: 2, name: "Dhuhr Prayer", points: 10, required: true, type: "fardh" },
      { id: 9, name: "Dhuhr Ba'diyah", points: 5, required: false, type: "sunnah" }
    ]
  },
  {
    id: "afternoon",
    name: "Afternoon",
    time: "Between Dhuhr & Asr",
    icon: "CloudIcon",
    color: "emerald",
    activities: [
      { id: 20, name: "Charity Given", points: 10, required: false, type: "charity" },
      { id: 21, name: "Guarded Tongue", points: 5, required: false, type: "discipline" }
    ]
  },
  {
    id: "asr",
    name: "Asr Time",
    time: "Afternoon Prayer",
    icon: "SunIcon",
    color: "amber",
    activities: [
      { id: 3, name: "Asr Prayer", points: 10, required: true, type: "fardh" }
    ]
  },
  {
    id: "maghrib",
    name: "Maghrib Time",
    time: "Sunset & Iftar",
    icon: "SunIcon",
    color: "rose",
    activities: [
      { id: 6, name: "Fasting Completed", points: 20, required: true, type: "fardh" },
      { id: 4, name: "Maghrib Prayer", points: 10, required: true, type: "fardh" },
      { id: 10, name: "Maghrib Ba'diyah", points: 5, required: false, type: "sunnah" },
      { id: 25, name: "Fed Someone for Iftar", points: 15, required: false, type: "charity" }
    ]
  },
  {
    id: "evening",
    name: "Evening",
    time: "After Maghrib",
    icon: "MoonIcon",
    color: "purple",
    activities: [
      { id: 19, name: "Evening Adhkar", points: 5, required: false, type: "dhikr" }
    ]
  },
  {
    id: "isha",
    name: "Isha Time",
    time: "Night Prayer",
    icon: "MoonIcon",
    color: "indigo",
    activities: [
      { id: 5, name: "Isha Prayer", points: 10, required: true, type: "fardh" },
      { id: 11, name: "Isha Ba'diyah", points: 5, required: false, type: "sunnah" },
      { id: 13, name: "Taraweeh", points: 15, required: false, type: "prayer" },
      { id: 14, name: "Witr Prayer", points: 10, required: false, type: "prayer" }
    ]
  },
  {
    id: "daily",
    name: "Daily Goals",
    time: "Throughout the Day",
    icon: "StarIcon",
    color: "violet",
    activities: [
      { id: 22, name: "Avoided Major Sins", points: 10, required: true, type: "discipline" }
    ]
  }
];

export const activities = timeSlots.flatMap(slot => 
  slot.activities.map(act => ({ ...act, timeSlot: slot.id }))
);