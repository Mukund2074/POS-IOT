import { Stack, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import FPrimaryHeading from "../../../commonComponents/F_PrimaryHeading";
import "react-quill/dist/quill.snow.css";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AccordionDetails from "@mui/material/AccordionDetails";

import apiFetcher from "../../../../utils/interCeptor";
import CommonFormikModal from "./CommonFormikModal";
import { t } from "i18next";
import moment from "moment";

const ArchieveFooter = ({
  dataa,
  prove,
  setProvoke,
  Logs,
  changeSequence,
  setData,
  setLogsProvoke,
  setIsDirty,

}) => {

  const [template, setTemplate] = useState(null);

  useEffect(() => {
    async function getdata() {
      try {
        const res = await apiFetcher.get(
          `api/v1/store/journal/group/list`
        );
        const templatesData = res.data.data;
        setTemplate(templatesData);

      } catch (error) {
        console.error("error", error);
      }
    }

    getdata();
  }, [prove]);

  return (
    <Stack
      sx={{
        height: "100%",
        width: "100%",
        backgroundColor: "white",
        py: { xs: 2, md: 3 },
        px: { xs: 2, md: 4 },
        borderRadius: 4,
        mt: 2,
        overflow: "auto",
      }}
    >
      {dataa
        ?.sort((a, b) => a.group_sequence - b.group_sequence)
        ?.map((item) => {
          return (
            <>
              {(item.group_id !== null && item.group_id !== undefined) && (
                <CommonFormikModal
                  setLogsProvoke={setLogsProvoke}
                  dataa={dataa}
                  item={item}
                  setProvoke={setProvoke}
                  template={template}
                  changeSequence={changeSequence}
                  setData={setData}
                  setIsDirty={setIsDirty}
                />
              )}
            </>
          );
        })}

      <Accordion
        sx={{
          border: "1.5px solid #D9D9D9",
          boxShadow: "none",
          borderRadius: 2,
          "&:before": { display: "none" },
        }}
        disableGutters
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel3-content"
          id="panel3-header"
        >
          <FPrimaryHeading
            fontColor="#545454"
            fontSize="22px"
            text={t("Customer.Logs")}
          />
        </AccordionSummary>

        <AccordionDetails
          sx={{
            overflowX: "auto",
            scrollbarWidth: "none",
            p: 0,
          }}
        >
          {Logs?.length > 0 ? (
            <Stack
              sx={{
                width: "100%",
                flexDirection: "column",
                gap: 2,
                mt: -0.5,
              }}
            >
              {/* Header Row */}
              <Stack
                direction="row"
                // flexWrap="wrap"
                justifyContent="space-between"
                alignItems="center"
                sx={{
                  backgroundColor: "#f8f8f8",
                  py: 1,
                  px: { xs: 1, md: 2 },
                  minWidth: "700px",
                }}
              >
                <Typography
                  variant="body1"
                  fontWeight={800}
                  width="20%"
                  textAlign="left"
                >
                  {t("Customer.Incedent")}
                </Typography>
                <Typography
                  variant="body1"
                  fontWeight={800}
                  width="25%"
                  textAlign="left"
                >
                  {t("Common.Date")}
                </Typography>
                <Typography
                  variant="body1"
                  fontWeight={800}
                  width="25%"
                  textAlign="left"
                >
                  {t("Common.CapsEmployee")}
                </Typography>
                <Typography
                  variant="body1"
                  fontWeight={800}
                  width="25%"
                  textAlign="left"
                >
                  {t("Customer.IP")}
                </Typography>
              </Stack>

              {/* Data Rows */}
              {Logs.map((item, index) => (
                <Stack
                  key={item.id}
                  direction="row"
                  flexWrap="wrap"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{
                    pb: 1.8,
                    minWidth: "700px",
                    px: { xs: 1, md: 2 },
                    borderBottom:
                      index === Logs.length - 1
                        ? "none"
                        : "1.5px solid #D9D9D9",
                  }}
                >
                  <Typography variant="body2" width="20%" textAlign="left">
                    {item.event}
                  </Typography>
                  <Typography
                    variant="body2"
                    width="25%"
                    textAlign="left"
                    noWrap
                  >
                    {moment(item.created_at, "YYYY-MM-DDTHH:mm:ss").format(
                      "DD-MM-YYYY HH:mm"
                    )}
                  </Typography>
                  <Typography variant="body2" width="25%" textAlign="left">
                    {item.employee_name}
                  </Typography>
                  <Typography variant="body2" width="25%" textAlign="left">
                    {item.ip_address}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          ) : (
            <Typography
              sx={{
                textAlign: "center",
                fontSize: { xs: "16px", md: "20px" },
                fontWeight: "600",
                color: "rgba(0, 0, 0, 0.6)",
                mb: 2,
              }}
            >
              {t("Customer.NoLogs")}
            </Typography>
          )}
        </AccordionDetails>
      </Accordion>
    </Stack>

  );
};

export default ArchieveFooter;
