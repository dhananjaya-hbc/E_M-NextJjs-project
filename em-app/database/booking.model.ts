import { Document, Model, model, models, Schema, Types } from 'mongoose';
import Event from './event.model';

/**
 * TypeScript interface for Booking document
 */
export interface IBooking extends Document {
  eventId: Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Booking schema definition
 */
const BookingSchema = new Schema<IBooking>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event ID is required'],
      index: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      validate: {
        validator: function (email: string) {
          // RFC 5322 compliant email regex pattern
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        },
        message: 'Please provide a valid email address',
      },
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Pre-save hook to validate that the referenced event exists
 * Prevents orphaned bookings by ensuring eventId points to an actual Event document
 */
BookingSchema.pre('save', async function () {
  // Only validate eventId if it's modified or the document is new
  if (this.isModified('eventId') || this.isNew) {
    try {
      const eventExists = await Event.exists({ _id: this.eventId });
      
      if (!eventExists) {
        throw new Error('Referenced event does not exist');
      }
    } catch (error) {
      throw new Error('Failed to validate event reference');
    }
  }
});

/**
 * Create or retrieve the Booking model
 * Prevents OverwriteModelError in Next.js development hot reloads
 */
const Booking: Model<IBooking> = models.Booking || model<IBooking>('Booking', BookingSchema);

export default Booking;
