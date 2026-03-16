import {
  Box,
  Button,
  CircularProgress,
  Modal,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import FButton from "../../../commonComponents/F_Button";
import FSelect from "../../../commonComponents/F_Select";
import CommonServiceModal from "./CommonServiceModal";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import apiFetcher from "../../../../utils/interCeptor";
import { HttpStatusCode } from "axios";
import { t } from "i18next";
import moment from "moment";

const ArchieveModal = ({
  ArchiveModalOpen,
  setArchiveModalOpen,
  selectedArchieve,
  Archieve,
  name,
  updatedDate,
}) => {
  const [data, setData] = useState([]);
  const [id, setID] = useState(Archieve?.length > 0 ? Archieve[0]?.id : null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [downloading, setDownloading] = useState(false);
  const [archive, setArchive] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!data) return toast.error(t("Customer.ArchErrToast"));
    if (!id) return toast.error(t("Customer.GrpErr"));
    if (selectedIds.length === 0) return toast.error(t("Customer.JournalselectError"));

    try {
      const obj = {
        archive_id: id,
        journal_ids: Object.values(selectedIds).flatMap((ids) => ids),
      };

      await apiFetcher.patch("/api/v1/store/archive", obj).then((res) => {
        if (res.data.success) {
          toast.success(t("Customer.JournalArchieveUpdatedSuccess"));
          setSelectedIds([]);
          setArchive(null);
          setArchiveModalOpen(false);
        }
      });
    } catch (error) {
      console.error(error);
      setArchiveModalOpen(false);
      setSelectedIds([]);
      setArchive(null);
      toast.error(t("Common.ToastWrong"));
    }
  };

  useEffect(() => {
    const getData = async () => {
      setLoading(true);

      if (selectedArchieve)

        try {
          await apiFetcher
            .get(`/api/v1/store/archive/${selectedArchieve}`)
            .then((res) => {
              setArchive(res.data.data.journals);
              setLoading(false);
            })

        } catch (error) {
          console.error(error)

        }

    };

    getData(); // add error handling}
  }, [ArchiveModalOpen, selectedArchieve]);


  const handlePrint = async () => {

    setDownloading(true);
    const obj = Object.values(selectedIds)
      .flatMap((ids) => ids)
      .join(", ");

    if (!data) return (
      setDownloading(false),
      toast.error(t("Customer.ArchErrToast"))
    )

    if (!id) return (
      toast.error(t("Customer.GrpErr")),
      setDownloading(false)
    );

    if (obj.length === 0) return (
      toast.error(t("Customer.ArchievePrintErr")),
      setDownloading(false)
    )

    try {
      const response = await apiFetcher.get(
        `/api/v1/store/journal/pdf?journal_ids=${obj}`,
        { responseType: "blob" }
      );
      if (response.status === HttpStatusCode.Ok) {
        const blob = new Blob([response.data], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `journal-${id}.pdf`;
        link.click();
        URL.revokeObjectURL(url);
        setSelectedIds([]);
        setDownloading(false);
      }
    } catch (error) {
      toast.error(t("Customer.PDFError"));
      setDownloading(false);
    }
  };

  if (loading) {
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "80vh", // Full height
      }}
    >
      <CircularProgress size={"2.5rem"} sx={{ color: "#6f6f6f" }} />
    </Box>;
  }

  return (
    <>
      <Modal
        open={ArchiveModalOpen}
        onClose={() => setArchiveModalOpen(false)}
        disableAutoFocus
        sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <Paper
          sx={{
            maxHeight: "95%",
            overflowY: "scroll",
            scrollbarWidth: 'none',
            width: { xs: '90%', md: "70%" },
            borderRadius: "10px",
            p: 4,
          }}
        >
          <Stack
            sx={{
              width: "100%",
              display: "flex",
              justifyContent: "space-between",
              flexDirection: { xs: "column", md: 'row' },
              mt: -1,
              gap: 2
            }}
          >
            <Typography variant="body1" fontWeight={700} display={"flex"} sx={{ flexDirection: { xs: "column", md: 'row' }, }}>
              {t("Customer.Archive")}
              <Typography
                variant="body1"
                fontWeight={400}
                sx={{ ml: 0.2 }}
                color="#1F1F1F"
              >
                - {" "}
                {name ? name : t("Customer.ArchName")}
              </Typography>
            </Typography>

            <Typography variant="body2" color="#545454" mt={-1} fontWeight={400}>
              {/* Updated: 24/12-2024 13:39 */}
              {`${t("Customer.Updated")}: ${moment(updatedDate, "YYYY-MM-DDTHH:mm:ss").format("DD-MM-YYYY HH:mm")}
`}
            </Typography>
          </Stack>
          {loading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "80vh", // Full height
              }}
            >
              <CircularProgress size={"2.5rem"} sx={{ color: "#000" }} />
            </Box>
          )

            : (
              <CommonServiceModal
                selectedIds={selectedIds}
                setSelectedIds={setSelectedIds}
                height={"78%"}
                setData={setData}
                Data={data}
                archive={archive && archive}
              />
            )}

          <Stack
            sx={{
              width: "100%",
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              justifyContent: "space-between",
            }}
          >
            <Stack
              sx={{
                width: { xs: '100%', md: "50%" },
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                gap: 2,
              }}
            >
              {/* <FButton
            icon={back}
              sx={{ backgroundColor: "#D9D9D9", height: "35%" }}
              variant={"delete"}
              title={"back"}
            /> */}
              <Button
                onClick={() => setArchiveModalOpen(false)}
                disableRipple={true}
                sx={{
                  padding: "10px 20px",
                  textTransform: "none",
                  opacity: "0px",
                  borderRadius: "25px",
                  fontWeight: 700,
                  color: "white",
                  width: { xs: "100%", md: "25%" },
                  backgroundColor: "#D9D9D9",
                  height: archive?.length > 0 ? "35%" : 40,
                  boxShadow: "none",
                }}
              >
                <Typography
                  style={{
                    marginLeft: 5,
                    marginRight: 5,
                  }}
                >
                  {t("Common.Back")}
                </Typography>
              </Button>

              {/* <FButton
                minwidth={"25%"}
                onClick={() => setArchiveModalOpen(false)}
                sx={{ backgroundColor: "#D9D9D9", height: "35%" }}
                variant={"save"}
                title={
                  downloading ? (
                    <CircularProgress size="1.5rem" sx={{ color: "#fff" }} />
                  ) : (
                    t("Common.Back")
                  )
                }
              /> */}

              {archive?.length > 0 && (
                <FButton
                  onClick={handlePrint}
                  sx={{ backgroundColor: "#D9D9D9", height: "35%" }}
                  variant={"save"}
                  title={
                    downloading ? (
                      <CircularProgress size="1.5rem" sx={{ color: "#fff" }} />
                    ) : (
                      t("Customer.PrintPDF")
                    )
                  }
                />
              )}
            </Stack>

            {archive?.length > 0 && (
              <Stack sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Stack
                  sx={{
                    // mt: -0.7,
                    display: "flex",
                    flexDirection: "column",
                    gap: 0.5,
                  }}
                >
                  <Typography variant="body2">
                    {t("Customer.MoveToArch")}
                  </Typography>

                  <FSelect
                    defaultValue={Archieve && Archieve[0]?.id}
                    onChange={(e) => setID(e.target.value)}
                    options={
                      Archieve &&
                      Archieve.map((itemm) => ({
                        value: itemm?.id,
                        label: itemm?.name,
                      }))
                    }
                    placeholderText={t("Customer.Archive")}
                  />
                </Stack>
                <FButton
                  onClick={() => {
                    handleSubmit();
                  }}
                  sx={{ mt: 1 }}
                  title={t("Customer.MoveToArch")}
                  variant={"save"}
                />
              </Stack>
            )}
          </Stack>
        </Paper>
      </Modal>
    </>
  );
};

export default ArchieveModal;
