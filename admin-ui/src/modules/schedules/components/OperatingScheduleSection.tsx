// src/modules/schedules/components/OperatingScheduleSection.tsx
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Toggle } from '../../../components/ui/Toggle';
import type { OperatingSchedule, DayOfWeek, TimeUnit } from '../types';
import { DAYS_OF_WEEK } from '../types';

interface OperatingScheduleSectionProps {
  schedule: OperatingSchedule;
  onChange: (schedule: OperatingSchedule) => void;
}

export function OperatingScheduleSection({ schedule, onChange }: OperatingScheduleSectionProps) {
  const handleDayToggle = (day: DayOfWeek, enabled: boolean) => {
    onChange({
      ...schedule,
      days: {
        ...schedule.days,
        [day]: {
          ...schedule.days[day],
          enabled,
        },
      },
    });
  };

  const handleTimeChange = (day: DayOfWeek, field: 'startTime' | 'endTime', value: string) => {
    if (schedule.uniformWeekdays) {
      // Apply to all weekdays (Mon-Fri)
      const weekdays: DayOfWeek[] = ['mon', 'tue', 'wed', 'thu', 'fri'];
      const updatedDays = { ...schedule.days };
      weekdays.forEach((d) => {
        updatedDays[d] = {
          ...updatedDays[d],
          [field]: value,
        };
      });
      onChange({ ...schedule, days: updatedDays });
    } else {
      // Apply to single day
      onChange({
        ...schedule,
        days: {
          ...schedule.days,
          [day]: {
            ...schedule.days[day],
            [field]: value,
          },
        },
      });
    }
  };

  const handleUniformToggle = (checked: boolean) => {
    if (checked) {
      // When enabling uniform, set all weekdays to Monday's times
      const mondayTimes = schedule.days.mon;
      const weekdays: DayOfWeek[] = ['mon', 'tue', 'wed', 'thu', 'fri'];
      const updatedDays = { ...schedule.days };
      weekdays.forEach((d) => {
        updatedDays[d] = {
          ...updatedDays[d],
          startTime: mondayTimes.startTime,
          endTime: mondayTimes.endTime,
        };
      });
      onChange({ ...schedule, uniformWeekdays: checked, days: updatedDays });
    } else {
      onChange({ ...schedule, uniformWeekdays: checked });
    }
  };

  return (
    <div className="space-y-6">
      {/* Operating Days */}
      <div>
        <h4 className="text-sm font-semibold text-text-primary mb-3">Operating Days</h4>
        <div className="space-y-2">
          {DAYS_OF_WEEK.map((day) => (
            <div key={day.value} className="flex items-center justify-between">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={schedule.days[day.value].enabled}
                  onChange={(e) => handleDayToggle(day.value, e.target.checked)}
                  className="rounded border-border text-brand-cyan focus:ring-brand-cyan"
                />
                <span className="text-sm text-text-secondary font-medium w-20">
                  {day.label}
                </span>
              </label>
              {schedule.days[day.value].enabled && (
                <div className="flex items-center gap-2">
                  <Input
                    type="time"
                    value={schedule.days[day.value].startTime}
                    onChange={(e) => handleTimeChange(day.value, 'startTime', e.target.value)}
                    className="w-28"
                  />
                  <span className="text-text-muted text-sm">to</span>
                  <Input
                    type="time"
                    value={schedule.days[day.value].endTime}
                    onChange={(e) => handleTimeChange(day.value, 'endTime', e.target.value)}
                    className="w-28"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Uniform Weekdays Toggle */}
      <div className="border-t-2 border-border pt-4">
        <Toggle
          label="Apply same time to all weekdays (Mon-Fri)"
          checked={schedule.uniformWeekdays}
          onChange={handleUniformToggle}
        />
        {schedule.uniformWeekdays && (
          <p className="mt-2 text-xs text-text-muted">
            Changes to any weekday time will apply to all weekdays
          </p>
        )}
      </div>

      {/* Cutoff Configuration */}
      <div className="border-t-2 border-border pt-4">
        <h4 className="text-sm font-semibold text-text-primary mb-3">Booking Cutoff</h4>
        <div className="flex items-end gap-3">
          <Input
            type="number"
            label="Value"
            value={schedule.cutoffValue}
            onChange={(e) =>
              onChange({ ...schedule, cutoffValue: parseInt(e.target.value) || 0 })
            }
            min={0}
            className="flex-1"
          />
          <Select
            label="Unit"
            value={schedule.cutoffUnit}
            onChange={(e) => onChange({ ...schedule, cutoffUnit: e.target.value as TimeUnit })}
            options={[
              { value: 'minutes', label: 'Minutes' },
              { value: 'hours', label: 'Hours' },
              { value: 'days', label: 'Days' },
            ]}
            className="flex-1"
          />
        </div>
        <p className="mt-2 text-xs text-text-muted">
          Bookings must be received this far before the scheduled pickup/delivery time
        </p>
      </div>
    </div>
  );
}
