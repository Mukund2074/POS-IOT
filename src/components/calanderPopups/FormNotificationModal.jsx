import React, { useCallback, useEffect, useState } from "react";
import {
  Stack,
  Grid2,
  Divider,
  Typography,
  Modal,
  Paper,
  IconButton,
} from "@mui/material";
import { t } from "i18next";
import { Close } from "@mui/icons-material";
import FButton from "../../components/commonComponents/F_Button";
import FPrimaryHeading from "../../components/commonComponents/F_PrimaryHeading";
import { formatPhoneNumber } from "../calanderComponents/booking/utils/functions";
import FSwitch from "../commonComponents/f-switch";
import { SendFormEmailApi, SendFormSmsApi } from "../../utils/Api/Booking";
import { toast } from "react-toastify";
import { HttpStatusCode } from "axios";
import { useSelector } from "react-redux";
import moment from "moment";
import SendEmailModal from "../customer/customerDetail/Advanced-journal/popup/SendEmailModal";
import apiFetcher from "../../utils/interCeptor";
// import {useGetCustomer} from './CuromerGetapi'

const commonStackStyle = {
  display: "flex",
  width: "100%",
  flexDirection: "row",
  justifyContent: "space-between",
  py: 0.5,
  px: 3,
};

const detailsTextStyle = {
  width: "75%",
  wordWrap: "break-word",
  overflowWrap: "break-word",
  textAlign: "right",
};

const commonDevider = {
  borderBottomWidth: 2,
  borderColor: "#D9D9D9",
  mr: 1.5,
  ml: 1.5,
};

export default function FormNotificationModal({ open, closeForm, data }) {
  const [resendMode, setResendMode] = useState({
    email: false,
    sms: false,
    HaveEmail:''
  });
  const metaData = data?.meta_data;
  const setting = useSelector((state) => state?.settings?.data);
  const [showEmailmodel,setshowEmailmodel] = useState(false)
  const fetchCustomerdata = async (id) =>
  {
    const res = await apiFetcher(`api/v1/store/customer/${id}`)
    setResendMode({ ...resendMode, HaveEmail: res.data.data.email })
     
  }

  useEffect(()=>
  {
    fetchCustomerdata(metaData[0].customer_id)
  },[])

  const handleSubmit = async (values) => {
      let res = await apiFetcher.patch(`api/v1/store/customer/outlet?id=${data?.meta_data[0]?.customer_id}`, {
          email: values?.email,
          name: data?.customer_name,
          phone_number: data?.customer_phone,
      });
      toast.success(t('Customer.CustomerUpdateSuccess'));
      setshowEmailmodel(false);
      closeForm()
  };

  const DetailsFieldUi = ({ label, value }) => {
    return (
      <React.Fragment>
        <Stack sx={commonStackStyle}>
          <Typography
            variant="body1"
            sx={{
              whiteSpace: "nowrap",
              color: "#1F1F1F",
              width: "25%",
              fontWeight: 700,
            }}
          >
            {label}
          </Typography>
          <Typography
            variant="body1"
            sx={{ ...detailsTextStyle, textAlign: "right" }}
          >
            {value}
          </Typography>
        </Stack>
        <Divider sx={commonDevider} />
      </React.Fragment>
    );
  };

  const handleResend = async () => {
    try {
      if (resendMode.email) {
        const res = await SendFormEmailApi({ id: data?.id });
        if (
          res.status === HttpStatusCode.Ok ||
          res.status === HttpStatusCode.Created
        ) {
          toast.success(t("Calendar.SendEmailSuccess"));
        }
        // send email
      }
      if (resendMode.sms) {
        const res = await SendFormSmsApi({ id: data?.id });
        if (
          res.status === HttpStatusCode.Ok ||
          res.status === HttpStatusCode.Created
        ) {
          toast.success(t("Calendar.SendSmsSuccess"));
        }
        // send sms
      }
    } catch (error) {
      toast.error(t("Calendar.SendFormError"));
    } finally {
      closeForm();
    }
  };
  return (
    <Modal
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
      }}
      onClose={closeForm}
      open={open}
      disableAutoFocus
    >
      <Paper
        sx={{
          position: "relative",
          px: { xs: 1.5, md: 5 },
          py: { xs: 2, md: 3 },
          minWidth: { xs: "95%", md: "60%" },
          borderRadius: { xs: 5, md: 7 },
          overflow: "hidden",
          maxWidth: { xs: "95%", md: "80%" },
          maxHeight: "90%",
          overflowY: "scroll",
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": {
            display: "none",
          },
          msOverflowStyle: "none",
        }}
      >
        <IconButton
          aria-label="close"
          disableRipple
          sx={{ position: "absolute", right: 8, top: 8, color: "#6f6f6f" }}
          onClick={closeForm}
        >
          <Close />
        </IconButton>

        <React.Fragment>
          <FPrimaryHeading
            text={t("Calendar.FormDetails")}
            sx={{ fontSize: "20px", ml: 4 }}
          />
          <Grid2 marginTop={1} paddingBottom={1} container spacing={2}>
            <Grid2 item size={{ xs: 12, md: 5.75 }}>
              <Typography variant="body1" sx={{ fontWeight: 700, mt: 3 }}>
                {t("Insights.Customer")}
              </Typography>

              <Stack border={"1.5px solid #D9D9D9"} borderRadius={3} mt={1}>
                <DetailsFieldUi
                  label={t("Common.Name")}
                  value={data?.customer_name}
                />
                <DetailsFieldUi
                  label={t("Calendar.PhoneNo")}
                  value={formatPhoneNumber(data?.customer_phone)}
                />
                <DetailsFieldUi
                  label={t("Common.Email")}
                  value={data?.customer_email}
                />
              </Stack>

              <Typography variant="body1" sx={{ fontWeight: 700, mt: 3 }}>
                {t("Common.Services")}
              </Typography>

              {metaData &&
                metaData.length > 0 &&
                metaData.map((item, index) => (
                  <Stack
                    key={index}
                    border={"1.5px solid #D9D9D9"}
                    borderRadius={3}
                    mt={1}
                  >
                    <DetailsFieldUi
                      label={t("Common.Service")}
                      value={item?.service_name}
                    />
                    <DetailsFieldUi
                      label={t("Common.CapsEmployee")}
                      value={item?.employee_name}
                    />
                  </Stack>
                ))}

              {!data?.data && <Stack sx={{ mt: 3, display: 'flex', flexDirection: 'column' }}>
                <FSwitch
                  disabled={!setting?.profile?.enable_email}
                  label={t("Calendar.EmailConf")}
                  checked={resendMode.email}
                  // sx={{ mt: 3 }}
                  onChange={(e) =>{
                    setResendMode({ ...resendMode, email: e.target.checked })
                    if (!resendMode.HaveEmail) {
                      if (e.target.checked)
                        {
                          setshowEmailmodel(true);
                        } 
                    }
                  }}
                />
                
                    {
                    showEmailmodel && 
                    (<SendEmailModal
                            open={showEmailmodel}
                            onClose={() => {
                            setshowEmailmodel(false);
                            setResendMode({ ...resendMode, email: false });
                          }}
                          handleSubmit={handleSubmit}
                          />)
                    }

                <FSwitch
                  disabled={!setting?.profile?.enable_sms}
                  label={t("Calendar.SmsConf")}
                  checked={resendMode.sms}
                  onChange={(e) =>
                    setResendMode({ ...resendMode, sms: e.target.checked })
                  }
                />
              </Stack>}
            </Grid2>

            <Grid2
              item
              sx={{
                display: { xs: "none", md: "flex" },
                alignItems: "center",
                justifyContent: "center",
              }}
              size={{ xs: 12, md: 0.5 }}
            >
              <Divider
                orientation="vertical"
                sx={{
                  display: { xs: "none", md: "block" },
                  color: "#D9D9D9",
                  borderWidth: "0.5",
                  height: "100%",
                  width: "1px",
                }}
              />
            </Grid2>

            <Grid2 item size={{ xs: 12, md: 5.75 }}>
              <Typography variant="body1" sx={{ fontWeight: 700, mt: 3 }}>
                {t("Calendar.FormDetails")}
              </Typography>

              <Stack border={"1.5px solid #D9D9D9"} borderRadius={3} mt={1}>
                {!data?.data ? (
                  <Typography
                    variant="body1"
                    sx={{
                      height: 200,
                      textAlign: "center",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      fontWeight: 700,
                      p: 1,
                    }}
                  >
                    {t("Calendar.DidntSubmit")}
                  </Typography>
                ) : (
                  <React.Fragment>
                    <DetailsFieldUi
                      label={t("Common.Address")}
                      value={data?.data?.address}
                    />
                    <DetailsFieldUi
                      label={t("Common.ZipCode")}
                      value={data?.data?.zip_code}
                    />
                    <DetailsFieldUi
                      label={t("Common.City")}
                      value={data?.data?.city}
                    />
                    <DetailsFieldUi
                      label={t("Common.CPRNumber")}
                      value={data?.data?.cpr}
                    />
                    <DetailsFieldUi
                      label={t("Common.Birthday")}
                      value={data?.data?.birthday ? moment(data?.data?.birthday).format('DD/MM-YYYY') : ''}
                    />
                    <DetailsFieldUi
                      label={t("Common.Note")}
                      value={data?.data?.note}
                    />
                  </React.Fragment>
                )}
              </Stack>
            </Grid2>
          </Grid2>

          <Divider sx={{ borderWidth: "0.5", borderColor: "#696969" }} />

          <Stack
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              justifyContent: { xs: "center", md: "space-between" },
              alignItems: "center",
              gap: { xs: 3, md: 0 },
              mt: 2,
              mb: { xs: 4, md: 0 },
              px: { xs: 3, md: 5 },
            }}
          >
            <FButton
              height={{ xs: 50, md: 40 }}
              title={t("Common.Back")}
              variant={"save"}
              onClick={() => closeForm()}
              sx={{
                backgroundColor: "#D9D9D9",
                minWidth: { xs: "100%", md: "150px" },
                width: { xs: "100%", md: "auto" },
                borderRadius: 13,
                fontSize: { xs: "16px", md: "14px" },
              }}
            />

            {!data?.data && <FButton
              height={{ xs: 50, md: 40 }}
              title={t("Calendar.Resend")}
              variant={"save"}
              disabled={!(resendMode.email || resendMode.sms)}
              onClick={() => handleResend()}
              sx={{
                backgroundColor: !(resendMode.email || resendMode.sms) ? '#90EE90' : undefined,
                minWidth: { xs: "100%", md: "150px" },
                width: { xs: "100%", md: "auto" },
                borderRadius: 13,
                fontSize: { xs: "16px", md: "14px" },
              }}
            />}
          </Stack>
        </React.Fragment>
      </Paper>
    </Modal>
  );
}
