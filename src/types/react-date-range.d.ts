declare module 'react-date-range' {
    import * as React from 'react';

    export interface Range {
        startDate?: Date;
        endDate?: Date;
        key?: string;
    }

    export interface DateRange {
        ranges: Range[];
        onChange: (ranges: any) => void;
        moveRangeOnFirstSelection?: boolean;
        editableDateInputs?: boolean;
        months?: number;
        direction?: 'horizontal' | 'vertical';
        staticRanges?: any[];
        inputRanges?: any[];
        locale?: Locale;
        rangeColors?: string[];
        className?: string;
        showDateDisplay?: boolean;
        showMonthAndYearPickers?: boolean;
        disabledDay?: (date: Date) => boolean;
        weekStartsOn?: number;
        style?: object;
    }

    export class DateRangePicker extends React.Component<DateRange> {}

    export const createStaticRanges: (ranges: any[]) => any[];
    export interface RangeKeyDict {
        [key: string]: Range;
    }
}
