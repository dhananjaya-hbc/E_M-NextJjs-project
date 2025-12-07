import { Document, Model, model, models, Schema } from 'mongoose';

/**
 * TypeScript interface for Event document
 */
export interface IEvent extends Document {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Event schema definition
 */
const EventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Event description is required'],
      trim: true,
    },
    overview: {
      type: String,
      required: [true, 'Event overview is required'],
      trim: true,
    },
    image: {
      type: String,
      required: [true, 'Event image is required'],
      trim: true,
    },
    venue: {
      type: String,
      required: [true, 'Event venue is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Event location is required'],
      trim: true,
    },
    date: {
      type: String,
      required: [true, 'Event date is required'],
    },
    time: {
      type: String,
      required: [true, 'Event time is required'],
      trim: true,
    },
    mode: {
      type: String,
      required: [true, 'Event mode is required'],
      enum: {
        values: ['online', 'offline', 'hybrid'],
        message: 'Mode must be online, offline, or hybrid',
      },
      lowercase: true,
    },
    audience: {
      type: String,
      required: [true, 'Event audience is required'],
      trim: true,
    },
    agenda: {
      type: [String],
      required: [true, 'Event agenda is required'],
      validate: {
        validator: function (arr: string[]) {
          return arr.length > 0;
        },
        message: 'Agenda must contain at least one item',
      },
    },
    organizer: {
      type: String,
      required: [true, 'Event organizer is required'],
      trim: true,
    },
    tags: {
      type: [String],
      required: [true, 'Event tags are required'],
      validate: {
        validator: function (arr: string[]) {
          return arr.length > 0;
        },
        message: 'Tags must contain at least one item',
      },
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Pre-save hook for slug generation and date normalization
 */
EventSchema.pre('save', function () {
  // Generate slug from title only if title is modified or document is new
  if (this.isModified('title') || this.isNew) {
    this.slug = this.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  }

  // Normalize date to ISO format if modified or new
  if (this.isModified('date') || this.isNew) {
    try {
      const parsedDate = new Date(this.date);
      if (isNaN(parsedDate.getTime())) {
        throw new Error('Invalid date format. Please provide a valid date.');
      }
      // Store as ISO string (YYYY-MM-DD)
      this.date = parsedDate.toISOString().split('T')[0];
    } catch (error) {
      throw new Error('Invalid date format. Please provide a valid date.');
    }
  }

  // Normalize time format to HH:MM (24-hour format)
  if (this.isModified('time') || this.isNew) {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    const time12HourRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9]\s?(AM|PM)$/i;

    if (timeRegex.test(this.time)) {
      // Already in 24-hour format, ensure zero-padding
      const [hours, minutes] = this.time.split(':');
      this.time = `${hours.padStart(2, '0')}:${minutes}`;
    } else if (time12HourRegex.test(this.time)) {
      // Convert 12-hour format to 24-hour format
      const match = this.time.match(/^(0?[1-9]|1[0-2]):([0-5][0-9])\s?(AM|PM)$/i);
      if (match) {
        let hours = parseInt(match[1]);
        const minutes = match[2];
        const period = match[3].toUpperCase();

        if (period === 'PM' && hours !== 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;

        this.time = `${hours.toString().padStart(2, '0')}:${minutes}`;
      }
    } else {
      throw new Error('Invalid time format. Use HH:MM (24-hour) or HH:MM AM/PM.');
    }
  }
});

/**
 * Create or retrieve the Event model
 * Prevents OverwriteModelError in Next.js development hot reloads
 */
const Event: Model<IEvent> = models.Event || model<IEvent>('Event', EventSchema);

export default Event;
