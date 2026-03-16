import { t } from 'i18next';
import moment from 'moment';

export default function CustomTimeHeader({ date, culture, localizer, currentWeek, lastValidWeek }) {
    const validDate = date;

    let displayWeek = currentWeek;
    if (validDate) {
        displayWeek = moment(validDate).isoWeek();
    } else if (lastValidWeek) {
        displayWeek = lastValidWeek;
    } else {
        displayWeek = moment().isoWeek();
    }

    return (
        <div>
            <div
                style={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: '4px',
                }}
            >
                {t('Common.Week')}
            </div>
            <div
                style={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    fontWeight: 700,
                }}
            >
                {displayWeek}
            </div>
        </div>
    );
}
