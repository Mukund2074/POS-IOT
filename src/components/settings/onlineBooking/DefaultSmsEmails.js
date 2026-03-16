export const SmsEmailTemplates = {
    OTP: {
        sms_body: `Din kode er \${otp}`,
        email_sub: 'Bekræft din booking',
        email_body: `<!DOCTYPE html>
<html lang="da">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Din Bekræftelseskode</title>
    <style type="text/css">
        /* Basic Reset */
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
        table { border-collapse: collapse !important; }
        body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #F5F5F5; } /* Overall email background */
        /* Main Styles */
        body {
            font-family: Arial, Helvetica, sans-serif;
            font-size: 16px;
            line-height: 1.5;
            color: #333333;
        }
        a {
            color: #007BFF; /* Standard blue link color */
            text-decoration: underline;
        }
        /* Responsive */
        @media screen and (max-width: 600px) {
            .content-table {
                width: 100% !important; /* Make inner table full width */
                max-width: 100% !important;
            }
            .outer-padding {
                 padding: 20px 10px !important; /* Reduce padding on mobile */
            }
             .section-icon {
                 padding-bottom: 10px !important;
                 padding-right: 0 !important; /* Remove right padding */
                 text-align: center !important; /* Center icons on mobile */
                 width: 100% !important; /* Allow icon to take full width for centering */
                 display: block !important;
             }
              .section-text {
                 padding-left: 0 !important; /* Reset padding for stacked layout */
                 text-align: center !important; /* Center text on mobile */
                 display: block !important;
                 width: 100% !important;
              }
              .code-text {
                 font-size: 28px !important; /* Slightly smaller code on mobile */
              }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; width: 100%; background-color: #F5F5F5;">
    <!-- Outer Background & Centering Table -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F5F5F5;">
        <tr>
            <td align="center" valign="top" class="outer-padding" style="padding: 40px 20px;">
                <!--[if (gte mso 9)|(IE)]>
                <table align="center" border="0" cellspacing="0" cellpadding="0" width="600">
                <tr>
                <td align="center" valign="top" width="600">
                <![endif]-->
                <!-- Inner Content Table (Fixed Width on Desktop) -->
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #F5F5F5;" class="content-table">
                    <!-- Logo Section -->
                    <tr>
                        <td align="center" valign="top" style="padding: 0 20px 30px 20px;"> <!-- Add horizontal padding inside content area -->
                           <!-- Make sure to replace placeholder image URL -->
                           <img src="https://fiind-dev.s3.amazonaws.com/static/email_assets/fiind-logo.png" alt="bahlou.dk Logo" width="150" style="display: block; border: 0; width: 150px;">
                        </td>
                    </tr>
                    <!-- Intro Text Section -->
                    <tr>
                        <td align="left" valign="top" style="padding: 0 20px 20px 20px; color: #333333;">
                            Du er ved at foretage en booking. Indtast koden nedenfor
                        </td>
                    </tr>
                    <!-- Code Section -->
                    <tr>
                        <td align="left" valign="top" style="padding: 10px 20px 30px 20px; font-size: 20px; color: #000000;">
                            Din kode er <strong class="code-text" style="font-size: 32px; font-weight: bold;">\${otp}</strong>
                        </td>
                    </tr>
                     <!-- Don't recognize Section -->
                     <tr>
                        <td align="left" valign="top" style="padding: 0 20px 40px 20px;"> <!-- Bottom padding for last element -->
                             <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td width="40" valign="top" style="padding-right: 15px; font-size: 24px;" class="section-icon">
                                        :thinking_face: <!-- Using emoji - replace with image if needed -->
                                        <!-- Or use image: <img src="https://via.placeholder.com/32/CCCCCC/808080?text=Q" alt="" width="32" style="display: block; width: 32px;"> -->
                                    </td>
                                    <td valign="top" class="section-text">
                                        <div style="font-weight: bold; font-size: 18px; color: #000000; padding-bottom: 5px;">Kender du ikke til denne booking?</div>
                                        <div style="color: #333333;">Hvis du ikke kender til denne booking, kan du blot se bort fra denne mail.</div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
                <!-- /Inner Content Table -->
                <!--[if (gte mso 9)|(IE)]>
                </td>
                </tr>
                </table>
                <![endif]-->
            </td>
        </tr>
    </table>
    <!-- /Outer Background & Centering Table -->
</body>
</html>`,
    },
    bookingConfirmation: {
        sms_body: `Du har booket en tid til \${service_name} d. \${booking_date} kl. \${booking_time}. \nTlf. \${outlet_contact_number} \nMvh. \${outlet_name}`,
        email_sub: 'Din booking er bekræftet!',
        email_body: `<!DOCTYPE html>

<html lang="da">

<head>

    <meta charset="UTF-8">

    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <meta http-equiv="X-UA-Compatible" content="IE=edge">

    <title>Din Booking Bekræftelse</title>

    <style type="text/css">

        /* Basic Reset */

        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }

        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }

        img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }

        table { border-collapse: collapse !important; }

        body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #f5f5f5; } /* Overall email background */



        /* Main Styles */

        body {

            font-family: Arial, Helvetica, sans-serif;

            font-size: 16px;

            line-height: 1.5;

            color: #333333;

        }



        a {

            color: #007bff; /* Standard blue link color */

            text-decoration: underline;

        }



        /* Responsive */

        @media screen and (max-width: 600px) {

            .content-table {

                width: 100% !important; /* Make inner table full width */

                max-width: 100% !important;

            }

            .outer-padding {

                 padding: 20px 10px !important; /* Reduce padding on mobile */

            }

             .icon-cell {

                 display: block !important;

                 width: auto !important;

                 padding-bottom: 5px !important;

                 padding-right: 0 !important; /* Remove right padding */

             }

             .text-cell {

                 display: block !important;

                 width: auto !important;

                 padding-left: 0 !important; /* Reset padding for stacked layout */

             }

             .section-icon {

                 padding-bottom: 10px !important;

                 padding-right: 0 !important; /* Remove right padding */

                 text-align: center !important; /* Center icons on mobile */

                 width: 100% !important; /* Allow icon to take full width for centering */

                 display: block !important;

             }

              .section-text {

                 padding-left: 0 !important; /* Reset padding for stacked layout */

                 text-align: center !important; /* Center text on mobile */

                 display: block !important;

                 width: 100% !important;

              }

        }



    </style>

</head>

<body style="margin: 0; padding: 0; width: 100%; background-color: #f5f5f5;">

    <!-- Outer Background & Centering Table -->

    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f5f5f5;">

        <tr>

            <td align="center" valign="top" class="outer-padding" style="padding: 40px 20px;">

                <!--[if (gte mso 9)|(IE)]>

                <table align="center" border="0" cellspacing="0" cellpadding="0" width="600">

                <tr>

                <td align="center" valign="top" width="600">

                <![endif]-->

                <!-- Inner Content Table (Fixed Width on Desktop) -->

                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #f5f5f5;" class="content-table">



                    <!-- Logo Section -->

                    <tr>

                        <td align="center" valign="top" style="padding: 0 20px 30px 20px;"> <!-- Add horizontal padding inside content area -->

                           <!-- Make sure to replace placeholder image URL -->

                           <img src="https://fiind-dev.s3.amazonaws.com/static/email_assets/fiind-logo.png" alt="bahlou.dk Logo" width="150" style="display: block; border: 0; width: 150px;">

                        </td>

                    </tr>



                    <!-- Greeting Section -->

                    <tr>

                        <td align="left" valign="top" style="padding: 0 20px 10px 20px; font-size: 20px; font-weight: bold; color: #000000;">

                            Hej \${customer_name},

                        </td>

                    </tr>

                    <tr>

                        <td align="left" valign="top" style="padding: 0 20px 20px 20px; color: #333333;">

                            Du har booket en tid hos \${outlet_name}! Her er detaljerne:

                        </td>

                    </tr>



                    <!-- Service Details -->

                    <tr>

                        <td align="left" valign="top" style="padding: 0 20px 30px 20px; font-size: 18px; color: #333333;">

                            \${service_list}

                        </td>

                    </tr>



                    <!-- Date Section -->

                    <tr>

                        <td align="left" valign="top" style="padding: 0 20px 15px 20px;">

                            <table border="0" cellpadding="0" cellspacing="0" width="100%">

                                <tr>

                                    <td width="30" valign="middle" style="padding-right: 10px;" class="icon-cell">

                                        <!-- Replace with actual icon URL -->

                                        <img src="https://fiind-dev.s3.amazonaws.com/static/email_assets/calendar.png" alt="Dato" width="24" style="display: block; width: 24px;">

                                    </td>

                                    <td valign="middle" style="color: #333333;" class="text-cell">

                                        Dato: \${booking_date}

                                    </td>

                                </tr>

                            </table>

                        </td>

                    </tr>



                    <!-- Time Section -->

                    <tr>

                        <td align="left" valign="top" style="padding: 0 20px 15px 20px;">

                             <table border="0" cellpadding="0" cellspacing="0" width="100%">

                                <tr>

                                    <td width="30" valign="middle" style="padding-right: 10px;" class="icon-cell">

                                        <!-- Replace with actual icon URL -->

                                        <img src="https://fiind-dev.s3.amazonaws.com/static/email_assets/clock.png" alt="Tid" width="24" style="display: block; width: 24px;">

                                    </td>

                                    <td valign="middle" style="color: #333333;" class="text-cell">

                                        Tid: \${booking_time}

                                    </td>

                                </tr>

                            </table>

                        </td>

                    </tr>



                    <!-- Address Section -->

                     <tr>

                        <td align="left" valign="top" style="padding: 0 20px 40px 20px;">

                             <table border="0" cellpadding="0" cellspacing="0" width="100%">

                                <tr>

                                    <td width="30" valign="middle" style="padding-right: 10px;" class="icon-cell">

                                         <!-- Replace with actual icon URL -->

                                        <img src="https://fiind-dev.s3.amazonaws.com/static/email_assets/location.png" alt="Adresse" width="24" style="display: block; width: 24px;">

                                    </td>

                                    <td valign="middle" style="color: #333333;" class="text-cell">

                                        Adresse: \${outlet_address}

                                    </td>

                                </tr>

                            </table>

                        </td>

                    </tr>



                    <!-- What to expect Section -->

                     <tr>

                        <td align="left" valign="top" style="padding: 0 20px 30px 20px;">

                             <table border="0" cellpadding="0" cellspacing="0" width="100%">

                                <tr>

                                    <td width="40" valign="top" style="padding-right: 15px;" class="section-icon">

                                        <!-- Replace with actual icon URL -->

                                        <img src="https://fiind-dev.s3.amazonaws.com/static/email_assets/sparkles.png" alt="" width="32" style="display: block; width: 32px;">

                                    </td>

                                    <td valign="top" class="section-text">

                                        <div style="font-weight: bold; font-size: 18px; color: #000000; padding-bottom: 5px;">Hvad kan du forvente?</div>

                                        <div style="color: #333333;">Vi sørger for, at du føler dig tryg og får den bedste oplevelse med din behandling.</div>

                                    </td>

                                </tr>

                            </table>

                        </td>

                    </tr>



                     <!-- Questions Section -->

                     <tr>

                        <td align="left" valign="top" style="padding: 0 20px 30px 20px;">

                             <table border="0" cellpadding="0" cellspacing="0" width="100%">

                                <tr>

                                    <td width="40" valign="top" style="padding-right: 15px;" class="section-icon">

                                        <!-- Replace with actual icon URL -->

                                        <img src="https://fiind-dev.s3.amazonaws.com/static/email_assets/handshake.png" alt="" width="32" style="display: block; width: 32px;">

                                    </td>

                                    <td valign="top" class="section-text">

                                        <div style="font-weight: bold; font-size: 18px; color: #000000; padding-bottom: 5px;">Har du spørgsmål?</div>

                                        <div style="color: #333333;">Du kan kontakte os direkte på <a href="tel:\${outlet_contact_number}" style="color: #007bff; text-decoration: underline;">\${outlet_contact_number}</a>.</div>

                                    </td>

                                </tr>

                            </table>

                        </td>

                    </tr>



                     <!-- Change Booking Section -->

                     <tr style="\${cancellation_policy_style}">

                        <td align="left" valign="top" style="padding: 0 20px 40px 20px;"> <!-- Bottom padding for last element -->

                             <table border="0" cellpadding="0" cellspacing="0" width="100%">

                                <tr>

                                    <!-- No icon needed here, td alignment takes care of it -->

                                    <td valign="top">

                                        <div style="font-weight: bold; font-size: 18px; color: #000000; padding-bottom: 5px;">Ændre din booking?</div>

                                        <div style="color: #333333;">Læs vores afbudspolitik <a href="\${cancellation_policy_url}" style="color: #007bff; text-decoration: underline;">her</a>.</div> <!-- Replace # with actual link -->

                                    </td>

                                </tr>

                            </table>

                        </td>

                    </tr>



                </table>

                <!-- /Inner Content Table -->

                <!--[if (gte mso 9)|(IE)]>

                </td>

                </tr>

                </table>

                <![endif]-->

            </td>

        </tr>

    </table>

    <!-- /Outer Background & Centering Table -->

</body>

</html>`,
    },
    reminder: {
        sms_body: `Husk din tid i morgen til \${service_name} kl. \${booking_time} \nTlf. \${outlet_contact_number} \nMvh. \${outlet_name}`,
        email_sub: 'Husk din tid i morgen!',
        email_body: `<!DOCTYPE html>

<html lang="da">

<head>

    <meta charset="UTF-8">

    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <meta http-equiv="X-UA-Compatible" content="IE=edge">

    <title>Din Booking Påmindelse</title>

    <style type="text/css">

        /* Basic Reset */

        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }

        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }

        img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }

        table { border-collapse: collapse !important; }

        body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #f5f5f5; } /* Overall email background */



        /* Main Styles */

        body {

            font-family: Arial, Helvetica, sans-serif;

            font-size: 16px;

            line-height: 1.5;

            color: #333333;

        }



        a {

            color: #007bff; /* Standard blue link color */

            text-decoration: underline;

        }



        /* Responsive */

        @media screen and (max-width: 600px) {

            .content-table {

                width: 100% !important; /* Make inner table full width */

                max-width: 100% !important;

            }

            .outer-padding {

                 padding: 20px 10px !important; /* Reduce padding on mobile */

            }

             .icon-cell {

                 display: block !important;

                 width: auto !important;

                 padding-bottom: 5px !important;

                 padding-right: 0 !important; /* Remove right padding */

             }

             .text-cell {

                 display: block !important;

                 width: auto !important;

                 padding-left: 0 !important; /* Reset padding for stacked layout */

             }

             .section-icon {

                 padding-bottom: 10px !important;

                 padding-right: 0 !important; /* Remove right padding */

                 text-align: center !important; /* Center icons on mobile */

                 width: 100% !important; /* Allow icon to take full width for centering */

                 display: block !important;

             }

              .section-text {

                 padding-left: 0 !important; /* Reset padding for stacked layout */

                 text-align: center !important; /* Center text on mobile */

                 display: block !important;

                 width: 100% !important;

              }

        }



    </style>

</head>

<body style="margin: 0; padding: 0; width: 100%; background-color: #f5f5f5;">

    <!-- Outer Background & Centering Table -->

    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f5f5f5;">

        <tr>

            <td align="center" valign="top" class="outer-padding" style="padding: 40px 20px;">

                <!--[if (gte mso 9)|(IE)]>

                <table align="center" border="0" cellspacing="0" cellpadding="0" width="600">

                <tr>

                <td align="center" valign="top" width="600">

                <![endif]-->

                <!-- Inner Content Table (Fixed Width on Desktop) -->

                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #f5f5f5;" class="content-table">



                    <!-- Logo Section -->

                    <tr>

                        <td align="center" valign="top" style="padding: 0 20px 30px 20px;"> <!-- Add horizontal padding inside content area -->

                           <!-- Make sure to replace placeholder image URL -->

                           <img src="https://fiind-dev.s3.amazonaws.com/static/email_assets/fiind-logo.png" alt="bahlou.dk Logo" width="150" style="display: block; border: 0; width: 150px;">

                        </td>

                    </tr>



                    <!-- Greeting Section -->

                    <tr>

                        <td align="left" valign="top" style="padding: 0 20px 10px 20px; font-size: 20px; font-weight: bold; color: #000000;">

                            Hej \${customer_name},

                        </td>

                    </tr>

                    <tr>

                        <td align="left" valign="top" style="padding: 0 20px 20px 20px; color: #333333;">

                            Husk at du har en booking hos \${outlet_name} <strong style="font-weight: bold; color: #000000;">i morgen</strong> kl. <strong style="font-weight: bold; color: #000000;">\${booking_time}</strong>!<br>

                            Her er detaljerne for din booking:

                        </td>

                    </tr>



                    <!-- Service Details -->

                    <tr>

                        <td align="left" valign="top" style="padding: 0 20px 30px 20px; font-size: 18px; color: #333333;">

                            1 x \${service_name}

                        </td>

                    </tr>



                    <!-- Date Section ("Tomorrow") -->

                    <tr>

                        <td align="left" valign="top" style="padding: 0 20px 15px 20px;">

                            <table border="0" cellpadding="0" cellspacing="0" width="100%">

                                <tr>

                                    <td width="30" valign="middle" style="padding-right: 10px;" class="icon-cell">

                                        <!-- Replace with actual icon URL -->

                                        <img src="https://fiind-dev.s3.amazonaws.com/static/email_assets/calendar.png" alt="Dato" width="24" style="display: block; width: 24px;">

                                    </td>

                                    <td valign="middle" style="color: #333333;" class="text-cell">

                                        I morgen

                                    </td>

                                </tr>

                            </table>

                        </td>

                    </tr>



                    <!-- Time Section -->

                    <tr>

                        <td align="left" valign="top" style="padding: 0 20px 15px 20px;">

                             <table border="0" cellpadding="0" cellspacing="0" width="100%">

                                <tr>

                                    <td width="30" valign="middle" style="padding-right: 10px;" class="icon-cell">

                                        <!-- Replace with actual icon URL -->

                                        <img src="https://fiind-dev.s3.amazonaws.com/static/email_assets/clock.png" alt="Tid" width="24" style="display: block; width: 24px;">

                                    </td>

                                    <td valign="middle" style="color: #333333;" class="text-cell">

                                        Tid: \${booking_time}

                                    </td>

                                </tr>

                            </table>

                        </td>

                    </tr>



                    <!-- Address Section -->

                     <tr>

                        <td align="left" valign="top" style="padding: 0 20px 40px 20px;">

                             <table border="0" cellpadding="0" cellspacing="0" width="100%">

                                <tr>

                                    <td width="30" valign="middle" style="padding-right: 10px;" class="icon-cell">

                                         <!-- Replace with actual icon URL -->

                                        <img src="https://fiind-dev.s3.amazonaws.com/static/email_assets/location.png" alt="Adresse" width="24" style="display: block; width: 24px;">

                                    </td>

                                    <td valign="middle" style="color: #333333;" class="text-cell">

                                        Adresse: \${outlet_address}

                                    </td>

                                </tr>

                            </table>

                        </td>

                    </tr>



                     <!-- Questions Section -->

                     <tr>

                        <td align="left" valign="top" style="padding: 0 20px 40px 20px;"> <!-- Bottom padding for last element -->

                             <table border="0" cellpadding="0" cellspacing="0" width="100%">

                                <tr>

                                    <td width="40" valign="top" style="padding-right: 15px;" class="section-icon">

                                        <!-- Replace with actual icon URL -->

                                        <img src="https://fiind-dev.s3.amazonaws.com/static/email_assets/handshake.png" alt="" width="32" style="display: block; width: 32px;">

                                    </td>

                                    <td valign="top" class="section-text">

                                        <div style="font-weight: bold; font-size: 18px; color: #000000; padding-bottom: 5px;">Har du spørgsmål?</div>

                                        <div style="color: #333333;">Du kan kontakte os direkte på <a href="tel:\${outlet_contact_number}" style="color: #007bff; text-decoration: underline;">\${outlet_contact_number}</a>.</div>

                                    </td>

                                </tr>

                            </table>

                        </td>

                    </tr>



                    <!-- NOTE: "What to expect" and "Change booking" sections are omitted as per image 3 -->



                </table>

                <!-- /Inner Content Table -->

                <!--[if (gte mso 9)|(IE)]>

                </td>

                </tr>

                </table>

                <![endif]-->

            </td>

        </tr>

    </table>

    <!-- /Outer Background & Centering Table -->

</body>

</html>`,
    },
    bookingReschedule: {
        sms_body: `Din tid til \${service_name} er blevet rykket til d. \${booking_date} kl. \${booking_time} \nTlf. \${outlet_contact_number} \nMvh. \${outlet_name}`,
        email_sub: 'Din booking er blevet ændret!',
        email_body: `<!DOCTYPE html>

<html lang="da">

<head>

    <meta charset="UTF-8">

    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <meta http-equiv="X-UA-Compatible" content="IE=edge">

    <title>Din Booking Bekræftelse</title>

    <style type="text/css">

        /* Basic Reset */

        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }

        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }

        img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }

        table { border-collapse: collapse !important; }

        body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #f5f5f5; } /* Overall email background */



        /* Main Styles */

        body {

            font-family: Arial, Helvetica, sans-serif;

            font-size: 16px;

            line-height: 1.5;

            color: #333333;

        }



        a {

            color: #007bff; /* Standard blue link color */

            text-decoration: underline;

        }



        /* Responsive */

        @media screen and (max-width: 600px) {

            .content-table {

                width: 100% !important; /* Make inner table full width */

                max-width: 100% !important;

            }

            .outer-padding {

                 padding: 20px 10px !important; /* Reduce padding on mobile */

            }

             .icon-cell {

                 display: block !important;

                 width: auto !important;

                 padding-bottom: 5px !important;

                 padding-right: 0 !important; /* Remove right padding */

             }

             .text-cell {

                 display: block !important;

                 width: auto !important;

                 padding-left: 0 !important; /* Reset padding for stacked layout */

             }

             .section-icon {

                 padding-bottom: 10px !important;

                 padding-right: 0 !important; /* Remove right padding */

                 text-align: center !important; /* Center icons on mobile */

                 width: 100% !important; /* Allow icon to take full width for centering */

                 display: block !important;

             }

              .section-text {

                 padding-left: 0 !important; /* Reset padding for stacked layout */

                 text-align: center !important; /* Center text on mobile */

                 display: block !important;

                 width: 100% !important;

              }

        }



    </style>

</head>

<body style="margin: 0; padding: 0; width: 100%; background-color: #f5f5f5;">

    <!-- Outer Background & Centering Table -->

    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f5f5f5;">

        <tr>

            <td align="center" valign="top" class="outer-padding" style="padding: 40px 20px;">

                <!--[if (gte mso 9)|(IE)]>

                <table align="center" border="0" cellspacing="0" cellpadding="0" width="600">

                <tr>

                <td align="center" valign="top" width="600">

                <![endif]-->

                <!-- Inner Content Table (Fixed Width on Desktop) -->

                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #f5f5f5;" class="content-table">



                    <!-- Logo Section -->

                    <tr>

                        <td align="center" valign="top" style="padding: 0 20px 30px 20px;"> <!-- Add horizontal padding inside content area -->

                           <!-- Make sure to replace placeholder image URL -->

                           <img src="https://fiind-dev.s3.amazonaws.com/static/email_assets/fiind-logo.png" alt="bahlou.dk Logo" width="150" style="display: block; border: 0; width: 150px;">

                        </td>

                    </tr>



                    <!-- Greeting Section -->

                    <tr>

                        <td align="left" valign="top" style="padding: 0 20px 10px 20px; font-size: 20px; font-weight: bold; color: #000000;">

                            Hej \${customer_name},

                        </td>

                    </tr>

                    <tr>

                        <td align="left" valign="top" style="padding: 0 20px 20px 20px; color: #333333;">

                            Din booking hos \${outlet_name} er blevet <strong style="font-weight: bold; color: #000000;">ændret.</strong><br />
                            Her er detaljerne for din nye booking:

                        </td>

                    </tr>



                    <!-- Service Details -->

                    <tr>

                        <td align="left" valign="top" style="padding: 0 20px 30px 20px; font-size: 18px; color: #333333;">

                            \${service_list}

                        </td>

                    </tr>



                    <!-- Date Section -->

                    <tr>

                        <td align="left" valign="top" style="padding: 0 20px 15px 20px;">

                            <table border="0" cellpadding="0" cellspacing="0" width="100%">

                                <tr>

                                    <td width="30" valign="middle" style="padding-right: 10px;" class="icon-cell">

                                        <!-- Replace with actual icon URL -->

                                        <img src="https://fiind-dev.s3.amazonaws.com/static/email_assets/calendar.png" alt="Dato" width="24" style="display: block; width: 24px;">

                                    </td>

                                    <td valign="middle" style="color: #333333;" class="text-cell">

                                        Dato: \${booking_date}

                                    </td>

                                </tr>

                            </table>

                        </td>

                    </tr>



                    <!-- Time Section -->

                    <tr>

                        <td align="left" valign="top" style="padding: 0 20px 15px 20px;">

                             <table border="0" cellpadding="0" cellspacing="0" width="100%">

                                <tr>

                                    <td width="30" valign="middle" style="padding-right: 10px;" class="icon-cell">

                                        <!-- Replace with actual icon URL -->

                                        <img src="https://fiind-dev.s3.amazonaws.com/static/email_assets/clock.png" alt="Tid" width="24" style="display: block; width: 24px;">

                                    </td>

                                    <td valign="middle" style="color: #333333;" class="text-cell">

                                        Tid: \${booking_time}

                                    </td>

                                </tr>

                            </table>

                        </td>

                    </tr>



                    <!-- Address Section -->

                     <tr>

                        <td align="left" valign="top" style="padding: 0 20px 40px 20px;">

                             <table border="0" cellpadding="0" cellspacing="0" width="100%">

                                <tr>

                                    <td width="30" valign="middle" style="padding-right: 10px;" class="icon-cell">

                                         <!-- Replace with actual icon URL -->

                                        <img src="https://fiind-dev.s3.amazonaws.com/static/email_assets/location.png" alt="Adresse" width="24" style="display: block; width: 24px;">

                                    </td>

                                    <td valign="middle" style="color: #333333;" class="text-cell">

                                        Adresse: \${outlet_address}

                                    </td>

                                </tr>

                            </table>

                        </td>

                    </tr>



                     <!-- Questions Section -->

                     <tr>

                        <td align="left" valign="top" style="padding: 0 20px 30px 20px;">

                             <table border="0" cellpadding="0" cellspacing="0" width="100%">

                                <tr>

                                    <td width="40" valign="top" style="padding-right: 15px;" class="section-icon">

                                        <!-- Replace with actual icon URL -->

                                        <img src="https://fiind-dev.s3.amazonaws.com/static/email_assets/handshake.png" alt="" width="32" style="display: block; width: 32px;">

                                    </td>

                                    <td valign="top" class="section-text">

                                        <div style="font-weight: bold; font-size: 18px; color: #000000; padding-bottom: 5px;">Har du spørgsmål?</div>

                                        <div style="color: #333333;">Du kan kontakte os direkte på <a href="tel:\${outlet_contact_number}" style="color: #007bff; text-decoration: underline;">\${outlet_contact_number}</a>.</div>

                                    </td>

                                </tr>

                            </table>

                        </td>

                    </tr>


                </table>

                <!-- /Inner Content Table -->

                <!--[if (gte mso 9)|(IE)]>

                </td>

                </tr>

                </table>

                <![endif]-->

            </td>

        </tr>

    </table>

    <!-- /Outer Background & Centering Table -->

</body>

</html>`,
    },
    cancellation: {
        sms_body: `Din tid til \${service_name} d. \${booking_date} er blevet aflyst \nTlf. \${outlet_contact_number} \nMvh. \${outlet_name}`,
        email_sub: 'Din booking er blevet aflyst!',
        email_body: `<!DOCTYPE html>

<html lang="da">

<head>

    <meta charset="UTF-8">

    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <meta http-equiv="X-UA-Compatible" content="IE=edge">

    <title>Din Booking Påmindelse</title>

    <style type="text/css">

        /* Basic Reset */

        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }

        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }

        img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }

        table { border-collapse: collapse !important; }

        body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #f5f5f5; } /* Overall email background */



        /* Main Styles */

        body {

            font-family: Arial, Helvetica, sans-serif;

            font-size: 16px;

            line-height: 1.5;

            color: #333333;

        }



        a {

            color: #007bff; /* Standard blue link color */

            text-decoration: underline;

        }



        /* Responsive */

        @media screen and (max-width: 600px) {

            .content-table {

                width: 100% !important; /* Make inner table full width */

                max-width: 100% !important;

            }

            .outer-padding {

                 padding: 20px 10px !important; /* Reduce padding on mobile */

            }

             .icon-cell {

                 display: block !important;

                 width: auto !important;

                 padding-bottom: 5px !important;

                 padding-right: 0 !important; /* Remove right padding */

             }

             .text-cell {

                 display: block !important;

                 width: auto !important;

                 padding-left: 0 !important; /* Reset padding for stacked layout */

             }

             .section-icon {

                 padding-bottom: 10px !important;

                 padding-right: 0 !important; /* Remove right padding */

                 text-align: center !important; /* Center icons on mobile */

                 width: 100% !important; /* Allow icon to take full width for centering */

                 display: block !important;

             }

              .section-text {

                 padding-left: 0 !important; /* Reset padding for stacked layout */

                 text-align: center !important; /* Center text on mobile */

                 display: block !important;

                 width: 100% !important;

              }

        }



    </style>

</head>

<body style="margin: 0; padding: 0; width: 100%; background-color: #f5f5f5;">

    <!-- Outer Background & Centering Table -->

    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f5f5f5;">

        <tr>

            <td align="center" valign="top" class="outer-padding" style="padding: 40px 20px;">

                <!--[if (gte mso 9)|(IE)]>

                <table align="center" border="0" cellspacing="0" cellpadding="0" width="600">

                <tr>

                <td align="center" valign="top" width="600">

                <![endif]-->

                <!-- Inner Content Table (Fixed Width on Desktop) -->

                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #f5f5f5;" class="content-table">



                    <!-- Logo Section -->

                    <tr>

                        <td align="center" valign="top" style="padding: 0 20px 30px 20px;"> <!-- Add horizontal padding inside content area -->

                           <!-- Make sure to replace placeholder image URL -->

                           <img src="https://fiind-dev.s3.amazonaws.com/static/email_assets/fiind-logo.png" alt="bahlou.dk Logo" width="150" style="display: block; border: 0; width: 150px;">

                        </td>

                    </tr>



                    <!-- Greeting Section -->

                    <tr>

                        <td align="left" valign="top" style="padding: 0 20px 10px 20px; font-size: 20px; font-weight: bold; color: #000000;">

                            Hej \${customer_name},

                        </td>

                    </tr>

                    <tr>

                        <td align="left" valign="top" style="padding: 0 20px 20px 20px; color: #333333;">
                            Din booking hos \${outlet_name}, til \${service_name}<br>
                            d. \${booking_date} er blevet <strong style="font-weight: bold; color: #000000;">aflyst.</strong>
                        </td>

                    </tr>

                     <!-- Questions Section -->

                     <tr>

                        <td align="left" valign="top" style="padding: 0 20px 40px 20px;"> <!-- Bottom padding for last element -->

                             <table border="0" cellpadding="0" cellspacing="0" width="100%">

                                <tr>

                                    <td width="40" valign="top" style="padding-right: 15px;" class="section-icon">

                                        <!-- Replace with actual icon URL -->

                                        <img src="https://fiind-dev.s3.amazonaws.com/static/email_assets/handshake.png" alt="" width="32" style="display: block; width: 32px;">

                                    </td>

                                    <td valign="top" class="section-text">

                                        <div style="font-weight: bold; font-size: 18px; color: #000000; padding-bottom: 5px;">Har du spørgsmål?</div>

                                        <div style="color: #333333;">Du kan kontakte os direkte på <a href="tel:\${outlet_contact_number}" style="color: #007bff; text-decoration: underline;">\${outlet_contact_number}</a>.</div>

                                    </td>

                                </tr>

                            </table>

                        </td>

                    </tr>



                    <!-- NOTE: "What to expect" and "Change booking" sections are omitted as per image 3 -->



                </table>

                <!-- /Inner Content Table -->

                <!--[if (gte mso 9)|(IE)]>

                </td>

                </tr>

                </table>

                <![endif]-->

            </td>

        </tr>

    </table>

    <!-- /Outer Background & Centering Table -->

</body>

</html>`,
    },
    EmailFormrequest: {
        email_sub: 'Din booking er blevet aflyst!',
        email_body: `<!DOCTYPE html> <html lang="da"> 
         <head>    
          <meta charset="UTF-8">  
             <meta name="viewport" content="width=device-width, initial-scale=1.0">   
               <meta http-equiv="X-UA-Compatible" content="IE=edge">   
                 <title>Udfyld dine oplysninger</title>
                      <style type="text/css">      
                         body,         table,         td,         a {             -webkit-text-size-adjust: 100%;             -ms-text-size-adjust: 100%;         }        
                           table,       
                             td {             mso-table-lspace: 0pt;             mso-table-rspace: 0pt;         }   
                                    img {             -ms-interpolation-mode: bicubic;             border: 0;             height: auto;             line-height: 100%;             outline: none;             text-decoration: none;         }        
                                      table {             border-collapse: collapse !important;         }   
                                             body 
                                             {             height: 100% !important;             margin: 0 !important;             padding: 0 !important;             width: 100% !important;             background-color: #F5F5F5;             font-family: Arial, Helvetica, sans-serif;             font-size: 16px;             line-height: 1.5;             color: #333333;         }          /* Overall email background */         a {             color: #007BFF;             /* Standard blue link color */             text-decoration: underline;         }          /* Responsive */         @media screen and (max-width: 600px) {             .content-table {                 width: 100% !important;                 /* Make inner table full width */                 max-width: 100% !important;             }              .outer-padding {                 padding: 20px 10px !important;                 /* Reduce padding on mobile */             }              .icon-cell,             .section-icon {                 display: block !important;                 width: auto !important;                 padding-bottom: 5px !important;                 padding-right: 0 !important;                 text-align: left !important;                 /* Remove right padding */             }              .text-cell,             .section-text {                 padding-left: 0 !important;                 /* Reset padding for stacked layout */                 text-align: left !important;                 /* Center text on mobile */                 display: block !important;                 width: auto !important;             }         }     </style> </head>  <body>     <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F5F5F5;">         <tr>        
                                                  <td align="center" valign="top" class="outer-padding" style="padding: 40px 20px;">                
                                                   <table border="0" cellpadding="0" cellspacing="0" width="100%"                     style="max-width: 600px; background-color: #FFFFFF;" class="content-table">                     <tr>                         <td align="center" valign="top" style="padding: 30px 20px;">                             <img src="https://fiind-dev.s3.amazonaws.com/static/email_assets/fiind-logo.png"                                 alt="bahlou.dk Logo" width="150" style="display: block; border: 0; width: 150px;">                         </td>                     </tr>                     <tr>                         <td align="left" valign="top"                             style="padding: 0 20px 20px 20px; font-size: 20px; font-weight: bold; color: #000000;"> Hej                             \${customer_name},                         </td>                     </tr>                     <tr>                         <td align="left" valign="top"                             style="padding: 0 20px 30px 20px; font-size: 18px; color: #333333;"> Du er blevet tilmeldt                             en samtale med Læge. Tom Haugland hos \${outlet_name}.<br><br> For at vi kan færdiggøre din                             booking, skal du først udfylde dine oplysninger.                         </td>                     </tr> <!-- CTA-knap -->                     <tr>                         <td align="center" style="padding: 0 20px 40px 20px;">                              <a href="\${form_link}" target="_blank" rel="noopener noreferrer"                                 style="font-size: 18px; font-family: Arial, sans-serif; color: #FFFFFF; background-color: #007BFF; text-decoration: none; padding: 14px 28px; border-radius: 5px; display: inline-block;">                                 Udfyld dine oplysninger her                             </a>                         </td>                     </tr>                 </table>             </td>         </tr>     </table> </body>  </html>`,
    },

    EmailFormConfirm: {
        email_sub: 'Din booking er blevet aflyst!',
        email_body: `<!DOCTYPE html> 
        <html lang="da">
         <head>   
           <meta charset="UTF-8">   
             <meta name="viewport" content="width=device-width, initial-scale=1.0">  
                <meta http-equiv="X-UA-Compatible" content="IE=edge">  
                   <title>Vi har modtaget dine oplysninger</title>  
                      <style type="text/css">      
                         body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }  
                                table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
                                         img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }   
                                               table { border-collapse: collapse !important; }     
                                                   body {             height: 100% !important;             margin: 0 !important;             padding: 0 !important;             width: 100% !important;             background-color: #F5F5F5;             font-family: Arial, Helvetica, sans-serif;             font-size: 16px;             line-height: 1.5;             color: #333333;         }    
                                                        a {             color: #007BFF;             text-decoration: underline;         }       
                                                          @media screen and (max-width: 600px) {             .content-table {                 width: 100% !important;                 max-width: 100% !important;             }    
                                                                   .outer-padding {                 padding: 20px 10px !important;             }             .icon-cell, .section-icon {                 display: block !important;                 width: auto !important;                 padding-bottom: 5px !important;                 padding-right: 0 !important;                 text-align: left !important;             }             .text-cell, .section-text {                 display: block !important;                 width: auto !important;                 padding-left: 0 !important;                 text-align: left !important;             }         }     </style> </head> <body>     <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F5F5F5;">         <tr>             <td align="center" valign="top" class="outer-padding" style="padding: 40px 20px;">                 <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #FFFFFF;" class="content-table">                     <tr>                         <td align="center" valign="top" style="padding: 30px 20px;">                             <img src="https://fiind-dev.s3.amazonaws.com/static/email_assets/fiind-logo.png" alt="bahlou.dk Logo" width="150" style="display: block; border: 0; width: 150px;">                         </td>                     </tr>                     <tr>                      
                                                                      <td align="left" valign="top" style="padding: 0 20px 10px 20px; font-size: 20px; font-weight: bold; color: #000000;">                             
                                                                   Hej \${customer_name},                        
                                                                    </td>                     </tr>                     <tr>                         <td align="left" valign="top" style="padding: 0 20px 30px 20px; font-size: 16px; color: #333333;"><br>                             :white_check_mark: <strong>Vi har modtaget dine oplysninger.</strong>
                                                                    <br><br>                             Din samtale med Læge. Tom Haugland hos \${outlet_name} er under forberedelse.<br><br>                             Du vil blive kontaktet snarest på telefon eller email, hvor I sammen arrangerer et passende tidspunkt for samtalen.                         </td>                     </tr>                 </table>             </td>         </tr>     </table> </body> </html>`,
    },

    EmailOnlineFormConfirm: {
        email_sub: 'Din Booking Bekræftelse',
        email_body: `<!DOCTYPE html>
<html lang="da">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Din Booking Bekræftelse</title>
    <style type="text/css">
        body,
        table,
        td,
        a {
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
        }

        table,
        td {
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
        }

        img {
            -ms-interpolation-mode: bicubic;
            border: 0;
            height: auto;
            line-height: 100%;
            outline: none;
            text-decoration: none;
        }

        table {
            border-collapse: collapse !important;
        }

        body {
            height: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            background-color: #f5f5f5;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 16px;
            line-height: 1.5;
            color: #333333;
        }

        a {
            color: #007bff;
            text-decoration: underline;
        }

        @media screen and (max-width: 600px) {
            .content-table {
                width: 100% !important;
                max-width: 100% !important;
            }

            .outer-padding {
                padding: 20px 10px !important;
            }

            .icon-cell,
            .section-icon {
                display: block !important;
                width: auto !important;
                padding-bottom: 5px !important;
                padding-right: 0 !important;
                text-align: left !important;
            }

            .text-cell,
            .section-text {
                display: block !important;
                width: auto !important;
                padding-left: 0 !important;
                text-align: left !important;
            }
        }
    </style>
</head>

<body>
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f5f5f5;">
        <tr>
            <td align="center" valign="top" class="outer-padding" style="padding: 40px 20px;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%"
                    style="max-width: 600px; background-color: #f5f5f5;" class="content-table">
                    <tr>
                        <td align="center" valign="top" style="padding: 0 20px 30px 20px;"> <img
                                src="https://fiind-dev.s3.amazonaws.com/static/email_assets/fiind-logo.png"
                                alt="fiind.app Logo" width="150" style="display: block; border: 0; width: 150px;"> </td>
                    </tr>
                    <tr>
                        <td align="left" valign="top"
                            style="padding: 0 20px 10px 20px; font-size: 20px; font-weight: bold; color: #000000;"> Hej
                            \${customer_name}, </td>
                    </tr>
                    <tr>
                        <td align="left" valign="top"
                            style="padding: 0 20px 30px 20px; color: #333333; font-size: 18px;"> Du har bestilt en
                            samtale hos \${outlet_name}! <br><br> Du skal til samtale med Læge. Tom Haugland.<br><br> Han
                            tager kontakt til dig snarest på telefon eller email og arrangerer et passende
                            tidspunkt.<br><br> </td>
                    </tr> <!-- Vigtig patientinformation -->
                    <tr>
                        <td align="left" valign="top" style="padding: 0 20px 30px 20px;">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td width="40" valign="top" style="padding-right: 15px;" class="section-icon"> <span
                                            style="font-size: 28px; line-height: 1;">📋</span> </td>
                                    <td valign="top" class="section-text">
                                        <div
                                            style="font-weight: bold; font-size: 18px; color: #000000; padding-bottom: 5px;">
                                            Vigtig patientinformation</div>
                                        <div style="color: #333333; padding-bottom: 15px;"> Hvis du har bestilt tid til
                                            Botox eller Ikke permanente fillers, skal du læse patientinformationen.
                                        </div>
                                        <div style="text-align: left;"> <a
                                                href="https://drive.google.com/drive/folders/18R3oim6g3yEahHfg6kNmggeLzcOM668T?usp=sharing"
                                                target="_blank"
                                                style="font-size: 16px; font-family: Arial, sans-serif; color: #ffffff; background-color: #007bff; text-decoration: none; padding: 12px 24px; border-radius: 4px; display: inline-block;">
                                                Læs patientinformation </a> </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr> <!-- Hvad kan du forvente -->
                    <tr>
                        <td align="left" valign="top" style="padding: 0 20px 30px 20px;">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td width="40" valign="top" style="padding-right: 15px;" class="section-icon"> <img
                                            src="https://fiind-dev.s3.amazonaws.com/static/email_assets/sparkles.png"
                                            alt="" width="32" style="display: block; width: 32px;"> </td>
                                    <td valign="top" class="section-text">
                                        <div
                                            style="font-weight: bold; font-size: 18px; color: #000000; padding-bottom: 5px;">
                                            Hvad kan du forvente?</div>
                                        <div style="color: #333333;">Vi sørger for, at du føler dig tryg og får den
                                            bedste oplevelse med din behandling.</div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr> <!-- Har du spørgsmål -->
                    <tr>
                        <td align="left" valign="top" style="padding: 0 20px 30px 20px;">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td width="40" valign="top" style="padding-right: 15px;" class="section-icon"> <img
                                            src="https://fiind-dev.s3.amazonaws.com/static/email_assets/handshake.png"
                                            alt="" width="32" style="display: block; width: 32px;"> </td>
                                    <td valign="top" class="section-text">
                                        <div
                                            style="font-weight: bold; font-size: 18px; color: #000000; padding-bottom: 5px;">
                                            Har du spørgsmål?</div>
                                        <div style="color: #333333;">Du kan kontakte os direkte på <a
                                                href="tel:\${outlet_contact_number}"
                                                style="color: #007bff; text-decoration: underline;">\${outlet_contact_number}</a>.
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr> <!-- Afbudspolitik -->
                    <tr>
                        <td align="left" valign="top" style="padding: 0 20px 40px 20px;">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td valign="top">
                                        <div
                                            style="font-weight: bold; font-size: 18px; color: #000000; padding-bottom: 5px;">
                                            Ændre din booking?</div>
                                        <div style="color: #333333;">Læs vores afbudspolitik <a
                                                href="\${cancellation_policy_url}"
                                                style="color: #007bff; text-decoration: underline;">her</a>.</div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>

</html>`,
    },

    // health declaration

    health_declaration_initial_email: {
        email_subject: 'Health declaration form submission',
        email_body: `<!DOCTYPE html>

<html lang="da">

<head>

    <meta charset="UTF-8">

    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <meta http-equiv="X-UA-Compatible" content="IE=edge">

    <title>Din Booking Bekræftelse</title>

    <style type="text/css">

        /* Basic Reset */

        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }

        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }

        img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }

        table { border-collapse: collapse !important; }

        body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #f5f5f5; } /* Overall email background */



        /* Main Styles */

        body {

            font-family: Arial, Helvetica, sans-serif;

            font-size: 16px;

            line-height: 1.5;

            color: #333333;

        }
        
          .button {
      text-align: center;
      margin: 30px 0;
    }
    .button a {
      background-color: #28a745;
      color: #ffffff;
      text-decoration: none;
      padding: 12px 24px;
      border-radius: 4px;
      font-size: 15px;
      display: inline-block;
    }





        /* Responsive */

        @media screen and (max-width: 600px) {

            .content-table {

                width: 100% !important; /* Make inner table full width */

                max-width: 100% !important;

            }

            .outer-padding {

                 padding: 20px 10px !important; /* Reduce padding on mobile */

            }

             .icon-cell {

                 display: block !important;

                 width: auto !important;

                 padding-bottom: 5px !important;

                 padding-right: 0 !important; /* Remove right padding */

             }

             .text-cell {

                 display: block !important;

                 width: auto !important;

                 padding-left: 0 !important; /* Reset padding for stacked layout */

             }

             .section-icon {

                 padding-bottom: 10px !important;

                 padding-right: 0 !important; /* Remove right padding */

                 text-align: center !important; /* Center icons on mobile */

                 width: 100% !important; /* Allow icon to take full width for centering */

                 display: block !important;

             }

              .section-text {

                 padding-left: 0 !important; /* Reset padding for stacked layout */

                 text-align: center !important; /* Center text on mobile */

                 display: block !important;

                 width: 100% !important;

              }

        }



    </style>

</head>

<body style="margin: 0; padding: 0; width: 100%; background-color: #f5f5f5;">

    <!-- Outer Background & Centering Table -->

    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f5f5f5;">

        <tr>

            <td align="center" valign="top" class="outer-padding" style="padding: 40px 20px;">

                <!--[if (gte mso 9)|(IE)]>

                <table align="center" border="0" cellspacing="0" cellpadding="0" width="600">

                <tr>

                <td align="center" valign="top" width="600">

                <![endif]-->

                <!-- Inner Content Table (Fixed Width on Desktop) -->

                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #f5f5f5;" class="content-table">



                    <!-- Logo Section -->

                    <tr>

                        <td align="center" valign="top" style="padding: 0 20px 30px 20px;"> <!-- Add horizontal padding inside content area -->

                           <!-- Make sure to replace placeholder image URL -->

                           <img src="https://fiind-dev.s3.amazonaws.com/static/email_assets/fiind-logo.png" alt="fiind.app Logo" width="150" style="display: block; border: 0; width: 150px;">

                        </td>

                    </tr>



                    <!-- Greeting Section -->

                    <tr>

                        <td align="left" valign="top" style="padding: 0 20px 10px 20px; font-size: 20px; font-weight: bold; color: #000000;">

                            Hej \${customer_name},

                        </td>

                    </tr>

                    <tr>

                        <td align="left" valign="top" style="padding: 0 20px 20px 20px; color: #333333;">

                              <p>
        For your upcoming visit to <strong>\${outlet_name}</strong>, we kindly
        request that you complete the required <strong>Health Declaration Form</strong>
        prior to your appointment.
      </p>
                        </td>

                    </tr>



                    <!-- Service Details -->

                    <tr>

                        <td align="left" valign="top" style="padding: 0 20px 30px 20px; font-size: 18px; color: #333333;">

                            \${service_name}

                        </td>

                    </tr>



                    <!-- Date Section -->

                    <tr>

                        <td align="left" valign="top" style="padding: 0 20px 15px 20px;">

                            <table border="0" cellpadding="0" cellspacing="0" width="100%">

                                <tr>

                                    <td width="30" valign="middle" style="padding-right: 10px;" class="icon-cell">

                                        <!-- Replace with actual icon URL -->

                                        <img src="https://fiind-dev.s3.amazonaws.com/static/email_assets/calendar.png" alt="Dato" width="24" style="display: block; width: 24px;">

                                    </td>

                                    <td valign="middle" style="color: #333333;" class="text-cell">

                                        Dato: \${booking_date}

                                    </td>

                                </tr>

                            </table>

                        </td>

                    </tr>



                    <!-- Time Section -->

                    <tr>

                        <td align="left" valign="top" style="padding: 0 20px 15px 20px;">

                             <table border="0" cellpadding="0" cellspacing="0" width="100%">

                                <tr>

                                    <td width="30" valign="middle" style="padding-right: 10px;" class="icon-cell">

                                        <!-- Replace with actual icon URL -->

                                        <img src="https://fiind-dev.s3.amazonaws.com/static/email_assets/clock.png" alt="Tid" width="24" style="display: block; width: 24px;">

                                    </td>

                                    <td valign="middle" style="color: #333333;" class="text-cell">

                                        Tid: \${booking_time}

                                    </td>

                                </tr>

                            </table>

                        </td>

                    </tr>



                    <!-- Address Section -->

                     <tr>

                        <td align="left" valign="top" style="padding: 0 20px 40px 20px;">

                             <table border="0" cellpadding="0" cellspacing="0" width="100%">

                                <tr>

                                    <td width="30" valign="middle" style="padding-right: 10px;" class="icon-cell">

                                         <!-- Replace with actual icon URL -->

                                        <img src="https://fiind-dev.s3.amazonaws.com/static/email_assets/location.png" alt="Adresse" width="24" style="display: block; width: 24px;">

                                    </td>

                                    <td valign="middle" style="color: #333333;" class="text-cell">

                                        Adresse: \${outlet_address}

                                    </td>

                                </tr>

                            </table>

                        </td>

                    </tr>



                    <!-- What to expect Section -->

                     <tr>

                        <td align="left" valign="top" style="padding: 0 20px 30px 20px;">

  <p>
        Please complete the health declaration by clicking the button below.
        This is mandatory before your visit.
      </p>


                        </td>

                    </tr>

<tr>
  <td align="center" style="padding: 30px 20px;">
    <a href="\${booking_link}"
       target="_blank"
       style="
         background-color:#28a745;
         color:#ffffff;
         text-decoration:none;
         padding:12px 24px;
         border-radius:4px;
         font-size:15px;
         display:inline-block;
         font-family: Arial, Helvetica, sans-serif;
       ">
      Complete Health Declaration
    </a>
  </td>
</tr>


<tr>
    <td>
              <p>Kind regards,<br />\${outlet_name} Team</p>

    </td>
</tr>



                </table>

                <!-- /Inner Content Table -->

                <!--[if (gte mso 9)|(IE)]>

                </td>

                </tr>

                </table>

                <![endif]-->

            </td>

        </tr>

    </table>

    <!-- /Outer Background & Centering Table -->

</body>

</html>`,
    },
    health_declaration_reminder_email: {
        email_subject: 'Health declaration form submission reminder',
        email_body: `<!DOCTYPE html>

<html lang="da">

<head>

    <meta charset="UTF-8">

    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <meta http-equiv="X-UA-Compatible" content="IE=edge">

    <title>Din Booking Bekræftelse</title>

    <style type="text/css">

        /* Basic Reset */

        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }

        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }

        img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }

        table { border-collapse: collapse !important; }

        body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #f5f5f5; } /* Overall email background */



        /* Main Styles */

        body {

            font-family: Arial, Helvetica, sans-serif;

            font-size: 16px;

            line-height: 1.5;

            color: #333333;

        }
        
          .button {
      text-align: center;
      margin: 30px 0;
    }
    .button a {
      background-color: #28a745;
      color: #ffffff;
      text-decoration: none;
      padding: 12px 24px;
      border-radius: 4px;
      font-size: 15px;
      display: inline-block;
    }





        /* Responsive */

        @media screen and (max-width: 600px) {

            .content-table {

                width: 100% !important; /* Make inner table full width */

                max-width: 100% !important;

            }

            .outer-padding {

                 padding: 20px 10px !important; /* Reduce padding on mobile */

            }

             .icon-cell {

                 display: block !important;

                 width: auto !important;

                 padding-bottom: 5px !important;

                 padding-right: 0 !important; /* Remove right padding */

             }

             .text-cell {

                 display: block !important;

                 width: auto !important;

                 padding-left: 0 !important; /* Reset padding for stacked layout */

             }

             .section-icon {

                 padding-bottom: 10px !important;

                 padding-right: 0 !important; /* Remove right padding */

                 text-align: center !important; /* Center icons on mobile */

                 width: 100% !important; /* Allow icon to take full width for centering */

                 display: block !important;

             }

              .section-text {

                 padding-left: 0 !important; /* Reset padding for stacked layout */

                 text-align: center !important; /* Center text on mobile */

                 display: block !important;

                 width: 100% !important;

              }

        }



    </style>

</head>

<body style="margin: 0; padding: 0; width: 100%; background-color: #f5f5f5;">

    <!-- Outer Background & Centering Table -->

    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f5f5f5;">

        <tr>

            <td align="center" valign="top" class="outer-padding" style="padding: 40px 20px;">

                <!--[if (gte mso 9)|(IE)]>

                <table align="center" border="0" cellspacing="0" cellpadding="0" width="600">

                <tr>

                <td align="center" valign="top" width="600">

                <![endif]-->

                <!-- Inner Content Table (Fixed Width on Desktop) -->

                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #f5f5f5;" class="content-table">



                    <!-- Logo Section -->

                    <tr>

                        <td align="center" valign="top" style="padding: 0 20px 30px 20px;"> <!-- Add horizontal padding inside content area -->

                           <!-- Make sure to replace placeholder image URL -->

                           <img src="https://fiind-dev.s3.amazonaws.com/static/email_assets/fiind-logo.png" alt="fiind.app Logo" width="150" style="display: block; border: 0; width: 150px;">

                        </td>

                    </tr>



                    <!-- Greeting Section -->

                    <tr>

                        <td align="left" valign="top" style="padding: 0 20px 10px 20px; font-size: 20px; font-weight: bold; color: #000000;">

                            Hej \${customer_name},

                        </td>

                    </tr>

                    <tr>

                        <td align="left" valign="top" style="padding: 0 20px 20px 20px; color: #333333;">
                            
                              <p>
       This is <strong>Reminder</strong> to complete the health declaration form before your visit to <strong>\${outlet_name}</strong>, we kindly
        request that you complete the required <strong>Health Declaration Form</strong>
        prior to your appointment.
      </p>
                        </td>

                    </tr>



                    <!-- Service Details -->

                    <tr>

                        <td align="left" valign="top" style="padding: 0 20px 30px 20px; font-size: 18px; color: #333333;">

                            \${service_name}

                        </td>

                    </tr>



                    <!-- Date Section -->

                    <tr>

                        <td align="left" valign="top" style="padding: 0 20px 15px 20px;">

                            <table border="0" cellpadding="0" cellspacing="0" width="100%">

                                <tr>

                                    <td width="30" valign="middle" style="padding-right: 10px;" class="icon-cell">

                                        <!-- Replace with actual icon URL -->

                                        <img src="https://fiind-dev.s3.amazonaws.com/static/email_assets/calendar.png" alt="Dato" width="24" style="display: block; width: 24px;">

                                    </td>

                                    <td valign="middle" style="color: #333333;" class="text-cell">

                                        Dato: \${booking_date}

                                    </td>

                                </tr>

                            </table>

                        </td>

                    </tr>



                    <!-- Time Section -->

                    <tr>

                        <td align="left" valign="top" style="padding: 0 20px 15px 20px;">

                             <table border="0" cellpadding="0" cellspacing="0" width="100%">

                                <tr>

                                    <td width="30" valign="middle" style="padding-right: 10px;" class="icon-cell">

                                        <!-- Replace with actual icon URL -->

                                        <img src="https://fiind-dev.s3.amazonaws.com/static/email_assets/clock.png" alt="Tid" width="24" style="display: block; width: 24px;">

                                    </td>

                                    <td valign="middle" style="color: #333333;" class="text-cell">

                                        Tid: \${booking_time}

                                    </td>

                                </tr>

                            </table>

                        </td>

                    </tr>



                    <!-- Address Section -->

                     <tr>

                        <td align="left" valign="top" style="padding: 0 20px 40px 20px;">

                             <table border="0" cellpadding="0" cellspacing="0" width="100%">

                                <tr>

                                    <td width="30" valign="middle" style="padding-right: 10px;" class="icon-cell">

                                         <!-- Replace with actual icon URL -->

                                        <img src="https://fiind-dev.s3.amazonaws.com/static/email_assets/location.png" alt="Adresse" width="24" style="display: block; width: 24px;">

                                    </td>

                                    <td valign="middle" style="color: #333333;" class="text-cell">

                                        Adresse: \${outlet_address}

                                    </td>

                                </tr>

                            </table>

                        </td>

                    </tr>



                    <!-- What to expect Section -->

                     <tr>

                        <td align="left" valign="top" style="padding: 0 20px 30px 20px;">

  <p>
        Please complete the health declaration by clicking the button below.
        This is mandatory before your visit.
      </p>


                        </td>

                    </tr>

<tr>
  <td align="center" style="padding: 30px 20px;">
    <a href="\${booking_link}"
       target="_blank"
       style="
         background-color:#28a745;
         color:#ffffff;
         text-decoration:none;
         padding:12px 24px;
         border-radius:4px;
         font-size:15px;
         display:inline-block;
         font-family: Arial, Helvetica, sans-serif;
       ">
      Complete Health Declaration
    </a>
  </td>
</tr>


<tr>
    <td>
              <p>Kind regards,<br />\${outlet_name} Team</p>

    </td>
</tr>



                </table>

                <!-- /Inner Content Table -->

                <!--[if (gte mso 9)|(IE)]>

                </td>

                </tr>

                </table>

                <![endif]-->

            </td>

        </tr>

    </table>

    <!-- /Outer Background & Centering Table -->

</body>

</html>`,
    },
    AdvanceReminderKeywords: [
        'customer_name',
        'booking_date',
        'booking_time_start',
        'booking_time_end',
        'selected_services',
        'outlet_name',
        'outlet_email',
        'outlet_address',
        'outlet_city',
        'outlet_zip',
        'outlet_phone_number',
    ],
};
