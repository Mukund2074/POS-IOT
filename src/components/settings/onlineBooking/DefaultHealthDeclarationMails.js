export const HealthDeclarationMails = {
    initial: {
        subject: 'Health Declaration form submission',
        body: `<!DOCTYPE html>
<html lang="da">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Health Declaration form submission</title>
</head>
<body>
    <p>Please fill in the health declaration form before your booking. <a href="{bookingLink}">{bookingLink}</a> {outlet_name} {booking_date} {booking_time}</p>
</body>
</html>`,
    },
    reminder: {
        subject: 'Health Declaration form submission reminder',
        body: `<!DOCTYPE html>
<html lang="da">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Health Declaration form submission reminder</title>
</head>
<body>
    <p>Reminder: Please fill in the health declaration form before your booking. <a href="{bookingLink}">{bookingLink}</a> {outlet_name} {booking_date} {booking_time}</p>
</body>
</html>`,
    },
};