export const DefaultEmail = {
    custom_email: {
        email_subject: `Husk din tid i morgen til`,
        default_body_content: `<!DOCTYPE html>

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

                            Husk at du har en booking hos \${outlet_name} <strong style="font-weight: bold; color: #000000;">i morgen</strong> kl. <strong style="font-weight: bold; color: #000000;">\${booking_time_start}</strong>!<br>

                            Her er detaljerne for din booking:

                        </td>

                    </tr>



                    <!-- Service Details -->

                    <tr>

                        <td align="left" valign="top" style="padding: 0 20px 30px 20px; font-size: 18px; color: #333333;">

                            1 x \${selected_services}

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

                                        Tid: \${booking_time_start}

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

                                        Adresse: \${outlet_phone_number}

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

                        </td>
                    </tr>
                    {{custom_content}}
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
};
