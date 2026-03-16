import React from 'react';

export default function TimeSlotWrapper({ children, value, resource, timeSlotHeight, calendar, isSlotAvailable }) {
    return (
        <div
            className="time-slot-wrapper"
            style={{
                height: timeSlotHeight,
                backgroundColor:
                    calendar?.grayOutClosedHours && !isSlotAvailable(value, resource) ? '#c4c4c4' : '#ffffff',
            }}
        >
            {children}
        </div>
    );
}
