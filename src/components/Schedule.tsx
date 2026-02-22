import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Clock } from "lucide-react";

type Location = "pirin" | "rodopi";

interface ClassItem {
  time: string;
  name: string;
  location: Location;
}

interface DaySchedule {
  day: string;
  classes: ClassItem[];
}

const scheduleData: DaySchedule[] = [
  {
    day: "Monday",
    classes: [
      { time: "19:00", name: "Taichi", location: "rodopi" },
    ],
  },
  {
    day: "Tuesday",
    classes: [
      { time: "18:30", name: "Hatha Yoga", location: "pirin" },
      { time: "18:30", name: "Mobility Flow", location: "rodopi" },
    ],
  },
  {
    day: "Wednesday",
    classes: [
      { time: "20:30", name: "Dance Meditation", location: "rodopi" },
    ],
  },
  {
    day: "Thursday",
    classes: [
      { time: "9:30", name: "Qi-gong", location: "rodopi" },
      { time: "19:00", name: "Taichi", location: "rodopi" },
      { time: "18:30", name: "Aerial Yoga", location: "pirin" },
    ],
  },
  {
    day: "Friday",
    classes: [
      { time: "19:00", name: "Lotus Face Yoga", location: "rodopi" },
      { time: "20:30", name: "Lotus Sound Journey", location: "rodopi" },
    ],
  },
  {
    day: "Saturday",
    classes: [
      { time: "11:30", name: "Hatha Yoga", location: "pirin" },
      { time: "17:00", name: "Aerial Yoga", location: "pirin" },
      { time: "18:30", name: "Mobility Flow", location: "rodopi" },
    ],
  },
  {
    day: "Sunday",
    classes: [
      { time: "17:30", name: "Art Workshop", location: "rodopi" },
    ],
  },
];

const Schedule = () => {
  const [filter, setFilter] = useState<"all" | Location>("all");

  const filteredSchedule = scheduleData.map((day) => ({
    ...day,
    classes: day.classes.filter(
      (cls) => filter === "all" || cls.location === filter
    ),
  }));

  return (
    <section id="schedule" className="py-24 bg-marble">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-5xl md:text-6xl text-charcoal mb-4">
            Weekly Schedule
          </h2>
          <p className="text-charcoal-light text-lg max-w-xl mx-auto">
            January 2026 • Regular Practices
          </p>
        </motion.div>

        {/* Location Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="flex justify-center gap-4 mb-12"
        >
          {[
            { key: "all", label: "All Locations" },
            { key: "pirin", label: "Pirin Hall" },
            { key: "rodopi", label: "Rodopi Hall" },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setFilter(item.key as "all" | Location)}
              className={`px-6 py-3 rounded-full font-body text-sm transition-all duration-300 ${
                filter === item.key
                  ? "bg-sage text-cream shadow-soft"
                  : "bg-cream text-charcoal hover:bg-sage-light"
              }`}
            >
              {item.label}
            </button>
          ))}
        </motion.div>

        {/* Schedule Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence mode="wait">
            {filteredSchedule.map((day, dayIndex) => (
              <motion.div
                key={day.day}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: dayIndex * 0.1, duration: 0.5 }}
                className="bg-cream rounded-2xl p-6 shadow-soft hover:shadow-elevated transition-shadow duration-300"
              >
                <h3 className="font-display text-2xl text-charcoal mb-4 pb-3 border-b border-border">
                  {day.day}
                </h3>
                {day.classes.length > 0 ? (
                  <div className="space-y-4">
                    {day.classes.map((cls, index) => (
                      <motion.div
                        key={`${cls.name}-${index}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="group"
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-sage font-medium font-body text-sm mt-0.5">
                            {cls.time}
                          </span>
                          <div className="flex-1">
                            <p className="text-charcoal font-medium font-body">
                              {cls.name}
                            </p>
                            <p className="text-charcoal-light text-xs flex items-center gap-1 mt-1">
                              <MapPin className="w-3 h-3" />
                              {cls.location === "pirin" ? "Pirin" : "Rodopi"} Hall
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className="text-charcoal-light text-sm italic">
                    No classes at selected location
                  </p>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Booking Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-3 bg-sage-light text-sage-dark px-6 py-4 rounded-xl">
            <Clock className="w-5 h-5" />
            <span className="font-body">
              Pre-booking required:{" "}
              <a href="tel:+359883317785" className="font-medium hover:underline">
                +359 883 317 785
              </a>
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Schedule;
